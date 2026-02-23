import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jobAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import Loading from "../components/Loading";
import "./Page.css";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error: showError } = useResponse();
  const [highestPaid, setHighestPaid] = useState([]);
  const [mostApplied, setMostApplied] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const [paidRes, appliedRes] = await Promise.all([
          jobAPI.getHighestPaidJobs(),
          jobAPI.getMostAppliedJobs(),
        ]);
        setHighestPaid(paidRes.data || []);
        setMostApplied(appliedRes.data || []);
      } catch (err) {
        showError(err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [showError]);

  if (loading) return <Loading />;

  const renderJobCard = (job) => (
    <div
      key={job._id}
      style={{
        padding: "20px",
        border: "1px solid rgba(12, 15, 29, 0.1)",
        borderRadius: "10px",
        cursor: "pointer",
        transition: "all 0.2s",
        backgroundColor: "#fff",
      }}
      onClick={() => navigate(`/jobs/${job._id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem" }}>{job.jobTitle}</h3>
      <p style={{ margin: "0 0 10px", color: "var(--muted)", fontSize: "0.9rem" }}>
        {job.companyInfo?.companyName || "Company"}
      </p>
      <p style={{ margin: "0 0 10px", color: "var(--muted)", fontSize: "0.85rem" }}>
        📍 {job.companyInfo?.location || "Location not specified"}
      </p>
      {job.salary && (
        <p style={{ margin: "0 0 10px", color: "var(--accent)", fontWeight: "600" }}>
          💰 ${job.salary.toLocaleString()}
        </p>
      )}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {job.skills?.slice(0, 3).map((skill) => (
          <span
            key={skill}
            style={{
              fontSize: "0.8rem",
              padding: "4px 10px",
              backgroundColor: "var(--accent)",
              color: "#fff",
              borderRadius: "20px",
            }}
          >
            {skill}
          </span>
        ))}
        {job.skills?.length > 3 && (
          <span
            style={{
              fontSize: "0.8rem",
              padding: "4px 10px",
              color: "var(--muted)",
            }}
          >
            +{job.skills.length - 3}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="page">
      {/* Hero Section */}
      <section
        style={{
          textAlign: "center",
          paddingBottom: "60px",
          borderBottom: "1px solid rgba(12, 15, 29, 0.1)",
          marginBottom: "60px",
        }}
      >
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
          Find Your Dream Job
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "var(--muted)",
            marginBottom: "40px",
          }}
        >
          Explore thousands of job opportunities with all the information you need
        </p>
        <Link to="/jobs" className="btn btn-primary" style={{ padding: "12px 30px" }}>
          Browse All Jobs
        </Link>
      </section>

      {/* Hero Stats */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "60px",
        }}
      >
        <div
          style={{
            padding: "30px",
            backgroundColor: "var(--accent)",
            color: "#fff",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>1000+</div>
          <p style={{ margin: "8px 0 0", opacity: "0.9" }}>Active Jobs</p>
        </div>
        <div
          style={{
            padding: "30px",
            backgroundColor: "var(--accent)",
            color: "#fff",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>500+</div>
          <p style={{ margin: "8px 0 0", opacity: "0.9" }}>Companies</p>
        </div>
        <div
          style={{
            padding: "30px",
            backgroundColor: "var(--accent)",
            color: "#fff",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>10K+</div>
          <p style={{ margin: "8px 0 0", opacity: "0.9" }}>Happy Candidates</p>
        </div>
      </section>

      {/* Highest Paid Jobs Section */}
      {highestPaid.length > 0 && (
        <section style={{ marginBottom: "60px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 8px" }}>Highest Paying Jobs</h2>
              <p style={{ margin: "0", color: "var(--muted)" }}>Top salary opportunities</p>
            </div>
            <Link
              to="/jobs"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              View All →
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {highestPaid.slice(0, 3).map(renderJobCard)}
          </div>
        </section>
      )}

      {/* Most Applied Jobs Section */}
      {mostApplied.length > 0 && (
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 8px" }}>Most Popular Jobs</h2>
              <p style={{ margin: "0", color: "var(--muted)" }}>Trending opportunities</p>
            </div>
            <Link
              to="/jobs"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              View All →
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {mostApplied.slice(0, 3).map(renderJobCard)}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section
          style={{
            backgroundColor: "var(--accent)",
            color: "#fff",
            padding: "60px 40px",
            borderRadius: "10px",
            textAlign: "center",
            marginTop: "60px",
          }}
        >
          <h2 style={{ margin: "0 0 15px" }}>Ready to Start Your Journey?</h2>
          <p style={{ margin: "0 0 30px", fontSize: "1.1rem", opacity: "0.95" }}>
            Create an account and apply to your dream jobs today
          </p>
          <Link
            to="/signup"
            className="btn"
            style={{
              backgroundColor: "#fff",
              color: "var(--accent)",
              display: "inline-block",
              padding: "12px 30px",
            }}
          >
            Get Started
          </Link>
        </section>
      )}
    </div>
  );
}
