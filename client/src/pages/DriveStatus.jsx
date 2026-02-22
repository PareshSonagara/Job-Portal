import "./Page.css";

export default function DriveStatus() {
  return (
    <section className="page">
      <h1>Google Drive Status</h1>
      <p>
        The apply endpoint uploads resumes to Google Drive. If it is not
        configured, the request will fail.
      </p>
      <h3>Backend checklist</h3>
      <ul>
        <li>Service JSON exists in the server folder and matches the path.</li>
        <li><strong>GOOGLE_DRIVE_FOLDER_ID</strong> is set in .env.</li>
        <li>The service account has access to that Drive folder.</li>
      </ul>
      <h3>Common errors</h3>
      <ul>
        <li>Invalid token: wrong or missing Drive folder ID.</li>
        <li>Permission denied: service account not shared on folder.</li>
      </ul>
    </section>
  );
}
