// /src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import AuthForm from "../components/Auth/AuthForm";
import FormInput from "../components/Auth/FormInput";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const data = { username, email, password };
      const response = await registerUser(data);
      console.log(response);

      setTimeout(() => {
        navigate("/verify");
      }, 500);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Create an account"
      onSubmit={handleRegister}
      error={error}
      loading={loading}
      submitButtonText="Create account"
      loadingButtonText="Creating account..."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <FormInput
        id="username"
        label="Username"
        type="text"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="johndoe"
      />

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
        id="password"
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      <FormInput
        id="confirmPassword"
        label="Confirm password"
        type="password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="••••••••"
      />
    </AuthForm>
  );
};

export default Register;