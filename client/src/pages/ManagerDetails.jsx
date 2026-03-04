import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { userAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import Loading from "../components/Loading";
import "./Page.css";

export default function ManagerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { error: showError } = useResponse();
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);

  const BACKEND = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:5000";
  const resolveUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${BACKEND}${url}`;
  };

  useEffect(() => {
    if (user?.role !== "Admin") {
      navigate("/");
      return;
    }

    const loadManager = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getManagerById(id, token);
        setManager(response.data || response);
      } catch (err) {
        showError(err.message || "Failed to load manager");
        setTimeout(() => navigate("/admin/managers"), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadManager();
  }, [id, user, token, navigate, showError]);

  if (loading) return <Loading />;

  if (!manager) {
    return (
      <div className="page" style={{ textAlign: "center" }}>
        <p>Manager not found</p>
        <Link to="/admin/managers" className="btn btn-primary">
          Back to Managers
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link
        to="/admin/managers"
        style={{
          color: "var(--accent)",
          textDecoration: "none",
          marginBottom: "20px",
          display: "inline-block",
        }}
      >
        ← Back to Managers
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "30px",
          marginBottom: "30px",
        }}
      >
        {/* Main Info */}
        <div>
          <div
            style={{
              padding: "30px",
              border: "1px solid rgba(12, 15, 29, 0.1)",
              borderRadius: "10px",
              backgroundColor: "#fff",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  marginRight: "20px",
                  overflow: "hidden",
                }}
              >
                {manager.imageURL ? (
                  <img
                    src={resolveUrl(manager.imageURL)}
                    alt={manager.firstName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  (manager.firstName?.charAt(0) || manager.name?.charAt(0) || "M").toUpperCase()
                )}
              </div>
              <div>
                <h1 style={{ margin: "0 0 8px" }}>
                  {manager.firstName} {manager.lastName}
                </h1>
                <p style={{ margin: "0", color: "var(--muted)" }}>{manager.email}</p>
              </div>
            </div>

            {manager.contactNumber && (
              <div style={{ marginBottom: "15px" }}>
                <p style={{ margin: "0 0 5px", color: "var(--muted)", fontSize: "0.9rem" }}>
                  Phone
                </p>
                <p style={{ margin: "0", fontWeight: "500" }}>{manager.contactNumber}</p>
              </div>
            )}

            {manager.company?.name && (
              <div style={{ marginBottom: "15px" }}>
                <p style={{ margin: "0 0 5px", color: "var(--muted)", fontSize: "0.9rem" }}>
                  Company
                </p>
                <p style={{ margin: "0", fontWeight: "500" }}>{manager.company.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div>
          {/* Account Status */}
          <div
            style={{
              padding: "20px",
              border: "1px solid rgba(12, 15, 29, 0.1)",
              borderRadius: "10px",
              backgroundColor: "#fff",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ marginTop: "0" }}>Account Status</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              <div>
                <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Status
                </p>
                <div
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    backgroundColor:
                      manager.status === "active"
                        ? "#4caf50"
                        : manager.status === "blocked"
                        ? "#f44336"
                        : "#ff9800",
                    color: "#fff",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    textTransform: "capitalize",
                  }}
                >
                  {manager.status}
                </div>
              </div>

              <div>
                <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Joined
                </p>
                <p style={{ margin: "0", fontWeight: "600" }}>
                  {new Date(manager.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Role
                </p>
                <p style={{ margin: "0", fontWeight: "600" }}>Hiring Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
