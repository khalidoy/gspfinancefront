import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);

        // First try to get user from localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          setCurrentUser(storedUser);
        }

        // Then verify with server
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/auth/current-user`,
          { withCredentials: true }
        );

        if (response.data.status === "success") {
          const userData = response.data.user;
          setCurrentUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          localStorage.removeItem("user");
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        localStorage.removeItem("user");
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Add debugging logs
  useEffect(() => {
    console.log("Auth state changed:", { currentUser, loading });
  }, [currentUser, loading]);

  // Login function
  const login = useCallback(async (username, password) => {
    // Clear any previous state completely before setting new state
    setCurrentUser(null);
    setError(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/auth/login`,
        { username, password },
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        const userData = response.data.user;
        setCurrentUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return { success: true };
      } else {
        setError(response.data.message || "Login failed");
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      setCurrentUser(null);
    }
  }, []);

  // Register function
  const register = async (username, password) => {
    try {
      setError(null);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/auth/register`,
        { username, password }
      );

      if (response.data.status === "success") {
        return { success: true };
      } else {
        setError(response.data.message || "Registration failed");
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
