import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, API_URL } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setNeedsVerification(false);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setNeedsVerification(!!err.response?.data?.needsVerification);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    setResending(true);
    setError("");
    setInfo("");
    try {
      const res = await axios.post(`${API_URL}/auth/resend-verification`, { email });
      setInfo(res.data.message);
      setNeedsVerification(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">IMSolutions Dashboard</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
            autoComplete="current-password"
          />
          {error && <div className="form-error">{error}</div>}
          {info && <div className="form-success">{info}</div>}
          <button
            type="submit"
            className="btn btn-primary login-button"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
          {needsVerification && (
            <button
              type="button"
              className="btn btn-muted login-button"
              style={{ marginTop: "0.5rem" }}
              onClick={handleResendVerification}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
