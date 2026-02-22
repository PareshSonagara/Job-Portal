import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { userAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import Loading from "../components/Loading";
import "./Page.css";

export default function CandidateDetails() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { error: showError } = useResponse();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "Admin") {
      navigate("/");
      return;
    }

    const loadCandidate = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getCandidateById(candidateId, token);
        setCandidate(response.data || response);
      } catch (err) {
        showError(err.message || "Failed to load candidate");
        setTimeout(() => navigate("/admin/candidates"), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadCandidate();
  }, [candidateId, user, token, navigate, showError]);

  if (loading) return <Loading />;

  if (!candidate) {
    return (
      <div className="page" style={{ textAlign: "center" }}>
        <p>Candidate not found</p>
        <Link to="/admin/candidates" className="btn btn-primary">
          Back to Candidates
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/admin/candidates" style={{
        color: "var(--accent)",
        textDecoration: "none",
        marginBottom: "20px",
        display: "inline-block"
      }}>
        ← Back to Candidates
      </Link>

      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "30px",
        marginBottom: "30px"
      }}>
        {/* Main Info */}
        <div>
          <div style={{
            padding: "30px",
            border: "1px solid rgba(12, 15, 29, 0.1)",
            borderRadius: "10px",
            backgroundColor: "#fff",
            marginBottom: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "var(--accent)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                marginRight: "20px"
              }}>
                {candidate.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ margin: "0 0 8px" }}>{candidate.name}</h1>
                <p style={{ margin: "0", color: "var(--muted)" }}>
                  {candidate.email}
                </p>
              </div>
            </div>

            {candidate.phone && (
              <div style={{ marginBottom: "15px" }}>
                <p style={{ margin: "0 0 5px", color: "var(--muted)", fontSize: "0.9rem" }}>
                  Phone
                </p>
                <p style={{ margin: "0", fontWeight: "500" }}>{candidate.phone}</p>
              </div>
            )}

            {candidate.location && (
              <div style={{ marginBottom: "15px" }}>
                <p style={{ margin: "0 0 5px", color: "var(--muted)", fontSize: "0.9rem" }}>
                  Location
                </p>
                <p style={{ margin: "0", fontWeight: "500" }}>{candidate.location}</p>
              </div>
            )}

            {candidate.bio && (
              <div style={{ marginBottom: "15px" }}>
                <p style={{ margin: "0 0 5px", color: "var(--muted)", fontSize: "0.9rem" }}>
                  Bio
                </p>
                <p style={{ margin: "0", lineHeight: "1.6" }}>{candidate.bio}</p>
              </div>
            )}
          </div>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div style={{
              padding: "30px",
              border: "1px solid rgba(12, 15, 29, 0.1)",
              borderRadius: "10px",
              backgroundColor: "#fff",
              marginBottom: "20px"
            }}>
              <h2 style={{ marginTop: "0" }}>Skills</h2>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {candidate.skills.map(skill => (
                  <span
                    key={skill}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "var(--accent)",
                      color: "#fff",
                      borderRadius: "20px",
                      fontSize: "0.9rem"
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {candidate.experience && candidate.experience.length > 0 && (
            <div style={{
              padding: "30px",
              border: "1px solid rgba(12, 15, 29, 0.1)",
              borderRadius: "10px",
              backgroundColor: "#fff"
            }}>
              <h2 style={{ marginTop: "0" }}>Experience</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {candidate.experience.map((exp, idx) => (
                  <div key={idx} style={{
                    paddingBottom: "20px",
                    borderBottom: idx < candidate.experience.length - 1
                      ? "1px solid rgba(12, 15, 29, 0.05)"
                      : "none"
                  }}>
                    <h3 style={{ margin: "0 0 5px" }}>{exp.title}</h3>
                    <p style={{ margin: "0 0 8px", color: "var(--muted)" }}>
                      {exp.company}
                    </p>
                    <p style={{ margin: "0", fontSize: "0.85rem", color: "var(--muted)" }}>
                      {exp.startDate} - {exp.endDate}
                    </p>
                    {exp.description && (
                      <p style={{ margin: "10px 0 0", lineHeight: "1.6" }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Account Status */}
          <div style={{
            padding: "20px",
            border: "1px solid rgba(12, 15, 29, 0.1)",
            borderRadius: "10px",
            backgroundColor: "#fff",
            marginBottom: "20px"
          }}>
            <h3 style={{ marginTop: "0" }}>Account Status</h3>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px"
            }}>
              <div>
                <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Status
                </p>
                <div style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  backgroundColor: candidate.emailVerified ? "#4caf50" : "#ff9800",
                  color: "#fff",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "600"
                }}>
                  {candidate.emailVerified ? "Email Verified" : "Unverified"}
                </div>
              </div>

              <div>
                <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Joined
                </p>
                <p style={{ margin: "0", fontWeight: "600" }}>
                  {new Date(candidate.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Profile Completeness
                </p>
                <div style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "rgba(12, 15, 29, 0.1)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  marginTop: "5px"
                }}>
                  <div style={{
                    width: "75%",
                    height: "100%",
                    backgroundColor: "var(--accent)"
                  }} />
                </div>
                <p style={{ margin: "5px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                  75%
                </p>
              </div>
            </div>
          </div>

          {/* Applications Stats */}
          {candidate.applicationCount && (
            <div style={{
              padding: "20px",
              border: "1px solid rgba(12, 15, 29, 0.1)",
              borderRadius: "10px",
              backgroundColor: "#fff",
              marginBottom: "20px"
            }}>
              <h3 style={{ marginTop: "0" }}>Applications</h3>
              <div>
                <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.85rem" }}>
                  Total
                </p>
                <p style={{ margin: "0", fontSize: "1.5rem", fontWeight: "600" }}>
                  {candidate.applicationCount}
                </p>
              </div>
            </div>
          )}

          {/* Documents */}
          {candidate.resume && (
            <div style={{
              padding: "20px",
              border: "1px solid rgba(12, 15, 29, 0.1)",
              borderRadius: "10px",
              backgroundColor: "#fff"
            }}>
              <h3 style={{ marginTop: "0" }}>Documents</h3>
              <a
                href={candidate.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: "100%", textAlign: "center" }}
              >
                Download Resume
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
