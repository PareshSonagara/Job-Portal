import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Page.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div style={{
        textAlign: "center",
        maxWidth: "600px",
        margin: "120px auto",
        padding: "40px 20px"
      }}>
        <div style={{
          fontSize: "120px",
          fontWeight: "bold",
          color: "var(--accent)",
          marginBottom: "20px",
          lineHeight: "1"
        }}>
          404
        </div>
        
        <h1 style={{ marginTop: "0" }}>Page Not Found</h1>
        
        <p style={{
          fontSize: "1.1rem",
          color: "var(--muted)",
          marginBottom: "40px"
        }}>
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "30px"
        }}>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="btn ghost"
          >
            Go Back
          </button>
        </div>

        <p style={{
          color: "var(--muted)",
          fontSize: "0.9rem"
        }}>
          If you think this is a mistake, please contact support.
        </p>
      </div>
    </div>
  );
}
