import React from "react";
import "../styles/App.css";

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="site-title">Dashboard Hub</h1>
        <p className="site-subtitle">
          Centralized access to all your analytics dashboards
        </p>
      </div>
    </header>
  );
};

export default Header;
