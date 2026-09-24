"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { login as loginRequest } from "@/lib/api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false); // true once we've checked localStorage

  useEffect(() => {
    const token = window.localStorage.getItem("pad_token");
    const storedUser = window.localStorage.getItem("pad_user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // corrupt data, ignore and stay logged out
      }
    }
    setIsReady(true);
  }, []);

  async function login(username, password) {
    const data = await loginRequest({ username, password });
    const { accessToken, ...profile } = data;
    window.localStorage.setItem("pad_token", accessToken);
    window.localStorage.setItem("pad_user", JSON.stringify(profile));
    setUser(profile);
    return profile;
  }

  function logout() {
    window.localStorage.removeItem("pad_token");
    window.localStorage.removeItem("pad_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
