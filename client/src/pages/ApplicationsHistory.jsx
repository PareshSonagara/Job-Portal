import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import Loading from "../components/Loading";
import "./Page.css";

export default function ApplicationsHistory() {
  const { token } = useAuth();
  const { error: showError } = useResponse();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        // Get user profile with populated appliedJobs
        const response = await userAPI.getProfile(token);
        // User has appliedJobs array populated with Application objects
        setApplications(response.data?.appliedJobs || []);
      } catch (err) {
        showError(err.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [token, showError]);

  const filteredApplications =
    filterStatus === "all"
      ? applications
      : applications.filter((app) => (app.status || "pending") === filterStatus);

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ff9800",
      reviewing: "#2196f3",
      accepted: "#4caf50",
      rejected: "#f44336",
    };
    return colors[status] || "#999";
  };

  const getStatusLabel = (status) => {
    return (status || "pending").charAt(0).toUpperCase() + (status || "pending").slice(1);
  };

  if (loading) return <Loading />;

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
          <h1 style={{ margin: "0" }}>Application History</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
            Track all your job applications
          </p>
        </div>
        <Link to="/jobs" className="btn btn-primary">
          Browse More Jobs
        </Link>
      </div>

      {/* Status Filter */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        {["all", "pending", "reviewing", "accepted", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={filterStatus === status ? "btn btn-primary" : "btn ghost"}
            style={{
              padding: "8px 16px",
              fontSize: "0.9rem",
            }}
          >
            {status === "all" ? "All Applications" : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--muted)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📋</div>
          <p style={{ fontSize: "1.1rem" }}>
            {applications.length === 0
              ? "You haven't applied to any jobs yet"
              : `No applications with status "${filterStatus}"`}
          </p>
          {applications.length === 0 && (
            <Link
              to="/jobs"
              className="btn btn-primary"
              style={{ marginTop: "20px", display: "inline-block" }}
            >
              Start Applying
            </Link>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredApplications.map((app) => (
            <div
              key={app._id}
              style={{
                padding: "20px",
                border: "1px solid rgba(12, 15, 29, 0.1)",
                borderRadius: "10px",
                backgroundColor: "#fff",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "15px",
                }}
              >
                <div style={{ flex: "1" }}>
                  <h3 style={{ margin: "0 0 5px" }}>{app.job?.jobTitle || "Job Title"}</h3>
                  <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.9rem" }}>
                    {app.job?.companyInfo?.companyName || "Company"}
                  </p>
                </div>
                <div
                  style={{
                    padding: "6px 12px",
                    backgroundColor: getStatusColor(app.status || "pending"),
                    color: "#fff",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getStatusLabel(app.status || "pending")}
                </div>
              </div>

              <p
                style={{
                  margin: "0 0 15px",
                  color: "var(--muted)",
                  fontSize: "0.9rem",
                }}
              >
                📍 {app.job?.companyInfo?.location || "Location"}
              </p>

              <div
                style={{
                  paddingTop: "15px",
                  borderTop: "1px solid rgba(12, 15, 29, 0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem",
                  color: "var(--muted)",
                }}
              >
                <span>Applied {new Date(app.createdAt || Date.now()).toLocaleDateString()}</span>
                <Link
                  to={`/jobs/${app.job?._id}`}
                  style={{
                    color: "var(--accent)",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                >
                  View Job →
                </Link>
              </div>

              {app.feedback && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "14px",
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(99,102,241,0.02))",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderLeft: "3px solid var(--accent)",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <p style={{ margin: "0", fontWeight: "700", color: "var(--ink)" }}>
                      💬 HR Feedback
                    </p>
                    {app.feedbackAt && (
                      <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        {new Date(app.feedbackAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "0", color: "var(--ink)", lineHeight: "1.5" }}>
                    {app.feedback}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
