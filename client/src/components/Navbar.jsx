import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import logo from "../assets/logo.png";
import "./Navbar.css";

export default function Navbar() {
  const { isAuthenticated, user, logout, isCandidate, isHiringManager, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Job Portal" className="logo-img" />
          <span>Job Portal</span>
        </Link>

        <div className={`navbar-menu ${menuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          <Link to="/jobs" className="nav-link" onClick={() => setMenuOpen(false)}>
            Jobs
          </Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link
                to="/signup"
                className="nav-link signup-link"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {isCandidate && (
                <>
                  <Link to="/applications" className="nav-link" onClick={() => setMenuOpen(false)}>
                    My Applications
                  </Link>
                  <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                    Profile
                  </Link>
                </>
              )}

              {isHiringManager && (
                <>
                  <Link
                    to="/manager/dashboard"
                    className="nav-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    Manager Dashboard
                  </Link>
                  <Link to="/manager/jobs" className="nav-link" onClick={() => setMenuOpen(false)}>
                    My Jobs
                  </Link>
                  <Link to="/create-job" className="nav-link" onClick={() => setMenuOpen(false)}>
                    Post Job
                  </Link>
                  <Link
                    to="/manager/profile"
                    className="nav-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="nav-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/candidates"
                    className="nav-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    Candidates
                  </Link>
                  <Link
                    to="/admin/managers"
                    className="nav-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    Managers
                  </Link>
                </>
              )}

              <div className="user-info">
                <span className="user-name">
                  {user?.firstName} ({user?.role})
                </span>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
      </div>
    </nav>
  );
}
