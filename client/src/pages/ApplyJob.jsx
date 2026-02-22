import { useState } from "react";
import "./Page.css";

export default function ApplyJob({ api }) {
  const [jobId, setJobId] = useState("");
  const [resume, setResume] = useState(null);

  const submit = async () => {
    if (!jobId.trim()) {
      return api.wrap("Missing job id", Promise.reject({ error: "Job id required" }));
    }
    if (!resume) {
      return api.wrap("Missing resume", Promise.reject({ error: "Resume required" }));
    }
    const formData = new FormData();
    formData.append("resume", resume);

    await api.wrap(
      "Apply job",
      api.requestForm(`/api/v1/jobs/${jobId.trim()}/apply`, formData)
    );
  };

  return (
    <section className="page">
      <h1>Apply to Job</h1>
      <label>Job ID</label>
      <input value={jobId} onChange={(event) => setJobId(event.target.value)} />
      <label>Resume (PDF)</label>
      <input
        type="file"
        accept="application/pdf"
        onChange={(event) => setResume(event.target.files?.[0] || null)}
      />
      <button onClick={submit}>Apply</button>
      <p className="note">
        Requires Candidate token and Google Drive configuration in the backend.
      </p>
    </section>
  );
}
