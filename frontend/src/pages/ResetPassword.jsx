// URL format: /reset-password?token=XYZ
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword: password,
      });
      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  if (!token) return <div>Invalid or missing token</div>;

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Set New Password</h2>
      {message && <div style={{ color: "green" }}>{message}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
