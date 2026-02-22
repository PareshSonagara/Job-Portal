import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import Loading from "../components/Loading";
import "./Page.css";

export default function JobApplications() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { success: showSuccess, error: showError } = useResponse();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    if (user?.role !== "Hiring-Manager") {
      navigate("/");
      return;
    }

    const loadApplications = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getManagerJobById(jobId, token);
        // API returns { job: {...} }
        const jobData = response.data?.job || response.data || response;
        setJob(jobData);
        setApplications(jobData?.applications || []);
      } catch (err) {
        showError(err.message || "Failed to load applications");
        setTimeout(() => navigate("/manager/dashboard"), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [jobId, user, token, navigate, showError]);

  const filteredApplications = filterStatus === "all"
    ? applications
    : applications.filter(app => app.status === filterStatus);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await jobAPI.updateApplicationStatus(jobId, appId, newStatus, token);
      setApplications(applications.map(app =>
        app._id === appId ? { ...app, status: newStatus } : app
      ));
      showSuccess(`Status updated to "${newStatus}"`);
    } catch (err) {
      showError(err.message || "Failed to update status");
    }
  };

  const handleSendFeedback = async (appId) => {
    if (!feedbackText.trim()) {
      showError("Please enter feedback before sending");
      return;
    }
    try {
      const res = await jobAPI.updateApplicationFeedback(jobId, appId, feedbackText, token);
      const updated = res.data;
      setApplications(applications.map(app =>
        app._id === appId ? { ...app, feedback: updated.feedback, feedbackAt: updated.feedbackAt } : app
      ));
      showSuccess("Feedback saved — candidate will see it in their Application History");
      setFeedbackText("");
      setSelectedApp(null);
    } catch (err) {
      showError(err.message || "Failed to send feedback");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        paddingBottom: "20px",
        borderBottom: "1px solid rgba(12, 15, 29, 0.1)"
      }}>
        <div>
          <Link to="/manager/dashboard" style={{
            color: "var(--accent)",
            textDecoration: "none",
            marginBottom: "10px",
            display: "inline-block"
          }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ margin: "0" }}>{job?.jobTitle}</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
            {applications.length} applications received
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "30px",
        flexWrap: "wrap"
      }}>
        {["all", "pending", "reviewing", "accepted", "rejected"].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={filterStatus === status ? "btn btn-primary" : "btn ghost"}
            style={{
              padding: "8px 16px",
              fontSize: "0.9rem"
            }}
          >
            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--muted)"
        }}>
          <p style={{ fontSize: "1.1rem" }}>No applications yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {filteredApplications.map(app => (
            <div
              key={app._id}
              style={{
                padding: "20px",
                border: "1px solid rgba(12, 15, 29, 0.1)",
                borderRadius: "10px",
                backgroundColor: "#fff"
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "15px"
              }}>
                <div>
                  <h3 style={{ margin: "0 0 8px" }}>
                    {app.applicant?.firstName || "Candidate"} {app.applicant?.lastName || ""}
                  </h3>
                  <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.9rem" }}>
                    {app.applicant?.email}
                  </p>
                </div>
                <div style={{
                  padding: "8px 12px",
                  backgroundColor: {
                    pending: "#ff9800",
                    reviewing: "#2196f3",
                    accepted: "#4caf50",
                    rejected: "#f44336"
                  }[app.status || "pending"],
                  color: "#fff",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "600"
                }}>
                  {(app.status || "pending").charAt(0).toUpperCase() + (app.status || "pending").slice(1)}
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "15px",
                marginBottom: "15px",
                paddingBottom: "15px",
                borderBottom: "1px solid rgba(12, 15, 29, 0.05)"
              }}>
                <div>
                  <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.85rem" }}>Applied On</p>
                  <p style={{ margin: "5px 0 0", fontWeight: "600" }}>
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.85rem" }}>Rating</p>
                  <p style={{ margin: "5px 0 0", fontWeight: "600" }}>
                    {app.rating ? `${app.rating}/5` : "Not rated"}
                  </p>
                </div>
              </div>

              {app.coverLetter && (
                <div style={{
                  marginBottom: "15px",
                  padding: "12px",
                  backgroundColor: "rgba(12, 15, 29, 0.03)",
                  borderRadius: "8px"
                }}>
                  <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--muted)" }}>
                    Cover Letter
                  </p>
                  <p style={{
                    margin: "0",
                    fontSize: "0.9rem",
                    maxHeight: "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {app.coverLetter}
                  </p>
                </div>
              )}

              {selectedApp === app._id ? (
                <div style={{
                  marginBottom: "15px",
                  padding: "15px",
                  backgroundColor: "rgba(12, 15, 29, 0.03)",
                  borderRadius: "8px"
                }}>
                  <label style={{
                    display: "block",
                    marginBottom: "10px",
                    fontSize: "0.9rem",
                    color: "var(--ink)"
                  }}>
                    Send Feedback
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Your feedback for this candidate..."
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid rgba(12, 15, 29, 0.1)",
                      marginBottom: "10px"
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleSendFeedback(app._id)}
                      className="btn btn-primary"
                      style={{ padding: "8px 16px" }}
                    >
                      Send
                    </button>
                    <button
                      onClick={() => setSelectedApp(null)}
                      className="btn ghost"
                      style={{ padding: "8px 16px" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <select
                  value={app.status}
                  onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(12, 15, 29, 0.1)",
                    fontSize: "0.9rem"
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="accepted">Accept</option>
                  <option value="rejected">Reject</option>
                </select>

                {app.resume && (
                  <a
                    href={app.resume.startsWith("http") ? app.resume : `${import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:5000"}${app.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn ghost"
                    style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                  >
                    View Resume
                  </a>
                )}

                <button
                  onClick={() => setSelectedApp(selectedApp === app._id ? null : app._id)}
                  className="btn ghost"
                  style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                >
                  {selectedApp === app._id ? "Cancel Feedback" : "Send Feedback"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
