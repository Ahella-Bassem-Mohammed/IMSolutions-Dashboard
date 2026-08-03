import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_URL } from "../context/AuthContext";

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
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/register`, form);
      setMessage(res.data.message);
      setError("");
      setIsSuccess(true);
      // Optionally clear form
      setForm({
        email: "",
        password: "",
        full_name: "",
        role: "viewer",
        department: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setMessage("");
      setIsSuccess(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Register</h2>
      {message && (
        <div style={{ color: "green", marginBottom: "1rem" }}>{message}</div>
      )}
      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}
      {isSuccess ? (
        <div>
          <p>Please check your email to verify your account.</p>
          <Link to="/login">Go to Login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
          />
          <input
            type="text"
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
          >
            <option value="viewer">Viewer</option>
            <option value="manager">Manager</option>
          </select>
          <select
            value={form.department}
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
      )}
      {!isSuccess && (
        <p style={{ marginTop: "1rem" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      )}
    </div>
  );
};

export default Register;
