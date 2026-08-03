import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import ChangePassword from "./pages/ChangePassword";
import VerifyEmail from "./pages/VerifyEmail";
import Register from "./pages/Register";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import "./App.css";

function Dashboard() {
  const { links } = useAuth();

  const groupedLinks = (links || []).reduce((groups, link) => {
    const category = link.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(link);
    return groups;
  }, {});

  const hasLinks = Object.keys(groupedLinks).length > 0;

  return (
    <main className="dashboard-container">
      {!hasLinks && (
        <div className="access-denied">
          <h2>No Dashboards Assigned Yet</h2>
          <p>
            You don't have any dashboards assigned to your account yet.
            Please contact an administrator to get access.
          </p>
        </div>
      )}
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
                onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}
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
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Public routes available whether logged in or not
  return (
    <Routes>
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          !user ? (
            <Login />
          ) : user.must_change_password ? (
            <ChangePassword />
          ) : (
            <div className="app-shell">
              <NavBar />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Footer />
            </div>
          )
        }
      />
    </Routes>
  );
}

export default App;
