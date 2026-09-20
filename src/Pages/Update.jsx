import React, { useEffect, useState } from "react";
import { Container, Form, Button, Card, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import axiosInstance from "../apis/axiosInstance";

const Update = () => {
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    phone_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
  });

  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("access_token");

  // Fetch current user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(
          "http://e-commerce-zhu2.onrender.com/api/customer/me/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setFormData(res.data);

        // Optional: fetch states from backend
        const statesRes = await axiosInstance.get(
          "http://e-commerce-zhu2.onrender.com/api/states/",
        );
        setStates(statesRes.data.states);

        setLoading(false);
      } catch (err) {
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const changeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await axiosInstance.put(
        "http://e-commerce-zhu2.onrender.com/api/customer/update/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "Update failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="mt-4 d-flex justify-content-center">
      <Card className="p-4 w-75 shadow">
        <h3 className="mb-3">Update Profile</h3>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="user_name"
              value={formData.user_name}
              onChange={changeHandler}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={changeHandler}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={changeHandler}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address Line 1</Form.Label>
            <Form.Control
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={changeHandler}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address Line 2</Form.Label>
            <Form.Control
              type="text"
              name="address_line2"
              value={formData.address_line2}
              onChange={changeHandler}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={formData.city}
              onChange={changeHandler}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>State</Form.Label>
            <Form.Select
              name="state"
              value={formData.state}
              onChange={changeHandler}
              required
            >
              <option value="">Select State</option>
              {states.map((state, index) => (
                <option key={index} value={state}>
                  {state}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>ZIP Code</Form.Label>
            <Form.Control
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={changeHandler}
              required
            />
          </Form.Group>

          <Button type="submit" disabled={saving}>
            {saving ? "Updating..." : "Update"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Update;
