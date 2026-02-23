import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import Loading from "../components/Loading";
import "./Page.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { error: showError } = useResponse();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCandidates: 0,
    totalManagers: 0,
    totalCompanies: 0,
  });

  useEffect(() => {
    if (user?.role !== "Admin") {
      navigate("/");
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [candidates, managers] = await Promise.all([
          userAPI.getCandidates(token),
          userAPI.getManagers(token),
        ]);

        const candidatesList = candidates.data || [];
        const managersList = managers.data || [];

        setStats({
          totalUsers: candidatesList.length + managersList.length,
          totalCandidates: candidatesList.length,
          totalManagers: managersList.length,
          totalCompanies: managersList.length, // Approximation
        });
      } catch (err) {
        showError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, token, navigate, showError]);

  if (loading) return <Loading />;

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1 style={{ margin: "0" }}>Admin Dashboard</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>System overview and management</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            padding: "30px",
            backgroundColor: "var(--accent)",
            color: "#fff",
            borderRadius: "10px",
          }}
        >
          <p style={{ margin: "0 0 10px", opacity: "0.9" }}>Total Users</p>
          <h3 style={{ margin: "0", fontSize: "2.5rem" }}>{stats.totalUsers}</h3>
        </div>

        <div
          style={{
            padding: "30px",
            backgroundColor: "var(--accent)",
            color: "#fff",
            borderRadius: "10px",
          }}
        >
          <p style={{ margin: "0 0 10px", opacity: "0.9" }}>Candidates</p>
          <h3 style={{ margin: "0", fontSize: "2.5rem" }}>{stats.totalCandidates}</h3>
        </div>

        <div
          style={{
            padding: "30px",
            backgroundColor: "var(--accent)",
            color: "#fff",
            borderRadius: "10px",
          }}
        >
          <p style={{ margin: "0 0 10px", opacity: "0.9" }}>Hiring Managers</p>
          <h3 style={{ margin: "0", fontSize: "2.5rem" }}>{stats.totalManagers}</h3>
        </div>

        <div
          style={{
            padding: "30px",
            backgroundColor: "var(--accent)",
            color: "#fff",
            borderRadius: "10px",
          }}
        >
          <p style={{ margin: "0 0 10px", opacity: "0.9" }}>Companies</p>
          <h3 style={{ margin: "0", fontSize: "2.5rem" }}>{stats.totalCompanies}</h3>
        </div>
      </div>

      {/* Management Sections */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Users Management */}
        <div
          style={{
            padding: "30px",
            border: "1px solid rgba(12, 15, 29, 0.1)",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "15px" }}>👥</div>
          <h3>Candidate Management</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: "20px" }}>
            View and manage all registered candidates
          </p>
          <Link to="/admin/candidates" className="btn btn-primary" style={{ width: "100%" }}>
            View Candidates
          </Link>
        </div>

        {/* Managers Management */}
        <div
          style={{
            padding: "30px",
            border: "1px solid rgba(12, 15, 29, 0.1)",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "15px" }}>👔</div>
          <h3>Manager Management</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: "20px" }}>
            Manage hiring managers and their companies
          </p>
          <Link to="/admin/managers" className="btn btn-primary" style={{ width: "100%" }}>
            View Managers
          </Link>
        </div>

        {/* User Promotion */}
        <div
          style={{
            padding: "30px",
            border: "1px solid rgba(12, 15, 29, 0.1)",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "15px" }}>⬆️</div>
          <h3>User Promotion</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: "20px" }}>
            Promote candidates to different roles
          </p>
          <Link to="/admin/promote" className="btn btn-primary" style={{ width: "100%" }}>
            Promote Users
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <section style={{ marginTop: "40px" }}>
        <h2>System Health</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          <div
            style={{
              padding: "20px",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.85rem" }}>Status</p>
            <p style={{ margin: "0", fontSize: "1.1rem", fontWeight: "600", color: "#4caf50" }}>
              System Operational
            </p>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.85rem" }}>
              Database
            </p>
            <p style={{ margin: "0", fontSize: "1.1rem", fontWeight: "600", color: "#4caf50" }}>
              Connected
            </p>
          </div>
          <div
            style={{
              padding: "20px",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: "0.85rem" }}>
              Last Sync
            </p>
            <p style={{ margin: "0", fontSize: "1.1rem", fontWeight: "600", color: "#4caf50" }}>
              Just now
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
