import React, { useState, useEffect, useRef } from "react";
import { Card, Form, Alert, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { otp_verify } from "../apis/form_apis";

import { toast } from "react-toastify";

const Otp = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [seconds, setSeconds] = useState(60);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const user = localStorage.getItem("user");

    useEffect(() => {
      inputRefs.current[0].focus();
    }, []);

    useEffect(() => {
      if (seconds > 0) {
        const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setMessage("You can request a new OTP now.");
      }
    }, [seconds]);

  const handleOtpChange = (element, index) => {
    const value = element.value;
    if (/^\d{0,1}$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{6}$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      setOtp(newOtp);
      inputRefs.current[5].focus();
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = user ? Number(user) : null;
    const otpCode = otp.join("");

    if (otpCode.length < 6) {
      setMessage("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await otp_verify({
        otp: otpCode,
        user: userId,
      });

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
      const errorMsg =
        err.response?.data?.message || "Invalid OTP. Please try again.";
      setLoading(false);

      setMessage(errorMsg);
      toast.error(errorMsg);
    }
  };


  return (
    <div className="auth-page">
      <Card className="auth-card animate__animated animate__zoomIn">
        <h4 className="text-center">OTP Verification</h4>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="form-group">
              <Form.Label>Enter OTP:</Form.Label>
              <div className="d-flex justify-content-center">
                {otp.map((data, index) => (
                  <Form.Control
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="otp-input"
                    style={{
                      width: "40px",
                      textAlign: "center",
                      marginRight: "5px",
                    }}
                    inputMode="numeric"
                  />
                ))}
              </div>
            </Form.Group>
            <br />
            <Form.Group className="d-flex justify-content-center">
               
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
                  "Login"
                )}
              </Button>
            </Form.Group>
            <br />
            {message && <Alert variant="danger">{message}</Alert>}
            {seconds === 0 && (
              <div className="btnn">
                <Button
                  className="btn-theme px-5"
                  
                  
                  disabled={resending}
                >
                  {resending ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Resend OTP"
                  )}
                </Button>
              </div>
            )}
          </Form>
        </Card.Body>
        Your validation time is: {seconds}
        <br />
      </Card>
    </div>
  );
};

export default Otp;
