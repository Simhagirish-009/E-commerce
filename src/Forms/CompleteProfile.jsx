import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  FloatingLabel,
  ListGroup,
} from "react-bootstrap";
import { LocateFixed } from "lucide-react";
import { complete_profile, fetchStates } from "../apis/form_apis";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

// Free, no-API-key geocoding via OpenStreetMap's Nominatim.
// For production traffic, consider a paid provider (Google/Mapbox) or
// self-hosting Nominatim — their public usage policy caps request rate.
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

// Builds the most precise address line we can from Nominatim's parsed
// components (building/house, road, neighbourhood) instead of just
// "house_number road", so nothing specific gets dropped. Falls back to
// the first couple of segments of the full display_name if the address
// object is sparse.
const buildExactAddress = (addr, displayName) => {
  const parts = [
    addr.house_number,
    addr.building,
    addr.road,
    addr.neighbourhood || addr.suburb,
  ].filter(Boolean);

  if (parts.length > 0) return parts.join(", ");

  // Fallback: take the first two comma-separated segments of the full
  // address Nominatim returned, which is usually specific enough.
  return displayName.split(",").slice(0, 2).join(",").trim();
};

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    phone_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
    latitude: null,
    longitude: null,
  });
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Address autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  // "Use my current location"
  const [locating, setLocating] = useState(false);

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

    if (!/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Phone number must be exactly 10 digits.";
    }

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
        latitude: null,
        longitude: null,
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

  // ---- Address autocomplete (type-ahead) ----
  const handleAddressInput = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, address_line1: value }));

    clearTimeout(debounceRef.current);

    if (value.trim().length < 4) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `${NOMINATIM_BASE}/search?format=json&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(
            value,
          )}`,
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Address search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 400); // debounce so we don't fire a request on every keystroke
  };

  const pickSuggestion = (place) => {
    const addr = place.address || {};

    setFormData((prev) => ({
      ...prev,
      // Full precise address (building/house, road, neighbourhood) rather
      // than just "house_number road" — keeps the exact detail Nominatim found.
      address_line1: buildExactAddress(addr, place.display_name),
      city: addr.city || addr.town || addr.village || prev.city,
      state: addr.state || prev.state,
      zip_code: addr.postcode || prev.zip_code,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    }));

    setShowSuggestions(false);
    setSuggestions([]);
  };

  // ---- "Use my current location" ----
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't supported by your browser.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `${NOMINATIM_BASE}/reverse?format=json&addressdetails=1&lat=${latitude}&lon=${longitude}`,
          );
          const place = await res.json();
          const addr = place.address || {};

          setFormData((prev) => ({
            ...prev,
            address_line1: buildExactAddress(addr, place.display_name),
            city: addr.city || addr.town || addr.village || prev.city,
            state: addr.state || prev.state,
            zip_code: addr.postcode || prev.zip_code,
            latitude,
            longitude,
          }));
          toast.success("Location detected — please double check the details.");
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          // Still keep the raw coordinates even if we can't resolve an address.
          setFormData((prev) => ({ ...prev, latitude, longitude }));
          toast.error("Got your coordinates, but couldn't resolve an address.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error(
          "Couldn't get your location. Please allow location access.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
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

          {/* Use current location */}
          <Button
            variant="outline-primary"
            size="sm"
            type="button"
            className="mb-3 d-inline-flex align-items-center gap-2"
            onClick={useCurrentLocation}
            disabled={locating}
          >
            {locating ? (
              <Spinner size="sm" animation="border" />
            ) : (
              <LocateFixed size={16} />
            )}
            Use my current location
          </Button>

          {/* Address 1 with autocomplete */}
          <div className="position-relative mb-3">
            <FloatingLabel label="Address line 1">
              <Form.Control
                type="text"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleAddressInput}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                isInvalid={!!errors.address_line1}
                placeholder="Start typing your address"
                autoComplete="off"
              />
              <Form.Control.Feedback type="invalid">
                {errors.address_line1}
              </Form.Control.Feedback>
            </FloatingLabel>

            {searching && (
              <Spinner
                size="sm"
                animation="border"
                className="position-absolute"
                style={{ right: "12px", top: "18px" }}
              />
            )}

            {showSuggestions && suggestions.length > 0 && (
              <ListGroup
                className="position-absolute w-100 shadow-sm"
                style={{ zIndex: 1000, top: "100%" }}
              >
                {suggestions.map((place) => (
                  <ListGroup.Item
                    key={place.place_id}
                    action
                    onMouseDown={() => pickSuggestion(place)}
                    className="small"
                  >
                    {place.display_name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>

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

          {formData.latitude && formData.longitude && (
            <p className="text-muted small mb-3">
              Pinned location: {formData.latitude.toFixed(5)},{" "}
              {formData.longitude.toFixed(5)}
            </p>
          )}

          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Submit"}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CompleteProfile;
