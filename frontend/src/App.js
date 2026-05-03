import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import "./App.css";

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
      <header
        style={{
          backgroundColor: "#2c3e50",
          color: "white",
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>IMSolutions Dashboard</h1>
        <div>
          {user.role === "admin" && (
            <button
              type="button"
              onClick={() => navigate("/admin")}
              style={{
                marginRight: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Admin Panel
            </button>
          )}
          <span style={{ marginRight: "1rem" }}>Welcome, {user.email}</span>
          <button
            type="button"
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
      </header>
      <main style={{ padding: "20px" }}>
        {Object.keys(groupedLinks).map((category) => (
          <div key={category} style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                borderBottom: "3px solid #4CAF50",
                paddingBottom: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {category}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1rem",
              }}
            >
              {groupedLinks[category].map((link) => (
                <div
                  key={link.id}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      window.open(link.url, "_blank", "noopener,noreferrer");
                    }
                  }}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "1rem",
                    backgroundColor: link.backgroundColor || "#fff",
                    color: link.backgroundColor ? "#fff" : "#333",
                    transition: "transform 0.2s",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    window.open(link.url, "_blank", "noopener,noreferrer")
                  }
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-5px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                    {link.icon}
                  </div>
                  <h3 style={{ margin: "0 0 0.5rem 0" }}>{link.title}</h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
                    {link.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
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
    </Routes>
  );
}

export default App;
