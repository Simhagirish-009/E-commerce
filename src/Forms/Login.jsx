import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  FloatingLabel,
} from "react-bootstrap";
import { login } from "../apis/form_apis";
import { Row, Col, Image } from "react-bootstrap";
import register from "../assets/register.jpg";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import "../App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = { email, password };
      const response = await login(data);

      console.log("Login response:", response.data); // Debugging log
      localStorage.clear(); // Clear any previous data
      localStorage.setItem("user", JSON.stringify(response.data.user.id));
      // Store the tokens received from the backend
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      const isAdmin = response.data.is_admin;
      localStorage.setItem("is_admin", JSON.stringify(isAdmin));

      toast.success("Verification successful!");
      setLoading(false);

      setTimeout(() => {
        navigate(isAdmin ? "/admin-dashboard" : "/");
      }, 2000);
      
    } catch (err) {
      setLoading(false);
      const errData = err.response.data;
      const message =
        errData?.non_field_errors?.[0] ||
        errData?.message ||
        (errData && Object.values(errData).flat()[0]) ||
        "An error occurred during login. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="auth-page">
      {/* Toastify container to show notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <Card className="w-75 p-4  animate__animated animate__fadeIn">
        <Row>
          <Col
            md={6}
            className="d-flex align-items-center justify-content-center"
          >
            <Image src={register} height={400} width={400} />
          </Col>
          <Col md={6}>
            <Card className="auth-card animate__animated animate__zoomIn">
              <Card.Body>
                <h2 className="text-center mb-4">Welcome Back 👋</h2>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  {/* Email */}
                  <Form.Group className="mb-3">
                    <FloatingLabel
                      controlId="floating"
                      label="Email address"
                      className="mb-3"
                    >
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </FloatingLabel>
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-4">
                    <FloatingLabel
                      controlId="floatingInput"
                      label="Password"
                      className="mb-1"
                    >
                      <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </FloatingLabel>
                  </Form.Group>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    className="btn-theme w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>

                  {/* Extra Actions */}
                  <div className="text-center auth-links">
                    <a href="/forgot-password">Forgot Password?</a>
                    <span className="mx-2">|</span>
                    <a href="/register">Create Account</a>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Login;
