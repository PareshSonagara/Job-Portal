import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import "./Page.css";

export default function CreateJob() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { success: showSuccess, error: showError } = useResponse();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    jobNature: "remote",
    skills: "",
    requirements: "",
    applicationDeadline: "",
    companyName: "",
    companyWebsite: ""
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.salary) newErrors.salary = "Salary is required";
    if (Number(formData.salary) <= 0) newErrors.salary = "Salary must be positive";
    if (!formData.applicationDeadline) newErrors.applicationDeadline = "Deadline is required";
    if (new Date(formData.applicationDeadline) <= new Date()) {
      newErrors.applicationDeadline = "Deadline must be in the future";
    }
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.companyWebsite.trim()) newErrors.companyWebsite = "Company website is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const jobData = {
        jobTitle: formData.title,
        jobPosition: formData.title,
        jobNature: formData.jobNature,
        jobDescription: formData.description,
        salary: Number(formData.salary),
        deadline: formData.applicationDeadline,
        location: formData.location,
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        skills: formData.skills ? formData.skills.split(",").map(s => s.trim()) : [],
        requirements: formData.requirements ? formData.requirements.split("\n").filter(r => r.trim()) : []
      };

      await jobAPI.createJob(jobData, token);
      showSuccess("Job posted successfully!");
      setTimeout(() => navigate("/manager/dashboard"), 1500);
    } catch (err) {
      showError(err.message || "Failed to create job");
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  if (user?.role !== "Hiring-Manager" && user?.role !== "Admin") {
    return (
      <div className="page" style={{ textAlign: "center" }}>
        <p>You don't have permission to post jobs</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Post a New Job</h1>
      <p style={{ color: "var(--muted)", marginBottom: "30px" }}>Create a new job posting for your company</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: "600px" }}>
        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <div className="form-group">
          <label htmlFor="title">Job Title *</label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="e.g., Senior React Developer"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? "error" : ""}
            disabled={loading}
          />
          {errors.title && <span className="error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Job Description *</label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe the role, responsibilities, and what you're looking for"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? "error" : ""}
            disabled={loading}
          />
          {errors.description && <span className="error">{errors.description}</span>}
        </div>

        <div className="grid">
          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              id="location"
              type="text"
              name="location"
              placeholder="e.g., San Francisco, CA"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? "error" : ""}
              disabled={loading}
            />
            {errors.location && <span className="error">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="salary">Annual Salary ($) *</label>
            <input
              id="salary"
              type="number"
              name="salary"
              placeholder="100000"
              value={formData.salary}
              onChange={handleChange}
              className={errors.salary ? "error" : ""}
              disabled={loading}
            />
            {errors.salary && <span className="error">{errors.salary}</span>}
          </div>
        </div>

        <div className="grid">
          <div className="form-group">
            <label htmlFor="jobNature">Job Nature *</label>
            <select
              id="jobNature"
              name="jobNature"
              value={formData.jobNature}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input
              id="companyName"
              type="text"
              name="companyName"
              placeholder="Your company name"
              value={formData.companyName}
              onChange={handleChange}
              className={errors.companyName ? "error" : ""}
              disabled={loading}
            />
            {errors.companyName && <span className="error">{errors.companyName}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="companyWebsite">Company Website *</label>
          <input
            id="companyWebsite"
            type="url"
            name="companyWebsite"
            placeholder="https://yourcompany.com"
            value={formData.companyWebsite}
            onChange={handleChange}
            className={errors.companyWebsite ? "error" : ""}
            disabled={loading}
          />
          {errors.companyWebsite && <span className="error">{errors.companyWebsite}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="skills">Required Skills (comma-separated)</label>
          <input
            id="skills"
            type="text"
            name="skills"
            placeholder="React, Node.js, MongoDB, JavaScript"
            value={formData.skills}
            onChange={handleChange}
            disabled={loading}
          />
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "8px" }}>
            Separate multiple skills with commas
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="requirements">Requirements (one per line)</label>
          <textarea
            id="requirements"
            name="requirements"
            placeholder="5+ years of experience&#10;Knowledge of React&#10;Strong communication skills"
            value={formData.requirements}
            onChange={handleChange}
            disabled={loading}
          />
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "8px" }}>
            Each line becomes a separate requirement
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="applicationDeadline">Application Deadline *</label>
          <input
            id="applicationDeadline"
            type="date"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            min={today}
            className={errors.applicationDeadline ? "error" : ""}
            disabled={loading}
          />
          {errors.applicationDeadline && <span className="error">{errors.applicationDeadline}</span>}
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Posting..." : "Post Job"}
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
