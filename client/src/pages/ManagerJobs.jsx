import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jobAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import Loading from "../components/Loading";
import "./Page.css";

export default function ManagerJobs() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { error: showError } = useResponse();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (user?.role !== "Hiring-Manager") {
      navigate("/");
      return;
    }

    const loadJobs = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getManagerJobs(token);
        // API returns { managerInfo, jobs: [] }
        setJobs(response.data?.jobs || []);
      } catch (err) {
        showError(err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [user, token, navigate, showError]);

  const filteredJobs = filterStatus === "all"
    ? jobs
    : filterStatus === "active"
    ? jobs.filter(j => !j.closed)
    : jobs.filter(j => j.closed);

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px"
      }}>
        <div>
          <h1 style={{ margin: "0" }}>My Job Postings</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
            Manage your job listings
          </p>
        </div>
        <Link to="/create-job" className="btn btn-primary">
          + Post New Job
        </Link>
      </div>

      {/* Status Filter */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "30px",
        flexWrap: "wrap"
      }}>
        {["all", "active", "closed"].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={filterStatus === status ? "btn btn-primary" : "btn ghost"}
            style={{
              padding: "8px 16px",
              fontSize: "0.9rem"
            }}
          >
            {status === "all" ? "All Jobs" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--muted)"
        }}>
          <p style={{ fontSize: "1.1rem" }}>
            {jobs.length === 0 ? "You haven't posted any jobs yet" : "No jobs found"}
          </p>
          {jobs.length === 0 && (
            <Link to="/create-job" className="btn btn-primary" style={{ marginTop: "20px", display: "inline-block" }}>
              Post Your First Job
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {filteredJobs.map(job => (
            <div
              key={job._id}
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
                  <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem" }}>{job.jobTitle}</h3>
                  <p style={{ margin: "0", color: "var(--muted)" }}>
                    📍 {job.companyInfo?.location || "Location not specified"}
                  </p>
                </div>
                <div style={{
                  padding: "8px 12px",
                  backgroundColor: job.closed ? "#f44336" : "#4caf50",
                  color: "#fff",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "600"
                }}>
                  {job.closed ? "Closed" : "Active"}
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
                  <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.85rem" }}>Salary</p>
                  <p style={{ margin: "5px 0 0", fontWeight: "600" }}>
                    ${(job.salary / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.85rem" }}>Applications</p>
                  <p style={{ margin: "5px 0 0", fontWeight: "600" }}>
                    {job.applicationsCount ?? job.applications?.length ?? 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.85rem" }}>Posted</p>
                  <p style={{ margin: "5px 0 0", fontWeight: "600" }}>
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link
                  to={`/jobs/${job._id}`}
                  className="btn ghost"
                  style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                >
                  View Details
                </Link>
                <Link
                  to={`/manager/jobs/${job._id}`}
                  className="btn btn-primary"
                  style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                >
                  View Applications ({job.applicationsCount ?? job.applications?.length ?? 0})
                </Link>
                <Link
                  to={`/jobs/${job._id}/edit`}
                  className="btn ghost"
                  style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
