import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jobAPI } from "../lib/api";
import { useResponse } from "../state/ResponseContext";
import { useAuth } from "../state/AuthContext";
import Loading from "../components/Loading";
import "./Page.css";

export default function JobsListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error: showError } = useResponse();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterSalary, setFilterSalary] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [locations, setLocations] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getAllJobs();
        // API returns { jobs: [], totalJobs: 0, pageCount: 0 }
        const jobsData = response.data?.jobs || response.jobs || [];
        setJobs(jobsData);

        // Extract unique locations
        const uniqueLocations = [
          ...new Set(jobsData.map((j) => j.companyInfo?.location).filter(Boolean)),
        ];
        setLocations(uniqueLocations);
      } catch (err) {
        showError(err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [showError]);

  // Apply filters + sort
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.jobTitle?.toLowerCase().includes(search) ||
          job.companyInfo?.companyName?.toLowerCase().includes(search) ||
          job.jobDescription?.toLowerCase().includes(search)
      );
    }

    if (filterLocation) {
      filtered = filtered.filter((job) => job.companyInfo?.location === filterLocation);
    }

    if (filterSalary) {
      filtered = filtered.filter((job) => {
        if (filterSalary === "50k") return job.salary >= 50000;
        if (filterSalary === "100k") return job.salary >= 100000;
        if (filterSalary === "150k") return job.salary >= 150000;
        return true;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "salary-desc") return (b.salary || 0) - (a.salary || 0);
      if (sortBy === "salary-asc") return (a.salary || 0) - (b.salary || 0);
      if (sortBy === "name-asc") return (a.jobTitle || "").localeCompare(b.jobTitle || "");
      if (sortBy === "name-desc") return (b.jobTitle || "").localeCompare(a.jobTitle || "");
      if (sortBy === "location-asc")
        return (a.companyInfo?.location || "").localeCompare(b.companyInfo?.location || "");
      if (sortBy === "location-desc")
        return (b.companyInfo?.location || "").localeCompare(a.companyInfo?.location || "");
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    setFilteredJobs(sorted);
  }, [jobs, searchTerm, filterLocation, filterSalary, sortBy]);

  if (loading) return <Loading />;

  return (
    <div className="page">
      <h1>Job Opportunities</h1>
      <p style={{ color: "var(--muted)", marginBottom: "30px" }}>
        Showing {filteredJobs.length} of {jobs.length} jobs
      </p>

      {/* Filters */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "rgba(12, 15, 29, 0.03)",
          borderRadius: "10px",
        }}
      >
        <div className="form-group" style={{ margin: "0" }}>
          <label htmlFor="search">Search Jobs</label>
          <input
            id="search"
            type="text"
            placeholder="Job title, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", marginTop: "8px" }}
          />
        </div>

        <div className="form-group" style={{ margin: "0" }}>
          <label htmlFor="location">Location</label>
          <select
            id="location"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            style={{ width: "100%", marginTop: "8px" }}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: "0" }}>
          <label htmlFor="salary">Min Salary</label>
          <select
            id="salary"
            value={filterSalary}
            onChange={(e) => setFilterSalary(e.target.value)}
            style={{ width: "100%", marginTop: "8px" }}
          >
            <option value="">Any Salary</option>
            <option value="50k">$50,000+</option>
            <option value="100k">$100,000+</option>
            <option value="150k">$150,000+</option>
          </select>
        </div>

        <div className="form-group" style={{ margin: "0" }}>
          <label htmlFor="sort">Sort By</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: "100%", marginTop: "8px" }}
          >
            <option value="newest">Newest</option>
            <option value="salary-desc">Salary: High to Low</option>
            <option value="salary-asc">Salary: Low to High</option>
            <option value="name-asc">Job Title: A to Z</option>
            <option value="name-desc">Job Title: Z to A</option>
            <option value="location-asc">Location: A to Z</option>
            <option value="location-desc">Location: Z to A</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterLocation("");
              setFilterSalary("");
              setSortBy("newest");
            }}
            className="btn ghost"
            style={{ width: "100%" }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--muted)",
          }}
        >
          <p style={{ fontSize: "1.1rem" }}>No jobs found matching your criteria</p>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              onClick={() => navigate(`/jobs/${job._id}`)}
              style={{
                padding: "20px",
                border: "1px solid rgba(12, 15, 29, 0.1)",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.2s",
                backgroundColor: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateX(0)";
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
                  <h3 style={{ margin: "0 0 5px", fontSize: "1.2rem" }}>{job.jobTitle}</h3>
                  <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.95rem" }}>
                    {job.companyInfo?.companyName || "Company"} •{" "}
                    {job.companyInfo?.location || "Location"}
                  </p>
                </div>
                {job.salary && (
                  <div
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "#fff",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      whiteSpace: "nowrap",
                      fontWeight: "600",
                    }}
                  >
                    ${(job.salary / 1000).toFixed(0)}K
                  </div>
                )}
              </div>

              <p
                style={{
                  margin: "0 0 15px",
                  color: "var(--muted)",
                  fontSize: "0.95rem",
                  maxHeight: "60px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {job.jobDescription}
              </p>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {job.skills?.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    style={{
                      fontSize: "0.8rem",
                      padding: "4px 12px",
                      backgroundColor: "rgba(12, 15, 29, 0.08)",
                      borderRadius: "20px",
                      color: "var(--ink)",
                    }}
                  >
                    {skill}
                  </span>
                ))}
                {job.skills?.length > 4 && (
                  <span
                    style={{
                      fontSize: "0.8rem",
                      padding: "4px 12px",
                      color: "var(--muted)",
                    }}
                  >
                    +{job.skills.length - 4}
                  </span>
                )}
              </div>

              <div
                style={{
                  marginTop: "15px",
                  paddingTop: "15px",
                  borderTop: "1px solid rgba(12, 15, 29, 0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem",
                  color: "var(--muted)",
                }}
              >
                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                {user && (
                  <span style={{ color: "var(--accent)", fontWeight: "600" }}>View Details →</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
