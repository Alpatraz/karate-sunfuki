// pages/AdminLogin.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Identifiants incorrects");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Connexion Admin</h2>
      <form onSubmit={handleSubmit} style={{ display: "inline-block", maxWidth: "300px" }}>
        <input
          type="email"
          placeholder="Email admin"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: "0.5rem", width: "100%" }}
        /><br /><br />
        <input
          type="password"
          placeholder="Mot de passe"
          value={pass}
          onChange={e => setPass(e.target.value)}
          required
          style={{ padding: "0.5rem", width: "100%" }}
        /><br /><br />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>Connexion</button>
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </form>
    </div>
  );
};

export default AdminLogin;
