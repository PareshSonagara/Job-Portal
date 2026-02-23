import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userAPI } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { useResponse } from "../state/ResponseContext";
import Loading from "../components/Loading";
import "./Page.css";

export default function AdminManagers() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { error: showError } = useResponse();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.role !== "Admin") {
      navigate("/");
      return;
    }

    const loadManagers = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getManagers(token);
        setManagers(response.data || []);
      } catch (err) {
        showError(err.message || "Failed to load managers");
      } finally {
        setLoading(false);
      }
    };

    loadManagers();
  }, [user, token, navigate, showError]);

  const filteredManagers = managers.filter(
    (manager) =>
      manager.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 style={{ margin: "0" }}>Manage Hiring Managers</h1>
          <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
            Total: {managers.length} managers
          </p>
        </div>
        <Link to="/admin/dashboard" className="btn ghost">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Search */}
      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          gap: "10px",
        }}
      >
        <div className="form-group" style={{ flex: "1", margin: "0" }}>
          <label htmlFor="search">Search Managers</label>
          <input
            id="search"
            type="text"
            placeholder="Name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", marginTop: "8px" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={() => setSearchTerm("")}
            className="btn ghost"
            style={{ padding: "10px 20px" }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Managers List */}
      {filteredManagers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--muted)",
          }}
        >
          <p style={{ fontSize: "1.1rem" }}>
            {managers.length === 0 ? "No managers found" : "No results match your search"}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredManagers.map((manager) => (
            <div
              key={manager._id}
              style={{
                padding: "20px",
                border: "1px solid rgba(12, 15, 29, 0.1)",
                borderRadius: "10px",
                backgroundColor: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    marginRight: "12px",
                  }}
                >
                  {manager.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: "1" }}>
                  <h3 style={{ margin: "0" }}>{manager.name}</h3>
                  <p style={{ margin: "5px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                    {manager.email}
                  </p>
                </div>
              </div>

              <div
                style={{
                  marginBottom: "15px",
                  paddingBottom: "15px",
                  borderBottom: "1px solid rgba(12, 15, 29, 0.05)",
                }}
              >
                {manager.company && (
                  <>
                    <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--muted)" }}>
                      Company
                    </p>
                    <p style={{ margin: "0 0 15px", fontWeight: "600" }}>{manager.company.name}</p>
                  </>
                )}
                {manager.phone && (
                  <>
                    <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--muted)" }}>
                      Phone
                    </p>
                    <p style={{ margin: "0 0 15px", fontWeight: "600" }}>{manager.phone}</p>
                  </>
                )}
                <p style={{ margin: "0", fontSize: "0.85rem", color: "var(--muted)" }}>
                  Joined {new Date(manager.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => navigate(`/admin/managers/${manager._id}`)}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
