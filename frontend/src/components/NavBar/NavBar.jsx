import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import "./NavBar.css";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (user?.full_name || user?.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="app-header">
      <div className="nav-left">
        <img src={logo} alt="IMSolutions" className="nav-logo" />
        <nav className="nav-links">
          <button
            type="button"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => navigate("/")}
          >
            Dashboards
          </button>
          {user?.role === "admin" && (
            <button
              type="button"
              className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}
              onClick={() => navigate("/admin")}
            >
              Admin Panel
            </button>
          )}
        </nav>
      </div>

      <div className="nav-user" ref={menuRef}>
        <button
          type="button"
          className="nav-avatar"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {initials}
        </button>
        {menuOpen && (
          <div className="nav-dropdown">
            <div className="nav-dropdown-header">
              <strong>{user?.full_name || user?.email}</strong>
              <small>{user?.email}</small>
            </div>
            <button
              type="button"
              className="nav-dropdown-item"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
