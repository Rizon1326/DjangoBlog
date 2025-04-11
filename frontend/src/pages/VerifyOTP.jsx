// /src/pages/VerifyOTP.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOTP } from "../services/authService";
import AuthForm from "../components/Auth/AuthForm";
import FormInput from "../components/Auth/FormInput";

const VerifyOTP = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = { email, otp };
      const response = await verifyOTP(data);
      setSuccess(response.message || "Verification successful!");
      console.log(response);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.message || "Verification failed. Please check your OTP and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Verify Your Account"
      onSubmit={handleVerifyOTP}
      error={error}
      success={success}
      loading={loading}
      submitButtonText="Verify Account"
      loadingButtonText="Verifying..."
    >
      <p className="text-gray-600 text-sm sm:text-base mb-6">
        Please enter the verification code that was sent to your email address.
      </p>

      <FormInput
        id="email"
        label="Email address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@company.com"
      />

      <FormInput
        id="otp"
        label="Verification Code"
        type="text"
        required
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="123456"
        maxLength={6}
      />
    </AuthForm>
  );
};

export default VerifyOTP;