import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "viewer",
    department: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/register`, form);
      setMessage(res.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setMessage("");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Register</h2>
      {message && <div style={{ color: "green" }}>{message}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <input
          type="text"
          placeholder="Full Name"
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <select
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        >
          <option value="viewer">Viewer</option>
          <option value="manager">Manager</option>
        </select>
        <select
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        >
          <option value="">Select Department</option>
          <option value="management">Management</option>
          <option value="sales">Sales</option>
          <option value="hr">HR</option>
          <option value="it">IT</option>
          <option value="marketing">Marketing</option>
        </select>
        <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
