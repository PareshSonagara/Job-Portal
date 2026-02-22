import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobAPI, userAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import Loading from "../components/Loading";
import "./Page.css";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { success: showSuccess, error: showError } = useResponse();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  // Freshly fetched resume URL (may differ from stale AuthContext user)
  const [savedResumeURL, setSavedResumeURL] = useState(user?.resumeURL || null);
  const [formData, setFormData] = useState({
    resume: null,
    coverLetter: ""
  });
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [errors, setErrors] = useState({});
  const BACKEND = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:5000";
  const resolveUrl = (url) => (!url || url.startsWith("http") ? url : `${BACKEND}${url}`);
  // The effective saved resume: prefer freshly fetched, fall back to context
  const effectiveResumeURL = savedResumeURL || user?.resumeURL || null;

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getJobById(id);
        setJob(response.data || response);
      } catch (err) {
        showError(err.message || "Failed to load job");
        setTimeout(() => navigate("/jobs"), 2000);
      } finally {
        setLoading(false);
      }
    };

    const checkAlreadyApplied = async () => {
      if (!token || user?.role !== "Candidate") return;
      try {
        const profileRes = await userAPI.getProfile(token);
        const profile = profileRes.data || profileRes;
        // Update the saved resume URL from the freshly fetched profile
        if (profile.resumeURL) setSavedResumeURL(profile.resumeURL);
        // Check if already applied
        const appliedJobs = profile.appliedJobs || [];
        const alreadyApplied = appliedJobs.some(
          (app) => (app.job?._id || app.job) === id
        );
        if (alreadyApplied) setApplied(true);
      } catch {
        // silently ignore
      }
    };

    loadJob();
    checkAlreadyApplied();
  }, [id, navigate, showError, token, user?.role]);

  const validateForm = () => {
    const newErrors = {};
    const hasProfileResume = useProfileResume && effectiveResumeURL;
    if (!hasProfileResume && !formData.resume) {
      newErrors.resume = "Please upload a resume, or save one to your profile first";
    }
    // Cover letter is optional
    return newErrors;
  };

  const handleApply = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setApplying(true);
      const form = new FormData();

      if (!useProfileResume || !effectiveResumeURL) {
        form.append("resume", formData.resume);
      } else {
        form.append("profileResumeURL", effectiveResumeURL);
      }
      form.append("coverLetter", formData.coverLetter);

      await jobAPI.applyJob(id, form, token);
      showSuccess("Application submitted successfully!");
      setApplied(true);
      setFormData({ resume: null, coverLetter: "" });
      setErrors({});
    } catch (err) {
      showError(err.message || "Failed to apply for job");
      setErrors({ submit: err.message });
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loading />;

  if (!job) {
    return (
      <div className="page" style={{ textAlign: "center" }}>
        <p>Job not found</p>
        <Link to="/jobs" className="btn btn-primary">Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Job Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start",
        marginBottom: "30px",
        paddingBottom: "30px",
        borderBottom: "1px solid rgba(12, 15, 29, 0.1)"
      }}>
        <div style={{ flex: "1" }}>
          <h1 style={{ margin: "0 0 10px" }}>{job.jobTitle}</h1>
          <p style={{ margin: "0 0 15px", color: "var(--muted)", fontSize: "1.05rem" }}>
            {job.companyInfo?.companyName || "Company"}
          </p>
          <div style={{ display: "flex", gap: "30px", color: "var(--muted)" }}>
            <span>📍 {job.companyInfo?.location || "Location not specified"}</span>
            {job.salary && <span>💰 ${job.salary.toLocaleString()}/year</span>}
            <span>📅 Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        {user && user.role === "Candidate" && (
          <div>
            {!applied ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("apply-form").scrollIntoView({ behavior: "smooth" });
                }}
                className="btn btn-primary"
                style={{ padding: "10px 25px" }}
              >
                Apply Now
              </button>
            ) : (
              <div style={{
                padding: "10px 20px",
                backgroundColor: "var(--accent)",
                color: "#fff",
                borderRadius: "10px",
                fontWeight: "600"
              }}>
                ✓ Applied
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "30px"
      }}>
        {/* Main Content */}
        <div>
          {/* Job Description */}
          <section style={{ marginBottom: "30px" }}>
            <h2>About this role</h2>
            <p style={{ lineHeight: "1.7", color: "var(--ink)" }}>
              {job.jobDescription}
            </p>
          </section>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <section style={{ marginBottom: "30px" }}>
              <h2>Requirements</h2>
              <ul style={{ lineHeight: "1.8" }}>
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <section style={{ marginBottom: "30px" }}>
              <h2>Required Skills</h2>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {job.skills.map(skill => (
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
            </section>
          )}

          {/* Application Form */}
          {user && user.role === "Candidate" && !applied && (
            <section id="apply-form" style={{
              padding: "30px",
              backgroundColor: "rgba(12, 15, 29, 0.03)",
              borderRadius: "10px"
            }}>
              <h2 style={{ marginTop: "0" }}>Apply for this position</h2>
              <form onSubmit={handleApply}>
                {errors.submit && <div className="error-message">{errors.submit}</div>}

                <div className="form-group">
                  <label>Resume</label>

                  {/* Option A: Use existing profile resume */}
                  {effectiveResumeURL && (
                    <div style={{
                      padding: "12px 16px",
                      border: `2px solid ${useProfileResume ? "var(--accent)" : "rgba(12,15,29,0.1)"}`,
                      borderRadius: "8px",
                      marginBottom: "12px",
                      cursor: "pointer",
                      backgroundColor: useProfileResume ? "rgba(99,102,241,0.05)" : "#fff",
                    }}
                      onClick={() => { setUseProfileResume(true); setFormData({ ...formData, resume: null }); }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "1.3rem" }}>📄</span>
                          <div>
                            <p style={{ margin: "0", fontWeight: "600", fontSize: "0.9rem" }}>Use my saved resume</p>
                            <a href={resolveUrl(effectiveResumeURL)} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: "0.8rem", color: "var(--accent)" }}
                              onClick={(e) => e.stopPropagation()}>
                              Preview →
                            </a>
                          </div>
                        </div>
                        {useProfileResume && <span style={{ color: "var(--accent)", fontWeight: "700" }}>✓ Selected</span>}
                      </div>
                    </div>
                  )}

                  {/* Option B: Upload a new resume */}
                  <div style={{
                    padding: "12px 16px",
                    border: `2px solid ${!useProfileResume ? "var(--accent)" : "rgba(12,15,29,0.1)"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: !useProfileResume ? "rgba(99,102,241,0.05)" : "#fff",
                  }}
                    onClick={() => setUseProfileResume(false)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "1.3rem" }}>⬆️</span>
                      <p style={{ margin: "0", fontWeight: "600", fontSize: "0.9rem" }}>
                        {effectiveResumeURL ? "Upload a different resume" : "Upload resume (PDF)"}
                      </p>
                    </div>
                    {!useProfileResume && (
                      <div style={{ marginTop: "10px" }}>
                        <input
                          id="resume"
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            setFormData({ ...formData, resume: e.target.files[0] });
                            setErrors({ ...errors, resume: "" });
                          }}
                          className={errors.resume ? "error" : ""}
                          style={{ width: "100%" }}
                        />
                        {formData.resume && <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>Selected: {formData.resume.name}</p>}
                      </div>
                    )}
                  </div>

                  {errors.resume && <span className="error">{errors.resume}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="coverLetter">Cover Letter <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: "0.85rem" }}>(optional)</span></label>
                  <textarea
                    id="coverLetter"
                    placeholder="Tell us why you're interested in this position..."
                    value={formData.coverLetter}
                    onChange={(e) => {
                      setFormData({ ...formData, coverLetter: e.target.value });
                      setErrors({ ...errors, coverLetter: "" });
                    }}
                    className={errors.coverLetter ? "error" : ""}
                  />
                  {errors.coverLetter && <span className="error">{errors.coverLetter}</span>}
                  <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "8px" }}>
                    {formData.coverLetter.length} characters
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={applying}
                  style={{ width: "100%" }}
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            </section>
          )}

          {applied && (
            <div style={{
              padding: "30px",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              borderRadius: "10px",
              textAlign: "center",
              marginTop: "30px"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "15px" }}>✓</div>
              <h3>Application Submitted!</h3>
              <p style={{ color: "var(--muted)" }}>
                Thank you for applying. The hiring team will review your application and contact you soon.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Company Card */}
          <div style={{
            padding: "20px",
            border: "1px solid rgba(12, 15, 29, 0.1)",
            borderRadius: "10px"
          }}>
            <h3 style={{ marginTop: "0" }}>About Company</h3>
            <h4 style={{ margin: "0 0 8px" }}>{job.companyInfo?.companyName || "Company"}</h4>
            <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.9rem" }}>
              {job.companyInfo?.location || "Location not specified"}
            </p>
            {job.companyInfo?.companyWebsite && (
              <div style={{ marginTop: "15px" }}>
                <a
                  href={job.companyInfo.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn ghost"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  Visit Website →
                </a>
              </div>
            )}
          </div>

          {/* Job Details Card */}
          <div style={{
            padding: "20px",
            border: "1px solid rgba(12, 15, 29, 0.1)",
            borderRadius: "10px",
            marginTop: "20px"
          }}>
            <h3 style={{ marginTop: "0" }}>Job Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {job.jobNature && (
                <div>
                  <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.9rem" }}>Job Type</p>
                  <p style={{ margin: "5px 0 0", fontWeight: "600" }}>{job.jobNature}</p>
                </div>
              )}
              {job.deadline && (
                <div>
                  <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.9rem" }}>Deadline</p>
                  <p style={{ margin: "5px 0 0", fontWeight: "600" }}>
                    {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
              {job.applicationDeadline && (
                <div>
                  <p style={{ margin: "0", color: "var(--muted)", fontSize: "0.9rem" }}>Application Deadline</p>
                  <p style={{ margin: "5px 0 0", fontWeight: "600" }}>
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
