import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import { GoogleLogin } from "@react-oauth/google";
import "./Page.css";

export default function Signup() {
  const navigate = useNavigate();
  const { googleLogin, signup, loading } = useAuth();
  const { error: showError, success: showSuccess } = useResponse();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "Candidate",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm password";
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (
      formData.password &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(formData.password)
    ) {
      newErrors.password =
        "Password must include uppercase, lowercase, a number, and a symbol (e.g. !@#$)";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      await signup(formData);
      showSuccess("Account created successfully! You can now log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      showError(err.message || "Signup failed");
      setErrors({ submit: err.message });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join Job Portal and start your career journey</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? "error" : ""}
              />
              {errors.firstName && <span className="error">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? "error" : ""}
              />
              {errors.lastName && <span className="error">{errors.lastName}</span>}
            </div>
          </div>

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
            <label htmlFor="role">Account Type</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="Candidate">Candidate (Job Seeker)</option>
              <option value="Hiring-Manager">Hiring Manager</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
            />
            {errors.password && <span className="error">{errors.password}</span>}
            <small>Min 6 characters — must include uppercase, lowercase, number &amp; symbol (e.g. !@#$)</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "error" : ""}
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="google-auth-wrapper">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                googleLogin(credentialResponse.credential)
                  .then(() => {
                    showSuccess("Account created successfully!");
                    navigate("/");
                  })
                  .catch((err) => showError(err.message || "Google signup failed"));
              }}
              onError={() => showError("Google signup failed")}
              useOneTap
              theme="outline"
              size="large"
              width="100%"
              text="signup_with"
            />
          </div>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
