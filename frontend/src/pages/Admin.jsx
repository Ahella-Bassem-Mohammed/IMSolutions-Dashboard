import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "viewer",
    department: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  // Fetch all users
  const fetchUsers = async () => {
    setError("");
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { "x-auth-token": token },
      });
      setUsers(response.data);
    } catch (err) {
      setUsers([]);
      const status = err.response?.status;
      setError(
        status === 404
          ? "Admin API returned 404. Stop and restart the backend (node server.js) so /api/admin routes load."
          : err.response?.data?.message || "Failed to fetch users",
      );
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
      return;
    }
    if (!token || user?.role !== "admin") {
      return;
    }
    fetchUsers();
  }, [navigate, token, user]);

  // Add new user
  const addUser = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await axios.post(`${API_URL}/admin/users`, newUser, {
        headers: { "x-auth-token": token },
      });
      setMessage(`User ${newUser.email} created successfully!`);
      setNewUser({
        email: "",
        password: "",
        full_name: "",
        role: "viewer",
        department: "",
      });
      fetchUsers();
    } catch (err) {
      const status = err.response?.status;
      setError(
        status === 404
          ? "Admin API returned 404. Restart the backend server, then try again."
          : err.response?.data?.message || "Failed to create user",
      );
    }
  };

  // Redirect non-admin users
  if (user && user.role !== "admin") {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate("/")}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
          <button
            type="button"
            onClick={logout}
            className="btn btn-muted"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Add User Form */}
      <div className="admin-card">
        <h2>Add New User</h2>
        {message && <div className="form-success">{message}</div>}
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={addUser}>
          <div className="admin-form-grid">
            <input
              type="email"
              placeholder="Email *"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              required
              className="admin-input"
            />
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.full_name}
              onChange={(e) =>
                setNewUser({ ...newUser, full_name: e.target.value })
              }
              className="admin-input"
            />
            <input
              type="password"
              placeholder="Password *"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              required
              className="admin-input"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="admin-input"
            >
              <option value="viewer">Viewer</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={newUser.department}
              onChange={(e) =>
                setNewUser({ ...newUser, department: e.target.value })
              }
              className="admin-input"
            >
              <option value="">Select Department</option>
              <option value="management">Management</option>
              <option value="sales">Sales</option>
              <option value="hr">HR</option>
              <option value="it">IT</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Add User
          </button>
        </form>
      </div>

      {/* Users List */}
      <h2>Existing Users</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.full_name || "-"}</td>
                <td>{u.role}</td>
                <td>{u.department || "-"}</td>
                <td>{u.is_active ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
