import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

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
        await fetchLinks(token);
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
    await fetchLinks(token);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setLinks([]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, links }}>
      {children}
    </AuthContext.Provider>
  );
};
