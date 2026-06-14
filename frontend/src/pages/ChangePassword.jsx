import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ChangePassword = () => {
  const { changePassword, logout, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from the temporary password");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Set a New Password</h1>
        <p
          className="login-hint"
          style={{ marginTop: 0, marginBottom: "1rem" }}
        >
          {user?.full_name ? `Welcome, ${user.full_name}. ` : ""}
          For security, you must set a new password before continuing.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Temporary password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="login-input"
            autoComplete="current-password"
          />
          <input
            type="password"
            placeholder="New password (min. 8 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="login-input"
            autoComplete="new-password"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="login-input"
            autoComplete="new-password"
          />
          {error && <div className="form-error">{error}</div>}
          <button
            type="submit"
            className="btn btn-primary login-button"
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Set New Password"}
          </button>
        </form>
        <div className="login-hint">
          <button
            type="button"
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              color: "var(--ims-gray-700)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Sign out instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
