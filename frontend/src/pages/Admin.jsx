import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../context/AuthContext";
import axios from "axios";

const ROLES = ["admin", "top_management", "account_manager", "seo_leader", "hr", "viewer"];

const Admin = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const authHeader = { headers: { "x-auth-token": token } };

  const [tab, setTab] = useState("users"); // users | dashboards | audit
  const [users, setUsers] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [assignedIds, setAssignedIds] = useState(new Set());

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ── New user form ──────────────────────────────────────────────
  const emptyUserForm = { email: "", password: "", full_name: "", role: "viewer", department: "" };
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState(null);

  // ── New dashboard form ─────────────────────────────────────────
  const emptyDashboardForm = {
    title: "", description: "", url: "", category: "",
    icon: "🔗", backgroundColor: "#4CAF50", tags: [],
  };
  const [dashboardForm, setDashboardForm] = useState(emptyDashboardForm);
  const [editingDashboardId, setEditingDashboardId] = useState(null);

  // ── Reset password modal ──────────────────────────────────────
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [resetPassword, setResetPassword] = useState("");

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(""), 4000); }
    else { setMessage(msg); setTimeout(() => setMessage(""), 4000); }
  };

  // ── Fetchers ───────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`, authHeader);
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchDashboards = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/dashboards`, authHeader);
      setDashboards(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAuditLog = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/audit-log`, authHeader);
      setAuditLog(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
      fetchDashboards();
    }
  }, [user]);

  useEffect(() => {
    if (tab === "audit" && user?.role === "admin") fetchAuditLog();
  }, [tab, user]);

  const loadUserAssignments = async (u) => {
    setSelectedUser(u);
    try {
      const res = await axios.get(`${API_URL}/admin/user-dashboards/${u.id}`, authHeader);
      setAssignedIds(new Set(res.data.map((d) => d.id)));
    } catch (err) {
      console.error(err);
      setAssignedIds(new Set());
    }
  };

  // ── User CRUD ──────────────────────────────────────────────────
  const submitUserForm = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        await axios.put(`${API_URL}/admin/users/${editingUserId}`, {
          full_name: userForm.full_name,
          role: userForm.role,
          department: userForm.department,
          is_active: 1,
        }, authHeader);
        flash("User updated");
      } else {
        await axios.post(`${API_URL}/admin/users`, userForm, authHeader);
        flash("User created. They must change their password on first login.");
      }
      setUserForm(emptyUserForm);
      setEditingUserId(null);
      fetchUsers();
    } catch (err) {
      flash(err.response?.data?.message || "Operation failed", true);
    }
  };

  const startEditUser = (u) => {
    setEditingUserId(u.id);
    setUserForm({
      email: u.email, password: "", full_name: u.full_name || "",
      role: u.role, department: u.department || "",
    });
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm);
  };

  const submitResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/users/${resetTargetUser.id}/reset-password`,
        { newPassword: resetPassword }, authHeader);
      flash(`Password reset for ${resetTargetUser.email}. They'll be asked to change it on next login.`);
      setResetTargetUser(null);
      setResetPassword("");
      fetchUsers();
    } catch (err) {
      flash(err.response?.data?.message || "Reset failed", true);
    }
  };

  // ── Dashboard CRUD ─────────────────────────────────────────────
  const submitDashboardForm = async (e) => {
    e.preventDefault();
    try {
      if (editingDashboardId) {
        await axios.put(`${API_URL}/admin/dashboards/${editingDashboardId}`, dashboardForm, authHeader);
        flash("Dashboard updated");
      } else {
        await axios.post(`${API_URL}/admin/dashboards`, dashboardForm, authHeader);
        flash("Dashboard added");
      }
      setDashboardForm(emptyDashboardForm);
      setEditingDashboardId(null);
      fetchDashboards();
    } catch (err) {
      flash(err.response?.data?.message || "Operation failed", true);
    }
  };

  const startEditDashboard = (d) => {
    setEditingDashboardId(d.id);
    setDashboardForm({
      title: d.title, description: d.description || "", url: d.url,
      category: d.category, icon: d.icon || "🔗",
      backgroundColor: d.backgroundColor || "#4CAF50",
      tags: (() => { try { return JSON.parse(d.tags || "[]"); } catch { return []; } })(),
    });
  };

  const cancelEditDashboard = () => {
    setEditingDashboardId(null);
    setDashboardForm(emptyDashboardForm);
  };

  const deleteDashboard = async (id) => {
    if (!window.confirm("Delete this dashboard? This will remove it from all user assignments.")) return;
    try {
      await axios.delete(`${API_URL}/admin/dashboards/${id}`, authHeader);
      flash("Dashboard deleted");
      fetchDashboards();
      if (selectedUser) loadUserAssignments(selectedUser);
    } catch (err) {
      flash("Delete failed", true);
    }
  };

  // ── Assignment toggling ────────────────────────────────────────
  const toggleAssignment = async (dashboardId) => {
    if (!selectedUser) return;
    const isAssigned = assignedIds.has(dashboardId);
    try {
      if (isAssigned) {
        await axios.delete(`${API_URL}/admin/assign-dashboard`, {
          ...authHeader, data: { userId: selectedUser.id, dashboardId },
        });
        const next = new Set(assignedIds);
        next.delete(dashboardId);
        setAssignedIds(next);
      } else {
        await axios.post(`${API_URL}/admin/assign-dashboard`,
          { userId: selectedUser.id, dashboardId }, authHeader);
        const next = new Set(assignedIds);
        next.add(dashboardId);
        setAssignedIds(next);
      }
    } catch (err) {
      flash("Could not update assignment", true);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
        <button className="btn btn-primary" onClick={() => (window.location.href = "/")}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Group dashboards by category for cleaner assignment UI
  const dashboardsByCategory = dashboards.reduce((groups, d) => {
    (groups[d.category] = groups[d.category] || []).push(d);
    return groups;
  }, {});

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
      </div>

      {message && <div className="form-success">{message}</div>}
      {error && <div className="form-error">{error}</div>}

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <button className={`btn ${tab === "users" ? "btn-primary" : "btn-muted"}`} onClick={() => setTab("users")}>Users</button>
        <button className={`btn ${tab === "dashboards" ? "btn-primary" : "btn-muted"}`} onClick={() => setTab("dashboards")}>Dashboards</button>
        <button className={`btn ${tab === "audit" ? "btn-primary" : "btn-muted"}`} onClick={() => setTab("audit")}>Audit Log</button>
      </div>

      {/* ───────────── USERS TAB ───────────── */}
      {tab === "users" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {/* User list + assignment */}
          <div className="admin-card">
            <h2 style={{ marginTop: 0 }}>Users</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={selectedUser?.id === u.id ? { background: "#fff4ea" } : {}}>
                      <td>
                        <button
                          onClick={() => loadUserAssignments(u)}
                          style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, font: "inherit", color: "inherit" }}
                        >
                          {u.full_name || u.email}<br />
                          <small style={{ color: "var(--ims-gray-700)" }}>{u.email}</small>
                        </button>
                      </td>
                      <td>{u.role}</td>
                      <td>
                        {u.is_active ? "Active" : "Disabled"}
                        {u.must_change_password ? <><br /><small>⚠ pending pw change</small></> : null}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button className="btn btn-muted" style={{ padding: "0.3rem 0.6rem", marginRight: "0.4rem" }} onClick={() => startEditUser(u)}>Edit</button>
                        <button className="btn btn-muted" style={{ padding: "0.3rem 0.6rem" }} onClick={() => setResetTargetUser(u)}>Reset PW</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedUser && (
              <div style={{ marginTop: "1.25rem" }}>
                <h3>Dashboards for {selectedUser.full_name || selectedUser.email}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--ims-gray-700)" }}>
                  Only checked dashboards will be visible to this user. Unchecked = hidden.
                </p>
                {Object.keys(dashboardsByCategory).length === 0 && <p>No dashboards exist yet — add some in the Dashboards tab.</p>}
                {Object.keys(dashboardsByCategory).map((category) => (
                  <div key={category} style={{ marginBottom: "0.85rem" }}>
                    <strong>{category}</strong>
                    {dashboardsByCategory[category].map((d) => (
                      <label key={d.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0" }}>
                        <input
                          type="checkbox"
                          checked={assignedIds.has(d.id)}
                          onChange={() => toggleAssignment(d.id)}
                        />
                        {d.icon} {d.title}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create / edit user form */}
          <div className="admin-card">
            <h2 style={{ marginTop: 0 }}>{editingUserId ? "Edit User" : "Create New User"}</h2>
            <form onSubmit={submitUserForm}>
              <input
                type="email" placeholder="Email" className="admin-input"
                value={userForm.email} disabled={!!editingUserId}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
              {!editingUserId && (
                <input
                  type="password" placeholder="Temporary password (min. 6 chars)" className="admin-input"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  required minLength={6}
                />
              )}
              <input
                type="text" placeholder="Full name" className="admin-input"
                value={userForm.full_name}
                onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                required
              />
              <select className="admin-input" value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <input
                type="text" placeholder="Department (optional)" className="admin-input"
                value={userForm.department}
                onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="submit" className="btn btn-primary">{editingUserId ? "Save Changes" : "Create User"}</button>
                {editingUserId && <button type="button" className="btn btn-muted" onClick={cancelEditUser}>Cancel</button>}
              </div>
              {!editingUserId && (
                <p style={{ fontSize: "0.82rem", color: "var(--ims-gray-700)", marginTop: "0.6rem" }}>
                  The user will be required to set their own password on first login.
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ───────────── DASHBOARDS TAB ───────────── */}
      {tab === "dashboards" && (
        <div className="dashboards-tab-grid" style={{ display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr", gap: "1.25rem" }}>
          <div className="admin-card">
            <h2 style={{ marginTop: 0 }}>{editingDashboardId ? "Edit Dashboard" : "Add New Dashboard"}</h2>

            <form onSubmit={submitDashboardForm}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" placeholder="e.g. Weekly KPI Submission" className="admin-input" required
                  value={dashboardForm.title} onChange={(e) => setDashboardForm({ ...dashboardForm, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea placeholder="Short description shown to users" className="admin-input" rows={2}
                  value={dashboardForm.description} onChange={(e) => setDashboardForm({ ...dashboardForm, description: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">URL</label>
                <input type="url" placeholder="https://..." className="admin-input" required
                  value={dashboardForm.url} onChange={(e) => setDashboardForm({ ...dashboardForm, url: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input type="text" placeholder="e.g. SEO, Sales, Forms" className="admin-input" required
                  value={dashboardForm.category} onChange={(e) => setDashboardForm({ ...dashboardForm, category: e.target.value })} />
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="submit" className="btn btn-primary">{editingDashboardId ? "Save Changes" : "Add Dashboard"}</button>
                {editingDashboardId && <button type="button" className="btn btn-muted" onClick={cancelEditDashboard}>Cancel</button>}
              </div>
            </form>
          </div>

          <div className="admin-card">
            <h2 style={{ marginTop: 0 }}>Existing Dashboards</h2>
            <div className="admin-table-wrapper" style={{ maxHeight: "560px", overflowY: "auto" }}>
              <table className="admin-table">
                <thead><tr><th>Title</th><th>Category</th><th>Actions</th></tr></thead>
                <tbody>
                  {dashboards.map((d) => (
                    <tr key={d.id}>
                      <td>{d.icon} {d.title}<br /><small>{d.url}</small></td>
                      <td>{d.category}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button className="btn btn-muted" style={{ padding: "0.3rem 0.6rem", marginRight: "0.4rem" }} onClick={() => startEditDashboard(d)}>Edit</button>
                        <button className="btn" style={{ padding: "0.3rem 0.6rem", background: "#dc3545", color: "#fff" }} onClick={() => deleteDashboard(d.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────── AUDIT LOG TAB ───────────── */}
      {tab === "audit" && (
        <div className="admin-card">
          <h2 style={{ marginTop: 0 }}>Recent Activity (last 200)</h2>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>When</th><th>User</th><th>Action</th><th>Detail</th><th>IP</th></tr></thead>
              <tbody>
                {auditLog.map((l) => (
                  <tr key={l.id}>
                    <td>{new Date(l.created_at).toLocaleString()}</td>
                    <td>{l.full_name || l.email || "—"}</td>
                    <td>{l.action}</td>
                    <td>{l.detail || "—"}</td>
                    <td>{l.ip_address || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────── RESET PASSWORD MODAL ───────────── */}
      {resetTargetUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div className="admin-card" style={{ width: "min(400px, 90vw)" }}>
            <h3 style={{ marginTop: 0 }}>Reset Password for {resetTargetUser.email}</h3>
            <form onSubmit={submitResetPassword}>
              <input
                type="password" placeholder="New temporary password (min. 6 chars)" className="admin-input"
                value={resetPassword} onChange={(e) => setResetPassword(e.target.value)}
                required minLength={6} autoFocus
              />
              <p style={{ fontSize: "0.82rem", color: "var(--ims-gray-700)" }}>
                The user will be required to set their own password on next login.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="submit" className="btn btn-primary">Reset Password</button>
                <button type="button" className="btn btn-muted" onClick={() => { setResetTargetUser(null); setResetPassword(""); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
