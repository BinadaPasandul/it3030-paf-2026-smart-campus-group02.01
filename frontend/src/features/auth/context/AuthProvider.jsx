import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import AuthContext from "./AuthContext";

const GOOGLE_LOGIN_URL = "http://localhost:8080/oauth2/authorization/google";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getHomePathForUser = (currentUser) => {
    if (!currentUser) {
      return "/login";
    }

    if (!currentUser.profileCompleted) {
      return "/complete-profile";
    }

    return currentUser.role === "ADMIN" ? "/admin" : "/profile";
  };

  const refreshUser = async () => {
    try {
      const response = await api.get("/users/me");
      setUser(response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
        return null;
      }

      console.error("Auth check failed:", error);
      setUser(null);
      return null;
    }
  };

  const loginWithCredentials = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    setUser(response.data);
    return response.data;
  };

  const registerUser = async (payload) => {
    const response = await api.post("/auth/register", payload);
    return response.data;
  };

  const completeProfile = async (payload) => {
    const response = await api.put("/users/me/profile", payload);
    setUser(response.data);
    return response.data;
  };

  const loginWithGoogle = () => {
    window.location.href = GOOGLE_LOGIN_URL;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Logout failed:", error);
      }
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        await refreshUser();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        refreshUser,
        loginWithCredentials,
        registerUser,
        completeProfile,
        loginWithGoogle,
        logout,
        getHomePathForUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
