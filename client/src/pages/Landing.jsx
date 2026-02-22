import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { jobAPI } from "../lib/api";
import "./Page.css";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [stats, setStats] = useState({
    jobs: 0,
    companies: 0,
    candidates: 0,
    placements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsRes, statsRes] = await Promise.all([
          jobAPI.getMostAppliedJobs(),
          jobAPI.getStats(),
        ]);

        // Take top 3 most applied jobs as "featured"
        if (jobsRes.status === "success" && jobsRes.data) {
          setFeaturedJobs(jobsRes.data.slice(0, 3));
        }

        if (statsRes.status === "success" && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch landing data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Dream Job Today</h1>
          <p>Connect with top companies and grow your career</p>
          <div className="hero-buttons">
            <Link to="/jobs" className="btn btn-primary btn-lg">
              Browse Jobs
            </Link>
            {!isAuthenticated && (
              <Link to="/signup" className="btn btn-secondary btn-lg">
                Sign Up
              </Link>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="placeholder-image">💼</div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="featured-section">
        <div className="container">
          <h2>Featured Job Opportunities</h2>
          <p className="subtitle">Check out our latest job openings</p>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="job-cards-grid">
              {featuredJobs.length > 0 ? (
                featuredJobs.map((job) => (
                  <div key={job._id} className="job-card-placeholder">
                    <h3>{job.jobTitle || job.jobPosition}</h3>
                    <p className="company">🏢 {job.companyInfo?.companyName || "Top Company"}</p>
                    <p className="location">📍 {job.companyInfo?.location || "Remote"}</p>
                    <p className="salary">💰 {job.salary ? `$${job.salary}` : "Competitive"}</p>
                    <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-small">
                      View Details
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-center" style={{ gridColumn: "1 / -1", color: "#666" }}>
                  No jobs available right now. Check back soon!
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <h2>Why Choose Job Portal?</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">
                {stats.jobs > 1000 ? `${(stats.jobs / 1000).toFixed(1)}k+` : stats.jobs}+
              </div>
              <div className="stat-label">Jobs Posted</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {stats.companies > 1000 ? `${(stats.companies / 1000).toFixed(1)}k+` : stats.companies}+
              </div>
              <div className="stat-label">Companies</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {stats.candidates > 1000 ? `${(stats.candidates / 1000).toFixed(1)}k+` : stats.candidates}+
              </div>
              <div className="stat-label">Active Candidates</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {stats.placements > 1000 ? `${(stats.placements / 1000).toFixed(1)}k+` : stats.placements}+
              </div>
              <div className="stat-label">Successful Placements</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container text-center">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of professionals finding their next opportunity</p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link to="/jobs" className="btn btn-secondary btn-lg">
              Browse All Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
