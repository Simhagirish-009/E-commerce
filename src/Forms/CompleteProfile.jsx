import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  FloatingLabel,
} from "react-bootstrap";
import { complete_profile , fetchStates} from "../apis/form_apis";
import { toast ,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    phone_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
  });
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const response = await fetchStates();
        setStates(response.data.states);
      } catch (error) {
        console.error("Error fetching states:", error);
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
  }, []);

  const validateForm = () => {
    let newErrors = {};

    // Phone validation
    if (!/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Phone number must be exactly 10 digits.";
    }

    // Zip validation
    if (!/^\d{6}$/.test(formData.zip_code)) {
      newErrors.zip_code = "Zip code must be exactly 6 digits.";
    }

    if (!formData.address_line1.trim()) {
      newErrors.address_line1 = "Address line 1 is required.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");
      await complete_profile(formData, token);

      setSuccess(true);
      toast.success("Profile updated successfully!"); 
      setFormData({
        phone_number: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        zip_code: "",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <Card className="w-75 p-4">
        <h2 className="mb-4">Complete Your Profile</h2>

        {success && (
          <Alert variant="success">Profile updated successfully!</Alert>
        )}

        <Form onSubmit={submitHandler}>
          {/* Phone */}
          <FloatingLabel label="Phone Number" className="mb-3">
            <Form.Control
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              isInvalid={!!errors.phone_number}
              placeholder="Enter phone"
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone_number}
            </Form.Control.Feedback>
          </FloatingLabel>

          {/* Address 1 */}
          <FloatingLabel label="Address line 1" className="mb-3">
            <Form.Control
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              isInvalid={!!errors.address_line1}
              placeholder="Enter address"
            />
            <Form.Control.Feedback type="invalid">
              {errors.address_line1}
            </Form.Control.Feedback>
          </FloatingLabel>

          {/* Address 2 */}
          <FloatingLabel label="Address line 2" className="mb-3">
            <Form.Control
              type="text"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
              placeholder="Optional"
            />
          </FloatingLabel>

          {/* City */}
          <FloatingLabel label="City" className="mb-3">
            <Form.Control
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              isInvalid={!!errors.city}
              placeholder="Enter city"
            />
            <Form.Control.Feedback type="invalid">
              {errors.city}
            </Form.Control.Feedback>
          </FloatingLabel>

          <FloatingLabel label="State" className="mb-3">
            <Form.Select
              name="state"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              isInvalid={!!errors.state}
              disabled={loadingStates}
            >
              <option value="">
                {loadingStates ? "Loading states..." : "Select State"}
              </option>

              {states.map((state, index) => (
                <option key={index} value={state}>
                  {state}
                </option>
              ))}
            </Form.Select>

            <Form.Control.Feedback type="invalid">
              {errors.state}
            </Form.Control.Feedback>
          </FloatingLabel>
          {/* Zip */}
          <FloatingLabel label="Zip Code" className="mb-3">
            <Form.Control
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              isInvalid={!!errors.zip_code}
              placeholder="Enter zip"
            />
            <Form.Control.Feedback type="invalid">
              {errors.zip_code}
            </Form.Control.Feedback>
          </FloatingLabel>

          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Submit"}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CompleteProfile;
