import { useState } from "react";
import "./Page.css";

export default function Jobs({ api }) {
  const [jobId, setJobId] = useState("");

  const fetchAll = () => api.wrap("Jobs", api.requestJson("/api/v1/jobs"));
  const fetchHighest = () =>
    api.wrap("Highest paid", api.requestJson("/api/v1/jobs/highest-paid-jobs"));
  const fetchMost = () =>
    api.wrap("Most applied", api.requestJson("/api/v1/jobs/most-applied-jobs"));

  const fetchById = () => {
    if (!jobId.trim()) {
      return api.wrap("Missing job id", Promise.reject({ error: "Job id required" }));
    }
    return api.wrap("Job", api.requestJson(`/api/v1/jobs/${jobId.trim()}`));
  };

  return (
    <section className="page">
      <h1>Jobs</h1>
      <div className="actions">
        <button onClick={fetchAll}>Get all jobs</button>
        <button className="ghost" onClick={fetchHighest}>Highest paid</button>
        <button className="ghost" onClick={fetchMost}>Most applied</button>
      </div>
      <label>Get job by ID</label>
      <input value={jobId} onChange={(event) => setJobId(event.target.value)} />
      <button onClick={fetchById}>Fetch job</button>
    </section>
  );
}
