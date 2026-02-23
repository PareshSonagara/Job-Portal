import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jobAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import Loading from "../components/Loading";
import "./Page.css";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { error: showError } = useResponse();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0,
  });

  useEffect(() => {
    if (user?.role !== "Hiring-Manager") {
      navigate("/");
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getManagerJobs(token);
        // API returns { managerInfo, jobs: [] }
        const jobsList = response.data?.jobs || [];
        setJobs(jobsList);

        // Calculate stats
        setStats({
          totalJobs: jobsList.length,
          totalApplications: jobsList.reduce(
            (sum, job) => sum + (job.applicationsCount ?? job.applications?.length ?? 0),
            0
          ),
          activeJobs: jobsList.filter((job) => !job.closed).length,
        });
      } catch (err) {
        showError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, token, navigate, showError]);

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
          <h1 style={{ margin: "0" }}>Manager Dashboard</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
            Welcome back, {user?.firstName}
          </p>
        </div>
        <Link to="/create-job" className="btn btn-primary">
          + Post New Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            padding: "30px",
            backgroundColor: "var(--accent)",
            color: "#fff",
            borderRadius: "10px",
          }}
        >
          <p style={{ margin: "0 0 10px", opacity: "0.9" }}>Total Jobs Posted</p>
          <h3 style={{ margin: "0", fontSize: "2.5rem" }}>{stats.totalJobs}</h3>
        </div>

        <div
          style={{
            padding: "30px",
            backgroundColor: "var(--accent)",
            color: "#fff",
            borderRadius: "10px",
          }}
        >
          <p style={{ margin: "0 0 10px", opacity: "0.9" }}>Active Jobs</p>
          <h3 style={{ margin: "0", fontSize: "2.5rem" }}>{stats.activeJobs}</h3>
        </div>

        <div
          style={{
            padding: "30px",
            backgroundColor: "var(--accent)",
            color: "#fff",
            borderRadius: "10px",
          }}
        >
          <p style={{ margin: "0 0 10px", opacity: "0.9" }}>Total Applications</p>
          <h3 style={{ margin: "0", fontSize: "2.5rem" }}>{stats.totalApplications}</h3>
        </div>
      </div>

      {/* Recent Jobs */}
      <section>
        <h2>Your Job Postings</h2>

        {jobs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--muted)",
            }}
          >
            <p style={{ fontSize: "1.1rem" }}>You haven't posted any jobs yet</p>
            <Link
              to="/create-job"
              className="btn btn-primary"
              style={{ marginTop: "20px", display: "inline-block" }}
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {jobs.map((job) => (
              <div
                key={job._id}
                style={{
                  padding: "20px",
                  border: "1px solid rgba(12, 15, 29, 0.1)",
                  borderRadius: "10px",
                  backgroundColor: "#fff",
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
                  <div>
                    <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem" }}>{job.jobTitle}</h3>
                    <p style={{ margin: "0", color: "var(--muted)" }}>
                      📍 {job.companyInfo?.location || "Location not specified"}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "8px 12px",
                      backgroundColor: job.closed ? "#f44336" : "#4caf50",
                      color: "#fff",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    {job.closed ? "Closed" : "Active"}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "15px",
                    marginBottom: "15px",
                    paddingBottom: "15px",
                    borderBottom: "1px solid rgba(12, 15, 29, 0.05)",
                  }}
                >
                  <div>
                    <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.85rem" }}>
                      Applications
                    </p>
                    <p style={{ margin: "5px 0 0", fontSize: "1.5rem", fontWeight: "600" }}>
                      {job.applicationsCount ?? job.applications?.length ?? 0}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.85rem" }}>
                      Posted Date
                    </p>
                    <p style={{ margin: "5px 0 0", fontWeight: "600" }}>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
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
                    Edit Job
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
