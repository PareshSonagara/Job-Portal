import { useState } from "react";
import "./Page.css";

export default function CompanyDashboard({ api }) {
  const [jobId, setJobId] = useState("");
  const [payload, setPayload] = useState(
    '{\n  "jobTitle": "updated title"\n}'
  );

  const fetchMine = () =>
    api.wrap("Manager jobs", api.requestJson("/api/v1/manager/jobs"));

  const fetchById = () => {
    if (!jobId.trim()) {
      return api.wrap("Missing job id", Promise.reject({ error: "Job id required" }));
    }
    return api.wrap(
      "Manager job",
      api.requestJson(`/api/v1/manager/jobs/${jobId.trim()}`)
    );
  };

  const updateJob = async () => {
    if (!jobId.trim()) {
      return api.wrap("Missing job id", Promise.reject({ error: "Job id required" }));
    }
    let body = {};
    if (payload.trim()) {
      try {
        body = JSON.parse(payload);
      } catch (error) {
        return api.wrap("Invalid JSON", Promise.reject({ error: error.message }));
      }
    }
    await api.wrap(
      "Update job",
      api.requestJson(`/api/v1/jobs/${jobId.trim()}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      })
    );
  };

  return (
    <section className="page">
      <h1>Company Dashboard</h1>
      <div className="actions">
        <button onClick={fetchMine}>Fetch my jobs</button>
        <button className="ghost" onClick={fetchById}>Fetch by ID</button>
      </div>
      <label>Update job by ID</label>
      <input value={jobId} onChange={(event) => setJobId(event.target.value)} />
      <label>Partial update (JSON)</label>
      <textarea
        value={payload}
        onChange={(event) => setPayload(event.target.value)}
      />
      <button onClick={updateJob}>Update job</button>
      <p className="note">Requires Admin or Hiring-Manager token.</p>
    </section>
  );
}
