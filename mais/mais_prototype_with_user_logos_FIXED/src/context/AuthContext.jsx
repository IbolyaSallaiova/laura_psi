import React, { createContext, useContext, useEffect, useState } from "react";

import { apiFetch } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mais_user")) || null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("mais_token") || null);

  const isAuthenticated = !!token && !!user;

  async function login({ username, password }) {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { username, password },
    });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("mais_user", JSON.stringify(data.user));
    localStorage.setItem("mais_token", data.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("mais_user");
    localStorage.removeItem("mais_token");
  }

  // sync medzi tabmi/oknami
  useEffect(() => {
    const onStorage = () => {
      try { setUser(JSON.parse(localStorage.getItem("mais_user"))); } catch {}
      setToken(localStorage.getItem("mais_token"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
      <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
