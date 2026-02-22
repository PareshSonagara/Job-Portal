import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import { GoogleLogin } from "@react-oauth/google";
import "./Page.css";

export default function Login() {
  const navigate = useNavigate();
  const { googleLogin, login, loading } = useAuth();
  const { error: showError, success: showSuccess } = useResponse();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login(formData.email, formData.password);
      showSuccess("Login successful!");
      navigate("/");
    } catch (err) {
      showError(err.message || "Login failed");
      setErrors({ submit: err.message });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Login</h1>
        <p className="auth-subtitle">Welcome back! Please login to your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="google-auth-wrapper">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                googleLogin(credentialResponse.credential)
                  .then(() => {
                    showSuccess("Login successful!");
                    navigate("/");
                  })
                  .catch((err) => showError(err.message || "Google login failed"));
              }}
              onError={() => showError("Google login failed")}
              useOneTap
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
            />
          </div>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup" className="auth-link">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
