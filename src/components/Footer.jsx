import React from "react";
import "../styles/App.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>Dashboard Hub • {new Date().getFullYear()}</p>
        <p className="footer-note">
          This site contains links to various analytics dashboards. You may need
          proper permissions to access some links.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
