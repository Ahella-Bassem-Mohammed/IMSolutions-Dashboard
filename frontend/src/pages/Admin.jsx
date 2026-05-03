import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Admin = () => {
  const { user, logout } = useAuth();
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
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { "x-auth-token": token },
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  // Redirect non-admin users
  if (user?.role !== "admin") {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
        <button onClick={() => (window.location.href = "/")}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>Admin Panel</h1>
        <div>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              marginRight: "1rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
          <button
            onClick={logout}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Add User Form */}
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
        }}
      >
        <h2>Add New User</h2>
        {message && (
          <div style={{ color: "green", marginBottom: "1rem" }}>{message}</div>
        )}
        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}
        <form onSubmit={addUser}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
            }}
          >
            <input
              type="email"
              placeholder="Email *"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              required
              style={{ padding: "0.5rem" }}
            />
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.full_name}
              onChange={(e) =>
                setNewUser({ ...newUser, full_name: e.target.value })
              }
              style={{ padding: "0.5rem" }}
            />
            <input
              type="password"
              placeholder="Password *"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              required
              style={{ padding: "0.5rem" }}
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              style={{ padding: "0.5rem" }}
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
              style={{ padding: "0.5rem" }}
            >
              <option value="">Select Department</option>
              <option value="management">Management</option>
              <option value="sales">Sales</option>
              <option value="hr">HR</option>
              <option value="it">IT</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
          <button
            type="submit"
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add User
          </button>
        </form>
      </div>

      {/* Users List */}
      <h2>Existing Users</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.5rem",
                  borderBottom: "2px solid #ddd",
                }}
              >
                Email
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.5rem",
                  borderBottom: "2px solid #ddd",
                }}
              >
                Full Name
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.5rem",
                  borderBottom: "2px solid #ddd",
                }}
              >
                Role
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.5rem",
                  borderBottom: "2px solid #ddd",
                }}
              >
                Department
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.5rem",
                  borderBottom: "2px solid #ddd",
                }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td
                  style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}
                >
                  {u.email}
                </td>
                <td
                  style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}
                >
                  {u.full_name || "-"}
                </td>
                <td
                  style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}
                >
                  {u.role}
                </td>
                <td
                  style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}
                >
                  {u.department || "-"}
                </td>
                <td
                  style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}
                >
                  {u.is_active ? "Active" : "Inactive"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
