import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import Loading from "../components/Loading";
import "./Page.css";

export default function AdminCandidates() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { error: showError } = useResponse();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

    const loadCandidates = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getCandidates(token);
        setCandidates(response.data || []);
      } catch (err) {
        showError(err.message || "Failed to load candidates");
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [user, token, navigate, showError]);

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
          <h1 style={{ margin: "0" }}>Manage Candidates</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
            Total: {candidates.length} candidates
          </p>
        </div>
        <Link to="/admin/dashboard" className="btn ghost">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Search and Filter */}
      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          gap: "10px",
        }}
      >
        <div className="form-group" style={{ flex: "1", margin: "0" }}>
          <label htmlFor="search">Search Candidates</label>
          <input
            id="search"
            type="text"
            placeholder="Name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", marginTop: "8px" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={() => setSearchTerm("")}
            className="btn ghost"
            style={{ padding: "10px 20px" }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Candidates List */}
      {filteredCandidates.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--muted)",
          }}
        >
          <p style={{ fontSize: "1.1rem" }}>No candidates found</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredCandidates.map((candidate) => (
            <div
              key={candidate._id}
              style={{
                padding: "20px",
                border: "1px solid rgba(12, 15, 29, 0.1)",
                borderRadius: "10px",
                backgroundColor: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    marginRight: "12px",
                    overflow: "hidden",
                  }}
                >
                  {candidate.imageURL ? (
                    <img
                      src={resolveUrl(candidate.imageURL)}
                      alt={candidate.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    candidate.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ flex: "1" }}>
                  <h3 style={{ margin: "0" }}>{candidate.name}</h3>
                  <p style={{ margin: "5px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                    {candidate.email}
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginBottom: "15px",
                  paddingBottom: "15px",
                  borderBottom: "1px solid rgba(12, 15, 29, 0.05)",
                }}
              >
                {candidate.location && (
                  <p style={{ margin: "8px 0", fontSize: "0.9rem" }}>📍 {candidate.location}</p>
                )}
                <p style={{ margin: "8px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                  Joined {new Date(candidate.createdAt).toLocaleDateString()}
                </p>
              </div>

              {candidate.skills && candidate.skills.length > 0 && (
                <div style={{ marginBottom: "15px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--muted)" }}>
                    Skills
                  </p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: "0.75rem",
                          padding: "4px 8px",
                          backgroundColor: "rgba(12, 15, 29, 0.08)",
                          borderRadius: "12px",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span
                        style={{ fontSize: "0.75rem", padding: "4px 8px", color: "var(--muted)" }}
                      >
                        +{candidate.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <Link
                to={`/admin/candidates/${candidate._id}`}
                className="btn btn-primary"
                style={{ width: "100%", textAlign: "center" }}
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
