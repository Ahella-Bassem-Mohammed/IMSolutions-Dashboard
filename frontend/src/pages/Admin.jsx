import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Admin = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignedDashboards, setAssignedDashboards] = useState([]);
  const [newDashboard, setNewDashboard] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
    icon: "🔗",
    backgroundColor: "#4CAF50",
    tags: [],
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  // Only fetch admin data if user is admin
  const fetchUsers = async () => {
    if (user?.role !== "admin") return;
    try {
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { "x-auth-token": token },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDashboards = async () => {
    if (user?.role !== "admin") return;
    try {
      const res = await axios.get(`${API_URL}/admin/dashboards`, {
        headers: { "x-auth-token": token },
      });
      setDashboards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
      fetchDashboards();
    }
  }, [user]);

  const loadUserAssignments = async (userId) => {
    if (user?.role !== "admin") return;
    try {
      const res = await axios.get(
        `${API_URL}/admin/user-dashboards/${userId}`,
        { headers: { "x-auth-token": token } },
      );
      setAssignedDashboards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    loadUserAssignments(user.id);
  };

  const assignDashboard = async (dashboardId) => {
    try {
      await axios.post(
        `${API_URL}/admin/assign-dashboard`,
        { userId: selectedUser.id, dashboardId },
        { headers: { "x-auth-token": token } },
      );
      loadUserAssignments(selectedUser.id);
      setMessage("Dashboard assigned");
    } catch (err) {
      setError("Assignment failed");
    }
  };

  const removeAssignment = async (dashboardId) => {
    try {
      await axios.delete(`${API_URL}/admin/assign-dashboard`, {
        headers: { "x-auth-token": token },
        data: { userId: selectedUser.id, dashboardId },
      });
      loadUserAssignments(selectedUser.id);
      setMessage("Dashboard unassigned");
    } catch (err) {
      setError("Removal failed");
    }
  };

  const addDashboard = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/dashboards`, newDashboard, {
        headers: { "x-auth-token": token },
      });
      setMessage("Dashboard added");
      fetchDashboards();
      setNewDashboard({
        title: "",
        description: "",
        url: "",
        category: "",
        icon: "🔗",
        backgroundColor: "#4CAF50",
        tags: [],
      });
    } catch (err) {
      setError("Failed to add dashboard");
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
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <h1>Admin Panel</h1>
        <button
          onClick={logout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Logout
        </button>
      </div>

      {message && (
        <div
          style={{
            backgroundColor: "#d4edda",
            padding: "0.5rem",
            marginBottom: "1rem",
            borderRadius: "4px",
          }}
        >
          {message}
        </div>
      )}
      {error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            padding: "0.5rem",
            marginBottom: "1rem",
            borderRadius: "4px",
            color: "#721c24",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        {/* Left column: User list and assignments */}
        <div>
          <h2>Users</h2>
          <select
            size="10"
            style={{ width: "100%", padding: "0.5rem" }}
            onChange={(e) => {
              const u = users.find((user) => user.id == e.target.value);
              handleSelectUser(u);
            }}
          >
            <option value="">-- Select User --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email} ({u.role})
              </option>
            ))}
          </select>

          {selectedUser && (
            <div style={{ marginTop: "2rem" }}>
              <h3>Assign Dashboards to {selectedUser.email}</h3>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <h4>All Dashboards</h4>
                  {dashboards
                    .filter(
                      (d) => !assignedDashboards.some((ad) => ad.id === d.id),
                    )
                    .map((d) => (
                      <div
                        key={d.id}
                        style={{
                          marginBottom: "0.5rem",
                          cursor: "pointer",
                          background: "#f0f0f0",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                        }}
                        onClick={() => assignDashboard(d.id)}
                      >
                        {d.title} ({d.category})
                      </div>
                    ))}
                </div>
                <div style={{ flex: 1 }}>
                  <h4>Assigned Dashboards</h4>
                  {assignedDashboards.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        marginBottom: "0.5rem",
                        cursor: "pointer",
                        background: "#d4edda",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                      }}
                      onClick={() => removeAssignment(d.id)}
                    >
                      {d.title} ({d.category}) [Click to remove]
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Add new dashboard */}
        <div>
          <h2>Add New Dashboard Link</h2>
          <form onSubmit={addDashboard}>
            <input
              type="text"
              placeholder="Title"
              value={newDashboard.title}
              onChange={(e) =>
                setNewDashboard({ ...newDashboard, title: e.target.value })
              }
              required
              style={{
                width: "100%",
                marginBottom: "0.5rem",
                padding: "0.5rem",
              }}
            />
            <textarea
              placeholder="Description"
              value={newDashboard.description}
              onChange={(e) =>
                setNewDashboard({
                  ...newDashboard,
                  description: e.target.value,
                })
              }
              style={{
                width: "100%",
                marginBottom: "0.5rem",
                padding: "0.5rem",
              }}
            />
            <input
              type="url"
              placeholder="URL"
              value={newDashboard.url}
              onChange={(e) =>
                setNewDashboard({ ...newDashboard, url: e.target.value })
              }
              required
              style={{
                width: "100%",
                marginBottom: "0.5rem",
                padding: "0.5rem",
              }}
            />
            <input
              type="text"
              placeholder="Category (e.g., SEO, Client Requests)"
              value={newDashboard.category}
              onChange={(e) =>
                setNewDashboard({ ...newDashboard, category: e.target.value })
              }
              required
              style={{
                width: "100%",
                marginBottom: "0.5rem",
                padding: "0.5rem",
              }}
            />
            <input
              type="text"
              placeholder="Icon (emoji or text)"
              value={newDashboard.icon}
              onChange={(e) =>
                setNewDashboard({ ...newDashboard, icon: e.target.value })
              }
              style={{
                width: "100%",
                marginBottom: "0.5rem",
                padding: "0.5rem",
              }}
            />
            <input
              type="text"
              placeholder="Background Color (e.g., #4CAF50)"
              value={newDashboard.backgroundColor}
              onChange={(e) =>
                setNewDashboard({
                  ...newDashboard,
                  backgroundColor: e.target.value,
                })
              }
              style={{
                width: "100%",
                marginBottom: "0.5rem",
                padding: "0.5rem",
              }}
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              onChange={(e) =>
                setNewDashboard({
                  ...newDashboard,
                  tags: e.target.value.split(","),
                })
              }
              style={{
                width: "100%",
                marginBottom: "0.5rem",
                padding: "0.5rem",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Add Dashboard
            </button>
          </form>

          <h2 style={{ marginTop: "2rem" }}>Existing Dashboards</h2>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {dashboards.map((d) => (
              <div
                key={d.id}
                style={{ borderBottom: "1px solid #ccc", padding: "0.5rem 0" }}
              >
                <strong>{d.title}</strong> ({d.category})<br />
                <small>{d.url}</small>
                <br />
                <button
                  onClick={async () => {
                    if (window.confirm("Delete this dashboard?")) {
                      await axios.delete(
                        `${API_URL}/admin/dashboards/${d.id}`,
                        { headers: { "x-auth-token": token } },
                      );
                      fetchDashboards();
                      setMessage("Dashboard deleted");
                    }
                  }}
                  style={{
                    marginTop: "0.25rem",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
