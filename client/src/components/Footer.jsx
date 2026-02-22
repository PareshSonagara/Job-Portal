import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import "./Footer.css";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // If already logged in and user clicks Register/Sign Up, log them out first
  const handleAuthLink = (e, path) => {
    e.preventDefault();
    if (isAuthenticated) {
      logout();
    }
    navigate(path);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Job Portal</h3>
          <p>Connecting talented professionals with great opportunities.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/jobs">Jobs</a></li>
            <li><a href="/signup" onClick={(e) => handleAuthLink(e, "/signup")}>Sign Up</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>For Candidates</h4>
          <ul>
            <li><a href="/jobs">Browse Jobs</a></li>
            <li><a href="/signup" onClick={(e) => handleAuthLink(e, "/signup")}>Register</a></li>
            <li><a href="/profile">My Profile</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>For Employers</h4>
          <ul>
            <li><a href="/signup" onClick={(e) => handleAuthLink(e, "/signup")}>Post a Job</a></li>
            <li><a href="/manager/dashboard">Dashboard</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: info@jobportal.com</p>
          <p>Phone: +1 (555) 123-4567</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Job Portal. All rights reserved.</p>
      </div>
    </footer>
  );
};
