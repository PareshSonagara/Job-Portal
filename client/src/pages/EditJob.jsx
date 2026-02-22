import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import Loading from "../components/Loading";
import "./Page.css";

export default function EditJob() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const { success: showSuccess, error: showError } = useResponse();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const today = new Date().toISOString().split("T")[0];

    const [formData, setFormData] = useState({
        jobTitle: "",
        jobPosition: "",
        jobNature: "onsite",
        jobDescription: "",
        salary: "",
        deadline: "",
        skills: "",
        requirements: "",
    });

    // Guard: only Hiring-Manager or Admin
    useEffect(() => {
        if (user && user.role === "Candidate") {
            navigate("/jobs");
        }
    }, [user, navigate]);

    // Load existing job data
    useEffect(() => {
        const loadJob = async () => {
            try {
                setLoading(true);
                const response = await jobAPI.getJobById(id);
                const job = response.data || response;
                setFormData({
                    jobTitle: job.jobTitle || "",
                    jobPosition: job.jobPosition || "",
                    jobNature: job.jobNature || "onsite",
                    jobDescription: job.jobDescription || "",
                    salary: job.salary || "",
                    deadline: job.deadline ? job.deadline.slice(0, 10) : "",
                    skills: Array.isArray(job.skills) ? job.skills.join(", ") : job.skills || "",
                    requirements: Array.isArray(job.requirements)
                        ? job.requirements.join("\n")
                        : job.requirements || "",
                });
            } catch (err) {
                showError(err.message || "Failed to load job details");
                setTimeout(() => navigate("/manager/jobs"), 2000);
            } finally {
                setLoading(false);
            }
        };

        if (id) loadJob();
    }, [id, navigate, showError]);

    const validate = () => {
        const errs = {};
        if (!formData.jobTitle.trim()) errs.jobTitle = "Job title is required";
        if (!formData.jobDescription.trim()) errs.jobDescription = "Job description is required";
        if (!formData.salary || isNaN(formData.salary) || Number(formData.salary) <= 0)
            errs.salary = "Enter a valid salary amount";
        if (!formData.deadline) errs.deadline = "Deadline is required";
        else if (formData.deadline <= today) errs.deadline = "Deadline must be a future date";
        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        try {
            setSaving(true);

            // Parse comma-separated skills and newline-separated requirements
            const skillsArray = formData.skills
                ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
                : [];
            const requirementsArray = formData.requirements
                ? formData.requirements.split("\n").map((r) => r.trim()).filter(Boolean)
                : [];

            const payload = {
                jobTitle: formData.jobTitle,
                jobPosition: formData.jobPosition || formData.jobTitle,
                jobNature: formData.jobNature,
                jobDescription: formData.jobDescription,
                salary: Number(formData.salary),
                deadline: formData.deadline,
                skills: skillsArray,
                requirements: requirementsArray,
            };

            await jobAPI.updateJob(id, payload, token);
            showSuccess("Job updated successfully!");
            navigate("/manager/jobs");
        } catch (err) {
            showError(err.message || "Failed to update job");
            setErrors({ submit: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="page">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <div>
                    <h1 style={{ margin: "0 0 6px" }}>Edit Job</h1>
                    <p style={{ margin: "0", color: "var(--muted)" }}>Update the job posting details below</p>
                </div>
                <button
                    onClick={() => navigate("/manager/jobs")}
                    className="btn ghost"
                >
                    ← Back to My Jobs
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: "700px" }}>
                {errors.submit && <div className="error-message">{errors.submit}</div>}

                {/* Row: Title + Position */}
                <div className="grid">
                    <div className="form-group">
                        <label htmlFor="jobTitle">Job Title *</label>
                        <input
                            id="jobTitle"
                            type="text"
                            name="jobTitle"
                            placeholder="e.g. Senior Frontend Developer"
                            value={formData.jobTitle}
                            onChange={handleChange}
                            className={errors.jobTitle ? "error" : ""}
                            disabled={saving}
                        />
                        {errors.jobTitle && <span className="error">{errors.jobTitle}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="jobPosition">Job Position</label>
                        <input
                            id="jobPosition"
                            type="text"
                            name="jobPosition"
                            placeholder="e.g. Full-Time, Part-Time"
                            value={formData.jobPosition}
                            onChange={handleChange}
                            disabled={saving}
                        />
                    </div>
                </div>

                {/* Row: Salary + Nature */}
                <div className="grid">
                    <div className="form-group">
                        <label htmlFor="salary">Annual Salary ($) *</label>
                        <input
                            id="salary"
                            type="number"
                            name="salary"
                            placeholder="e.g. 85000"
                            min="0"
                            value={formData.salary}
                            onChange={handleChange}
                            className={errors.salary ? "error" : ""}
                            disabled={saving}
                        />
                        {errors.salary && <span className="error">{errors.salary}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="jobNature">Job Type *</label>
                        <select
                            id="jobNature"
                            name="jobNature"
                            value={formData.jobNature}
                            onChange={handleChange}
                            disabled={saving}
                        >
                            <option value="onsite">On-Site</option>
                            <option value="remote">Remote</option>
                        </select>
                    </div>
                </div>

                {/* Deadline */}
                <div className="form-group">
                    <label htmlFor="deadline">Application Deadline *</label>
                    <input
                        id="deadline"
                        type="date"
                        name="deadline"
                        min={today}
                        value={formData.deadline}
                        onChange={handleChange}
                        className={errors.deadline ? "error" : ""}
                        disabled={saving}
                    />
                    {errors.deadline && <span className="error">{errors.deadline}</span>}
                </div>

                {/* Description */}
                <div className="form-group">
                    <label htmlFor="jobDescription">Job Description *</label>
                    <textarea
                        id="jobDescription"
                        name="jobDescription"
                        placeholder="Describe the role, responsibilities, and expectations..."
                        rows={5}
                        value={formData.jobDescription}
                        onChange={handleChange}
                        className={errors.jobDescription ? "error" : ""}
                        disabled={saving}
                    />
                    {errors.jobDescription && <span className="error">{errors.jobDescription}</span>}
                </div>

                {/* Skills */}
                <div className="form-group">
                    <label htmlFor="skills">Required Skills</label>
                    <input
                        id="skills"
                        type="text"
                        name="skills"
                        placeholder="React, Node.js, MongoDB (comma-separated)"
                        value={formData.skills}
                        onChange={handleChange}
                        disabled={saving}
                    />
                    <small style={{ color: "var(--muted)" }}>Separate skills with commas</small>
                </div>

                {/* Requirements */}
                <div className="form-group">
                    <label htmlFor="requirements">Requirements</label>
                    <textarea
                        id="requirements"
                        name="requirements"
                        placeholder={"3+ years of experience\nBachelor's degree in CS\nStrong communication skills"}
                        rows={4}
                        value={formData.requirements}
                        onChange={handleChange}
                        disabled={saving}
                    />
                    <small style={{ color: "var(--muted)" }}>One requirement per line</small>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                        type="button"
                        className="btn ghost"
                        onClick={() => navigate("/manager/jobs")}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
