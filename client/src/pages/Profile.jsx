import React, { useState, useEffect } from "react";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import { userAPI } from "../lib/api";
import { useNavigate } from "react-router-dom";
import "./Page.css";

export default function Profile() {
  const { user, token, updateProfile, logout } = useAuth();
  const { success: showSuccess, error: showError } = useResponse();
  const navigate = useNavigate();

  // ── Profile Edit State ──────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    contactNumber: user?.contactNumber || "",
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
  });
  const [profileErrors, setProfileErrors] = useState({});

  // ── File Upload State (staged — only uploaded on Save Changes) ─────────────
  const [pendingImage, setPendingImage] = useState(null); // File object
  const [pendingResume, setPendingResume] = useState(null); // File object
  const [imagePreview, setImagePreview] = useState(null); // local object URL
  const BACKEND = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:5000";

  const resolveUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${BACKEND}${url}`;
  };

  // ── Change Password State ───────────────────────────────────────────────────
  const [pwLoading, setPwLoading] = useState(false);
  const [pwData, setPwData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwErrors, setPwErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        contactNumber: user.contactNumber || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
      });
    }
  }, [user]);

  // ── Profile Handlers ────────────────────────────────────────────────────────
  const validateProfile = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";
    return errs;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (profileErrors[name]) setProfileErrors({ ...profileErrors, [name]: "" });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }
    try {
      setProfileLoading(true);

      // 1. Upload staged image if one was chosen
      if (pendingImage) {
        const fd = new FormData();
        fd.append("image", pendingImage);
        const res = await userAPI.uploadProfileImage(fd, token);
        await updateProfile({ imageURL: res.data?.imageURL || res.imageURL });
      }

      // 2. Upload staged resume if one was chosen
      if (pendingResume) {
        const fd = new FormData();
        fd.append("resume", pendingResume);
        const res = await userAPI.uploadProfileResume(fd, token);
        await updateProfile({ resumeURL: res.data?.resumeURL || res.resumeURL });
      }

      // 3. Save text fields
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactNumber: formData.contactNumber,
        dateOfBirth: formData.dateOfBirth || undefined,
      });

      showSuccess("Profile updated successfully!");
      setPendingImage(null);
      setPendingResume(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      setEditing(false);
    } catch (err) {
      showError(err.message || "Failed to update profile");
      setProfileErrors({ submit: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  // ── File Selection Handlers (no upload yet) ──────────────────────────────────
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingImage(file);
    // Create a local preview URL
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleResumeSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingResume(file);
  };

  // ── Change Password Handlers ────────────────────────────────────────────────
  const validatePassword = () => {
    const errs = {};
    if (!pwData.oldPassword) errs.oldPassword = "Old password is required";
    if (!pwData.newPassword) errs.newPassword = "New password is required";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(pwData.newPassword)) {
      errs.newPassword = "Must include uppercase, lowercase, number & symbol (e.g. !@#$)";
    }
    if (!pwData.confirmPassword) errs.confirmPassword = "Please confirm your new password";
    else if (pwData.newPassword !== pwData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    if (pwData.oldPassword && pwData.newPassword && pwData.oldPassword === pwData.newPassword) {
      errs.newPassword = "New password must be different from old password";
    }
    return errs;
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwData({ ...pwData, [name]: value });
    if (pwErrors[name]) setPwErrors({ ...pwErrors, [name]: "" });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length > 0) {
      setPwErrors(errs);
      return;
    }
    try {
      setPwLoading(true);
      await userAPI.changePassword(pwData, token);
      showSuccess("Password changed! Please log in again.");
      setPwData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPwErrors({});
      // Force re-login since the password changed
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

  if (!user) {
    return (
      <div className="page" style={{ textAlign: "center" }}>
        <p>Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="page">
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ margin: "0" }}>My Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn btn-primary">
            Edit Profile
          </button>
        )}
      </div>

      {!editing ? (
        // ──────── View Mode ────────────────────────────────────────────────────
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
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
              <div style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "var(--accent)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem",
                    marginRight: "20px",
                    flexShrink: 0,
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
                <div>
                  <h2 style={{ margin: "0 0 8px" }}>
                    {user.firstName} {user.lastName}
                  </h2>
                  <p style={{ margin: "0", color: "var(--muted)" }}>{user.email}</p>
                  <p style={{ margin: "8px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                    Role: {user.role}
                  </p>
                </div>
              </div>

              {user.contactNumber && (
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.9rem" }}>
                    Phone
                  </p>
                  <p style={{ margin: "0", fontWeight: "500" }}>{user.contactNumber}</p>
                </div>
              )}

              {user.dateOfBirth && (
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.9rem" }}>
                    Date of Birth
                  </p>
                  <p style={{ margin: "0", fontWeight: "500" }}>
                    {new Date(user.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div
              style={{
                padding: "20px",
                border: "1px solid rgba(12,15,29,0.1)",
                borderRadius: "10px",
                backgroundColor: "#fff",
              }}
            >
              <h3 style={{ marginTop: "0" }}>Account Info</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                  <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.85rem" }}>
                    Status
                  </p>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      backgroundColor: user.status === "active" ? "#4caf50" : "#ff9800",
                      color: "#fff",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    {user.status === "active" ? "Active" : "Inactive"}
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.85rem" }}>
                    Joined
                  </p>
                  <p style={{ margin: "0", fontWeight: "600" }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ──────── Edit Mode ────────────────────────────────────────────────────
        <form onSubmit={handleProfileSubmit} style={{ maxWidth: "600px" }}>
          {profileErrors.submit && <div className="error-message">{profileErrors.submit}</div>}

          <div className="grid">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleProfileChange}
                className={profileErrors.firstName ? "error" : ""}
                disabled={profileLoading}
              />
              {profileErrors.firstName && <span className="error">{profileErrors.firstName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleProfileChange}
                className={profileErrors.lastName ? "error" : ""}
                disabled={profileLoading}
              />
              {profileErrors.lastName && <span className="error">{profileErrors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} disabled />
          </div>

          <div className="grid">
            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                id="contactNumber"
                type="tel"
                name="contactNumber"
                placeholder="+1 (555) 123-4567"
                value={formData.contactNumber}
                onChange={handleProfileChange}
                disabled={profileLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                id="dateOfBirth"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleProfileChange}
                disabled={profileLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Profile Photo</label>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
              {/* Show local preview if a file is staged, otherwise show saved photo */}
              {(imagePreview || user?.imageURL) && (
                <div style={{ position: "relative" }}>
                  <img
                    src={imagePreview || resolveUrl(user.imageURL)}
                    alt="Profile preview"
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: `2px solid ${imagePreview ? "#ff9800" : "var(--accent)"}`,
                    }}
                  />
                  {imagePreview && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-6px",
                        background: "#ff9800",
                        color: "#fff",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        fontSize: "0.65rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Pending — not saved yet"
                    >
                      !
                    </span>
                  )}
                </div>
              )}
              <label
                className="btn ghost"
                style={{ cursor: "pointer", padding: "8px 16px", fontSize: "0.9rem" }}
              >
                {pendingImage
                  ? `✎ ${pendingImage.name.slice(0, 20)}…`
                  : user?.imageURL
                    ? "Change Photo"
                    : "Choose Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={profileLoading}
                  style={{ display: "none" }}
                />
              </label>
              {pendingImage && (
                <span style={{ fontSize: "0.8rem", color: "#ff9800" }}>
                  ⚠ Not saved yet — click Save Changes
                </span>
              )}
              {!pendingImage && user?.imageURL && (
                <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Photo saved ✓</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Resume (PDF)</label>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
              {user?.resumeURL && !pendingResume && (
                <a
                  href={resolveUrl(user.resumeURL)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn ghost"
                  style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                >
                  📄 View current resume
                </a>
              )}
              <label
                className="btn ghost"
                style={{ cursor: "pointer", padding: "8px 16px", fontSize: "0.9rem" }}
              >
                {pendingResume
                  ? `✎ ${pendingResume.name.slice(0, 24)}…`
                  : user?.resumeURL
                    ? "Replace Resume"
                    : "Choose Resume"}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeSelect}
                  disabled={profileLoading}
                  style={{ display: "none" }}
                />
              </label>
              {pendingResume && (
                <span style={{ fontSize: "0.8rem", color: "#ff9800" }}>
                  ⚠ Not saved yet — click Save Changes
                </span>
              )}
            </div>
            <small style={{ color: "var(--muted)" }}>
              PDF only · Max 10 MB · Will be auto-attached when applying to jobs
            </small>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setEditing(false);
                setPendingImage(null);
                setPendingResume(null);
                if (imagePreview) {
                  URL.revokeObjectURL(imagePreview);
                  setImagePreview(null);
                }
              }}
              disabled={profileLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ──────── Change Password Section ─────────────────────────────────────── */}
      <div style={{ marginTop: "50px", maxWidth: "600px" }}>
        <hr style={{ marginBottom: "30px", borderColor: "rgba(12,15,29,0.1)" }} />
        <h2>Change Password</h2>
        <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
          Enter your current password and choose a new strong password. You will be logged out after
          changing your password.
        </p>

        <form onSubmit={handlePasswordSubmit}>
          {pwErrors.submit && <div className="error-message">{pwErrors.submit}</div>}

          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <input
              id="oldPassword"
              type="password"
              name="oldPassword"
              placeholder="Enter your current password"
              value={pwData.oldPassword}
              onChange={handlePwChange}
              className={pwErrors.oldPassword ? "error" : ""}
              disabled={pwLoading}
            />
            {pwErrors.oldPassword && <span className="error">{pwErrors.oldPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              name="newPassword"
              placeholder="Enter a strong new password"
              value={pwData.newPassword}
              onChange={handlePwChange}
              className={pwErrors.newPassword ? "error" : ""}
              disabled={pwLoading}
            />
            {pwErrors.newPassword && <span className="error">{pwErrors.newPassword}</span>}
            <small style={{ color: "var(--muted)" }}>
              Min 6 chars — uppercase, lowercase, number & symbol required (e.g. Pass1!)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your new password"
              value={pwData.confirmPassword}
              onChange={handlePwChange}
              className={pwErrors.confirmPassword ? "error" : ""}
              disabled={pwLoading}
            />
            {pwErrors.confirmPassword && <span className="error">{pwErrors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={pwLoading}
            style={{ marginTop: "10px" }}
          >
            {pwLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
