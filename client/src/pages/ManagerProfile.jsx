import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import { userAPI } from "../lib/api";
import Loading from "../components/Loading";
import "./Page.css";

export default function ManagerProfile() {
  const { user, token, updateProfile, logout } = useAuth();
  const { success: showSuccess, error: showError } = useResponse();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    contactNumber: user?.contactNumber || "",
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Change password state
  const [pwData, setPwData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwLoading, setPwLoading] = useState(false);

  const BACKEND = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:5000";
  const resolveUrl = (url) => (!url || url.startsWith("http") ? url : `${BACKEND}${url}`);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        contactNumber: user.contactNumber || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
      });
    }
  }, [user]);

  // ── Profile Handlers ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setFormErrors({
        firstName: !formData.firstName.trim() ? "Required" : "",
        lastName: !formData.lastName.trim() ? "Required" : "",
      });
      return;
    }
    try {
      setSaving(true);
      await updateProfile(formData);
      showSuccess("Profile updated!");
      setEditing(false);
    } catch (err) {
      showError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ── Image Upload ──────────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      setImageUploading(true);
      const res = await userAPI.uploadProfileImage(fd, token);
      await updateProfile({ imageURL: res.data?.imageURL || res.imageURL });
      showSuccess("Photo updated!");
    } catch (err) {
      showError(err.message || "Failed to upload photo");
    } finally {
      setImageUploading(false);
    }
  };

  // ── Change Password ───────────────────────────────────────────────────────────
  const validatePw = () => {
    const errs = {};
    if (!pwData.oldPassword) errs.oldPassword = "Required";
    if (!pwData.newPassword) errs.newPassword = "Required";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(pwData.newPassword))
      errs.newPassword = "Must include uppercase, lowercase, number & symbol";
    if (pwData.newPassword !== pwData.confirmPassword)
      errs.confirmPassword = "Passwords don't match";
    return errs;
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length) {
      setPwErrors(errs);
      return;
    }
    try {
      setPwLoading(true);
      await userAPI.changePassword(pwData, token);
      showSuccess("Password changed! Logging you out...");
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 1500);
    } catch (err) {
      showError(err.message || "Failed to change password");
      setPwErrors({ submit: err.message });
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return <Loading />;

  return (
    <div className="page">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 6px" }}>My Profile</h1>
          <p style={{ margin: "0", color: "var(--muted)" }}>Hiring Manager</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/manager/dashboard" className="btn ghost">
            ← Dashboard
          </Link>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn btn-primary">
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "30px",
          alignItems: "start",
        }}
      >
        {/* Left: Info / Edit Form */}
        <div>
          <div
            style={{
              padding: "30px",
              border: "1px solid rgba(12,15,29,0.1)",
              borderRadius: "10px",
              backgroundColor: "#fff",
              marginBottom: "20px",
            }}
          >
            {/* Avatar row */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
              <div style={{ position: "relative", marginRight: "20px", flexShrink: 0 }}>
                <div
                  style={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "var(--accent)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.5rem",
                  }}
                >
                  {user.imageURL ? (
                    <img
                      src={resolveUrl(user.imageURL)}
                      alt="Profile"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    user.firstName?.charAt(0).toUpperCase()
                  )}
                </div>
                <label
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "28px",
                    height: "28px",
                    backgroundColor: "var(--accent)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                  title="Change photo"
                >
                  {imageUploading ? "⏳" : "📷"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              <div>
                <h2 style={{ margin: "0 0 4px" }}>
                  {user.firstName} {user.lastName}
                </h2>
                <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.9rem" }}>
                  {user.email}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "6px",
                    padding: "3px 10px",
                    backgroundColor: "var(--accent)",
                    color: "#fff",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Hiring Manager
                </span>
              </div>
            </div>

            {!editing ? (
              /* View Mode */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {user.contactNumber && (
                  <div>
                    <p style={{ margin: "0 0 4px", color: "var(--muted)", fontSize: "0.85rem" }}>
                      Phone
                    </p>
                    <p style={{ margin: "0", fontWeight: "500" }}>{user.contactNumber}</p>
                  </div>
                )}
                {user.dateOfBirth && (
                  <div>
                    <p style={{ margin: "0 0 4px", color: "var(--muted)", fontSize: "0.85rem" }}>
                      Date of Birth
                    </p>
                    <p style={{ margin: "0", fontWeight: "500" }}>
                      {new Date(user.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Edit Mode */
              <form onSubmit={handleSave}>
                {formErrors.submit && <div className="error-message">{formErrors.submit}</div>}

                <div className="grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={formErrors.firstName ? "error" : ""}
                      disabled={saving}
                    />
                    {formErrors.firstName && <span className="error">{formErrors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={formErrors.lastName ? "error" : ""}
                      disabled={saving}
                    />
                    {formErrors.lastName && <span className="error">{formErrors.lastName}</span>}
                  </div>
                </div>

                <div className="grid">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      name="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={user.email} disabled />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Change Password Card */}
          <div
            style={{
              padding: "30px",
              border: "1px solid rgba(12,15,29,0.1)",
              borderRadius: "10px",
              backgroundColor: "#fff",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Change Password</h3>
            <p style={{ color: "var(--muted)", marginBottom: "20px", fontSize: "0.9rem" }}>
              You will be logged out after changing your password.
            </p>
            <form onSubmit={handlePwSubmit}>
              {pwErrors.submit && <div className="error-message">{pwErrors.submit}</div>}
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={pwData.oldPassword}
                  onChange={(e) => setPwData({ ...pwData, oldPassword: e.target.value })}
                  className={pwErrors.oldPassword ? "error" : ""}
                  disabled={pwLoading}
                />
                {pwErrors.oldPassword && <span className="error">{pwErrors.oldPassword}</span>}
              </div>
              <div className="grid">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={pwData.newPassword}
                    onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                    className={pwErrors.newPassword ? "error" : ""}
                    disabled={pwLoading}
                  />
                  {pwErrors.newPassword && <span className="error">{pwErrors.newPassword}</span>}
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={pwData.confirmPassword}
                    onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })}
                    className={pwErrors.confirmPassword ? "error" : ""}
                    disabled={pwLoading}
                  />
                  {pwErrors.confirmPassword && (
                    <span className="error">{pwErrors.confirmPassword}</span>
                  )}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={pwLoading}>
                {pwLoading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Account Info sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              padding: "20px",
              border: "1px solid rgba(12,15,29,0.1)",
              borderRadius: "10px",
              backgroundColor: "#fff",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Account Info</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <p style={{ margin: "0 0 4px", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Status
                </p>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    backgroundColor: user.status === "active" ? "#4caf50" : "#ff9800",
                    color: "#fff",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  {user.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <p style={{ margin: "0 0 4px", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Member since
                </p>
                <p style={{ margin: "0", fontWeight: "600" }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "20px",
              border: "1px solid rgba(12,15,29,0.1)",
              borderRadius: "10px",
              backgroundColor: "#fff",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link to="/create-job" className="btn btn-primary" style={{ textAlign: "center" }}>
                + Post New Job
              </Link>
              <Link to="/manager/jobs" className="btn ghost" style={{ textAlign: "center" }}>
                My Job Postings
              </Link>
              <Link to="/manager/dashboard" className="btn ghost" style={{ textAlign: "center" }}>
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
