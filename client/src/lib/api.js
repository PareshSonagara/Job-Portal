const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const isValidToken = (value) => {
  return typeof value === "string" && value.trim() && value !== "undefined" && value !== "null";
};

// Dispatches a global event so AuthContext can call logout() on 401
const handleUnauthorized = () => {
  window.dispatchEvent(new CustomEvent("auth:logout"));
};

// Helper: standard JSON API call
const apiCall = async (method, endpoint, data = null, token = null) => {
  const headers = { "Content-Type": "application/json" };

  if (isValidToken(token)) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = { method, headers };

  if (data && (method === "POST" || method === "PATCH" || method === "PUT")) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const result = await response.json();

  if (response.status === 401) {
    handleUnauthorized();
  }

  if (!response.ok) {
    throw new Error(result.message || result.error || "API Error");
  }

  return result;
};

// Helper: file upload (multipart/form-data)
const apiCallWithFile = async (method, endpoint, formData, token = null) => {
  const headers = {};

  if (isValidToken(token)) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: formData,
  });
  const result = await response.json();

  if (response.status === 401) {
    handleUnauthorized();
  }

  if (!response.ok) {
    throw new Error(result.message || result.error || "API Error");
  }

  return result;
};

// ─── USER ENDPOINTS ───────────────────────────────────────────────────────────
export const userAPI = {
  signup: (data) => apiCall("POST", "/user/signup", data),
  login: (data) => apiCall("POST", "/user/login", data),
  googleLogin: (credential) => apiCall("POST", "/user/google-login", { credential }),
  checkEmailExists: (email) => apiCall("GET", `/user/check-email/${email}`),
  getProfile: (token) => apiCall("GET", "/user/me", null, token),
  updateProfile: (data, token) => apiCall("PATCH", "/user/me", data, token),
  changePassword: (data, token) => apiCall("PATCH", "/user/change-password", data, token),
  uploadProfileImage: (formData, token) =>
    apiCallWithFile("POST", "/user/upload-image", formData, token),
  uploadProfileResume: (formData, token) =>
    apiCallWithFile("POST", "/user/upload-resume", formData, token),
  getCandidates: (token) => apiCall("GET", "/user/candidates", null, token),
  getCandidateById: (id, token) => apiCall("GET", `/user/candidate/${id}`, null, token),
  getManagers: (token) => apiCall("GET", "/user/hiring-managers", null, token),
  promoteUser: (id, data, token) => apiCall("PUT", `/user/promote/${id}`, data, token),
};

// ─── JOB ENDPOINTS ────────────────────────────────────────────────────────────
export const jobAPI = {
  getHighestPaidJobs: () => apiCall("GET", "/jobs/highest-paid-jobs"),
  getMostAppliedJobs: () => apiCall("GET", "/jobs/most-applied-jobs"),
  getStats: () => apiCall("GET", "/jobs/stats"),
  getAllJobs: (filters = "") => apiCall("GET", `/jobs${filters}`),
  getJobById: (id) => apiCall("GET", `/jobs/${id}`),
  createJob: (data, token) => apiCall("POST", "/jobs", data, token),
  updateJob: (id, data, token) => apiCall("PATCH", `/jobs/${id}`, data, token),
  getManagerJobs: (token) => apiCall("GET", "/manager/jobs", null, token),
  getManagerJobById: (id, token) => apiCall("GET", `/manager/jobs/${id}`, null, token),
  applyJob: (id, formData, token) => apiCallWithFile("POST", `/jobs/${id}/apply`, formData, token),
  updateApplicationStatus: (jobId, appId, status, token) =>
    apiCall("PATCH", `/jobs/${jobId}/applications/${appId}/status`, { status }, token),
  updateApplicationFeedback: (jobId, appId, feedback, token) =>
    apiCall("PATCH", `/jobs/${jobId}/applications/${appId}/feedback`, { feedback }, token),
};
