import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });
      setMessage(res.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
      setMessage("");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Reset Password</h2>
      {message && <div style={{ color: "green" }}>{message}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
