import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Bootstrap: restore session on mount ──────────────────────────────────
  useEffect(() => {
    const cachedUser = localStorage.getItem("lifelink_user") || sessionStorage.getItem("lifelink_user");
    const cachedToken = localStorage.getItem("lifelink_token") || sessionStorage.getItem("lifelink_token");

    if (cachedUser && cachedToken) {
      try {
        setUser(JSON.parse(cachedUser));
        setToken(cachedToken);
      } catch (e) {
        console.warn("Failed to parse cached auth session", e);
      }
    }
    setLoading(false);
  }, []);

  /** Re-hydrate from storage after a profile update. */
  const refreshUser = useCallback(async () => {
    const cachedUser = localStorage.getItem("lifelink_user") || sessionStorage.getItem("lifelink_user");
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {}
    }
  }, []);

  // ── login: called by Auth.jsx after api.login() succeeds ─────────────────
  const login = useCallback((userData, authToken, rememberMe = true) => {
    setUser(userData);
    setToken(authToken);

    if (rememberMe) {
      localStorage.setItem("lifelink_user",  JSON.stringify(userData));
      localStorage.setItem("lifelink_token", authToken);
      sessionStorage.removeItem("lifelink_user");
      sessionStorage.removeItem("lifelink_token");
    } else {
      sessionStorage.setItem("lifelink_user",  JSON.stringify(userData));
      sessionStorage.setItem("lifelink_token", authToken);
      localStorage.removeItem("lifelink_user");
      localStorage.removeItem("lifelink_token");
    }
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("lifelink_user");
    localStorage.removeItem("lifelink_token");
    sessionStorage.removeItem("lifelink_user");
    sessionStorage.removeItem("lifelink_token");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
