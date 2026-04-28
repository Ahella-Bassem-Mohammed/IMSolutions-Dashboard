import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <div className="logo-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div>
            <h1 className="company-name">IM Solutions</h1>
            <p className="tagline">Dashboard Hub & Analytics Portal</p>
          </div>
        </div>

        <div className="header-info">
          <div className="info-item">
            <i className="fas fa-bell"></i>
            <span className="info-label">Updates</span>
            <span className="info-value">Today</span>
          </div>
          <div className="info-item">
            <i className="fas fa-chart-bar"></i>
            <span className="info-label">Dashboards</span>
            <span className="info-value">12</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
