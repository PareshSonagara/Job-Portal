import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import "./Page.css";

export default function AdminPromote() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { success: showSuccess, error: showError } = useResponse();
  const [formData, setFormData] = useState({ userId: "", newRole: "Hiring-Manager" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userId.trim()) newErrors.userId = "User ID is required";
    if (!formData.newRole) newErrors.newRole = "New role is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await userAPI.promoteUser(formData.userId, { role: formData.newRole }, token);
      showSuccess(`User promoted to ${formData.newRole}`);
      setFormData({ userId: "", newRole: "Hiring-Manager" });
      setErrors({});
    } catch (err) {
      showError(err.message || "Failed to promote user");
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "Admin") {
    return (
      <div className="page" style={{ textAlign: "center" }}>
        <p>You don't have permission to access this page</p>
        <Link
          to="/"
          className="btn btn-primary"
          style={{ marginTop: "20px", display: "inline-block" }}
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1 style={{ margin: "0" }}>Promote User</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
            Change user roles and permissions
          </p>
        </div>
        <Link to="/admin/dashboard" className="btn ghost">
          ← Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: "600px" }}>
        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <div className="form-group">
          <label htmlFor="userId">User ID *</label>
          <input
            id="userId"
            type="text"
            name="userId"
            placeholder="Enter the user's ID"
            value={formData.userId}
            onChange={handleChange}
            className={errors.userId ? "error" : ""}
            disabled={loading}
          />
          {errors.userId && <span className="error">{errors.userId}</span>}
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "8px" }}>
            You can find the user ID from the candidates or managers list
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="newRole">New Role *</label>
          <select
            id="newRole"
            name="newRole"
            value={formData.newRole}
            onChange={handleChange}
            className={errors.newRole ? "error" : ""}
            disabled={loading}
          >
            <option value="Candidate">Candidate</option>
            <option value="Hiring-Manager">Hiring Manager</option>
            <option value="Admin">Admin</option>
          </select>
          {errors.newRole && <span className="error">{errors.newRole}</span>}
        </div>

        {/* Info boxes */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "rgba(12, 15, 29, 0.03)",
            borderRadius: "10px",
            marginBottom: "30px",
          }}
        >
          <h3 style={{ marginTop: "0" }}>Role Permissions</h3>
          <ul style={{ margin: "0", paddingLeft: "20px" }}>
            <li>
              <strong>Candidate:</strong> Browse and apply to jobs, manage applications
            </li>
            <li>
              <strong>Hiring Manager:</strong> Post jobs, manage applications, view candidates
            </li>
            <li>
              <strong>Admin:</strong> Full system access, user management, system settings
            </li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Promoting..." : "Promote User"}
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
