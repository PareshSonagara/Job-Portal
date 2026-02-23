import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

/**
 * GuestRoute — redirects already-logged-in users away from login/signup pages
 * to their role-appropriate home page. If the user navigated here intentionally
 * (e.g. clicked "Register" in the footer), they are first logged out and then
 * shown the page.
 *
 * Usage: wrap /login and /signup routes with <GuestRoute logoutFirst>
 *   logoutFirst={true}  → auto-logout then render the page (for Register links)
 *   logoutFirst={false} → just redirect away (for /login route)
 */
const roleHome = {
  Candidate: "/jobs",
  "Hiring-Manager": "/manager/dashboard",
  Admin: "/admin/dashboard",
};

export const GuestRoute = ({ children, logoutFirst = false }) => {
  const { isAuthenticated, user, logout, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    if (logoutFirst) {
      // Logout immediately, then render the auth page
      logout();
      return children;
    }
    // Not a logout scenario — just redirect to their dashboard
    const home = roleHome[user?.role] || "/";
    return <Navigate to={home} replace />;
  }

  return children;
};
