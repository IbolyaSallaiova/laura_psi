// src/pages/Login.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login({ username, password }); // volá backend /api/auth/login
      // ak je login OK, AuthContext uloží token+user a router ťa presmeruje
    } catch (err) {
      setError(err.message || "Prihlásenie zlyhalo");
    }
  }

  return (
      <div className="full-center">
        <div className="login-card">
          <div className="logo-big">
            <div className="mark">MA</div>
            <div className="title">MAIS — Prihlásenie</div>
          </div>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label className="small">Prihlasovacie meno</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="login" />
            </div>
            <div className="field">
              <label className="small">Heslo</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="heslo" />
            </div>
            {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <button className="btn" type="submit">Prihlásiť sa</button>
            </div>
          </form>
        </div>
      </div>
  );
}
