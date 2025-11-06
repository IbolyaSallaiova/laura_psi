import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

function readStoredUser() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  const raw = localStorage.getItem("mais_user");
  if (!raw || raw === "null" || raw === "undefined") return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function readStoredToken() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  const raw = localStorage.getItem("mais_token");
  if (!raw || raw === "null" || raw === "undefined") return null;
  return raw;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [token, setToken] = useState(() => readStoredToken());

  const isAuthenticated = !!token && !!user;

  async function login({ username, password }) {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Prihlásenie zlyhalo");
    }
    const data = await res.json();
    if (!data?.token || typeof data.token !== "string" || !data.token.trim()) {
      throw new Error("Server nevrátil platný token");
    }
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
      setUser(readStoredUser());
      setToken(readStoredToken());
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
