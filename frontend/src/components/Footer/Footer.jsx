import React from "react";
import "./Footer.css";

const Footer = () => (
  <footer className="app-footer">
    <span>© {new Date().getFullYear()} IMSolutions — Online Business Development</span>
    <span className="footer-meta">Dashboard v1.0</span>
  </footer>
);

export default Footer;
