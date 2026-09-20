import React, { useState } from "react";
import { Card, Form, Button, Alert, Spinner, Row, Col } from "react-bootstrap";
import {Image} from "react-bootstrap";
import register from  "../assets/register.jpg";
import "../App.css";
import { register as registerUser } from "../apis/form_apis";
import {toast , ToastContainer } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS


const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if(password.length < 8){
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const data = { email, username, password };
      const response = await registerUser(data);
      setSuccess(
        response.data.message || "Registration successful! Please login.",
      );
      setLoading(false);
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      toast.success(
        response.data.message || "Registration successful! Please login.",
      ); // Show success toast
      setTimeout(() => {
        navigate("/verify_otp");
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
          "An error occurred during registration. Please try again."
      );
    }
  };

  return (
    <div className="auth-page">
      <Card className="w-75 p-4  animate__animated animate__fadeIn">
        <Row>
          <Col md={6}>
            <Card className="auth-card animate__animated animate__zoomIn">
              <Card.Body>
                <h2 className="text-center mb-4">Create Account 🚀</h2>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  {/* Email */}
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Username */}
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Confirm Password */}
                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  {/* Register Button */}
                  <Button
                    type="submit"
                    className="btn-theme w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Creating Account...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>

                  {/* Extra Actions */}
                  <div className="text-center auth-links">
                    Already have an account? <a href="/login">Login</a>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="d-flex align-items-center justify-content-center">
            <Image src={register} height={400} width={400}/>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Register;
