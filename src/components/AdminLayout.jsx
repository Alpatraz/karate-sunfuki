import React from "react";
import { Link } from "react-router-dom";
import useAdminAuth from "../hooks/useAdminAuth";

const AdminLayout = ({ children }) => {
  const { authenticated } = useAdminAuth();

  if (authenticated === null) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Chargement de l’espace admin...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 🔝 Menu admin commun */}
      <div style={{
        background: "#1a237e",
        color: "white",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}>
        <strong style={{ fontSize: "1.2rem" }}>👩‍💻 Admin Sunfuki</strong>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/admin/dashboard" style={{ color: "white", textDecoration: "none" }}>🛒 Produits</Link>
          <Link to="/admin-commandes" style={{ color: "white", textDecoration: "none" }}>📋 Commandes</Link>
          <Link to="/admin-promotions" style={{ color: "white", textDecoration: "none" }}>🏷️ Promotions</Link>
          <button
            onClick={() => {
              localStorage.removeItem("auth");
              window.location.href = "/admin";
            }}
            style={{
              background: "#e53935",
              color: "white",
              border: "none",
              padding: "0.4rem 0.8rem",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </div>

      <div style={{ padding: "2rem", maxWidth: "1000px", margin: "auto" }}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
