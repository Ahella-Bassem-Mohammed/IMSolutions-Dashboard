import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { "x-auth-token": token },
      });
      if (response.data.valid) {
        setUser(response.data.user);
        if (!response.data.user.must_change_password) {
          await fetchLinks(token);
        }
      } else {
        localStorage.removeItem("token");
      }
    } catch (err) {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const fetchLinks = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/links`, {
        headers: { "x-auth-token": token },
      });
      setLinks(response.data.links);
    } catch (err) {
      console.error("Failed to fetch links", err);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    setUser(user);
    if (!user.must_change_password) {
      await fetchLinks(token);
    }
    return user;
  };

  // Called after a forced password change succeeds.
  // Updates the token + user, then loads the user's links.
  const completePasswordChange = async (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    setUser(newUser);
    await fetchLinks(newToken);
  };

  const changePassword = async (currentPassword, newPassword) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/auth/change-password`,
      { currentPassword, newPassword },
      { headers: { "x-auth-token": token } },
    );
    const { token: newToken, user: newUser } = response.data;
    await completePasswordChange(newToken, newUser);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setLinks([]);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, links, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};
