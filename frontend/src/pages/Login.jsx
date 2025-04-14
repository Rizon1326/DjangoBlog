// /src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import AuthForm from "../components/Auth/AuthForm";
import FormInput from "../components/Auth/FormInput";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = { email, password };
      const response = await loginUser(data);
      console.log(response);

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Welcome back"
      onSubmit={handleLogin}
      error={error}
      loading={loading}
      submitButtonText="Sign in"
      loadingButtonText="Signing in..."
      footerText="Don't have an account?"
      footerLinkText="Create account"
      footerLinkHref="/register"
    >
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
        rightElement={
          <a
            href="/forgot-password"
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Forgot password?
          </a>
        }
      />
    </AuthForm>
  );
};

export default Login;