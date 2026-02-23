import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./App.css";
import { ResponseProvider } from "./state/ResponseContext.jsx";
import { AuthProvider, useAuth } from "./state/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ResponsePanel from "./components/ResponsePanel.jsx";
import { Footer } from "./components/Footer.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { GuestRoute } from "./components/GuestRoute.jsx";
import Loading from "./components/Loading.jsx";

// Pages
import Landing from "./pages/Landing.jsx";
import Home from "./pages/Home.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";

// Candidate Pages
import Profile from "./pages/Profile.jsx";
import JobsListing from "./pages/JobsListing.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import ApplicationsHistory from "./pages/ApplicationsHistory.jsx";

// Manager Pages
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import ManagerJobs from "./pages/ManagerJobs.jsx";
import ManagerProfile from "./pages/ManagerProfile.jsx";
import CreateJob from "./pages/CreateJob.jsx";
import EditJob from "./pages/EditJob.jsx";
import JobApplications from "./pages/JobApplications.jsx";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminCandidates from "./pages/AdminCandidates.jsx";
import AdminManagers from "./pages/AdminManagers.jsx";
import AdminPromote from "./pages/AdminPromote.jsx";
import CandidateDetails from "./pages/CandidateDetails.jsx";

const AppShell = () => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/jobs" element={<JobsListing />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Auth Routes — redirect logged-in users to their dashboard */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute logoutFirst>
                <Signup />
              </GuestRoute>
            }
          />

          {/* Candidate Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="Candidate">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute requiredRole="Candidate">
                <ApplicationsHistory />
              </ProtectedRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/profile"
            element={
              <ProtectedRoute requiredRole="Hiring-Manager">
                <ManagerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute requiredRole="Hiring-Manager">
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/jobs"
            element={
              <ProtectedRoute requiredRole="Hiring-Manager">
                <ManagerJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/jobs/:id"
            element={
              <ProtectedRoute requiredRole="Hiring-Manager">
                <JobApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-job"
            element={
              <ProtectedRoute requiredRole="Hiring-Manager">
                <CreateJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id/edit"
            element={
              <ProtectedRoute requiredRole="Hiring-Manager">
                <EditJob />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/candidates"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminCandidates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/candidates/:id"
            element={
              <ProtectedRoute requiredRole="Admin">
                <CandidateDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/managers"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminManagers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/promote"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminPromote />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ResponsePanel />
    </div>
  );
};

const AppWithLoadingCheck = () => {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return <AppShell />;
};

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ResponseProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppWithLoadingCheck />
          </BrowserRouter>
        </AuthProvider>
      </ResponseProvider>
    </GoogleOAuthProvider>
  );
}
