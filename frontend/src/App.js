import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import "./App.css";
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


function Dashboard() {
  const { user, links, logout } = useAuth();
  const navigate = useNavigate();

  const groupedLinks = (links || []).reduce((groups, link) => {
    const category = link.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(link);
    return groups;
  }, {});

  return (
    <>
      <header className="app-header">
        <h1 className="brand-title">IMSolutions Dashboard</h1>
        <div className="header-actions">
          {user.role === "admin" && (
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="btn btn-primary"
            >
              Admin Panel
            </button>
          )}
          <span style={{ marginRight: "1rem" }}>
            Welcome, {user.full_name || user.email}
          </span>
          <button type="button" onClick={logout} className="btn btn-muted">
            Logout
          </button>
        </div>
      </header>
      <main className="dashboard-container">
        {Object.keys(groupedLinks).map((category) => (
          <section key={category} className="category-section">
            <h2 className="category-title">{category}</h2>
            <div className="dashboard-grid">
              {groupedLinks[category].map((link) => (
                <div
                  key={link.id}
                  role="link"
                  tabIndex={0}
                  aria-label={link.title}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      window.open(link.url, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className="link-card"
                  onClick={() =>
                    window.open(link.url, "_blank", "noopener,noreferrer")
                  }
                >
                  <div className="link-icon">{link.icon}</div>
                  <h3 className="link-title">{link.title}</h3>
                  <p className="link-description">{link.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;
