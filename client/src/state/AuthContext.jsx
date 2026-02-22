import React, { createContext, useContext, useState, useEffect } from "react";
import { userAPI } from "../lib/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const normalizeToken = (value) => {
    if (!value || value === "undefined" || value === "null") return null;
    return value;
  };

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => normalizeToken(localStorage.getItem("jwt_token")));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on mount if token exists
  useEffect(() => {
    if (token) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  // Auto-logout when api.js detects a 401 (token expired / invalid)
  useEffect(() => {
    const handleForceLogout = () => {
      localStorage.removeItem("jwt_token");
      setToken(null);
      setUser(null);
    };
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, []);

  const loadUserProfile = async () => {
    const authToken = normalizeToken(token || localStorage.getItem("jwt_token"));
    if (!authToken) { setLoading(false); return; }
    try {
      setLoading(true);
      const response = await userAPI.getProfile(authToken);
      setUser(response.data || response);
      setError(null);
    } catch (err) {
      console.error("Failed to load profile:", err);
      localStorage.removeItem("jwt_token");
      setToken(null);
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data) => {
    try {
      setLoading(true);
      const response = await userAPI.signup(data);
      setError(null);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await userAPI.login({ email, password });
      const newToken = normalizeToken(response.data?.token || response.token);
      if (!newToken) throw new Error("Invalid token received from server");
      localStorage.setItem("jwt_token", newToken);
      setToken(newToken);
      setUser(response.data?.user || response.user);
      setError(null);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential) => {
    try {
      setLoading(true);
      const response = await userAPI.googleLogin(credential);
      const newToken = normalizeToken(response.data?.token || response.token);
      if (!newToken) throw new Error("Invalid token received from server");
      localStorage.setItem("jwt_token", newToken);
      setToken(newToken);
      setUser(response.data?.user || response.user);
      setError(null);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      const authToken = normalizeToken(token || localStorage.getItem("jwt_token"));
      if (!authToken) throw new Error("Not authenticated");
      const response = await userAPI.updateProfile(data, authToken);
      setUser(response.data || response);
      setError(null);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!token;
  const isCandidate = user?.role === "Candidate";
  const isHiringManager = user?.role === "Hiring-Manager";
  const isAdmin = user?.role === "Admin";

  const value = {
    user, token, loading, error,
    isAuthenticated, isCandidate, isHiringManager, isAdmin,
    signup, login, googleLogin, logout, updateProfile, loadUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
