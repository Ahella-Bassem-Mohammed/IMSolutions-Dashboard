import React from "react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <i className="fas fa-chart-line"></i>
          </div>
          <div>
            <h3 className="footer-company">IM Solutions</h3>
            <p className="footer-tagline">Dashboard Hub & Analytics Portal</p>
          </div>
        </div>

        <div className="footer-info">
          <div className="footer-section">
            <h4 className="footer-heading">Quick Access</h4>
            <ul className="footer-links">
              <li>
                <a href="#seo">
                  <i className="fas fa-search"></i> SEO Dashboards
                </a>
              </li>
              <li>
                <a href="#forms">
                  <i className="fas fa-file-alt"></i> Submission Forms
                </a>
              </li>
              <li>
                <a href="#projects">
                  <i className="fas fa-project-diagram"></i> Project Management
                </a>
              </li>
              <li>
                <a href="#kpi">
                  <i className="fas fa-star"></i> Employee KPI
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Contact Support</h4>
            <ul className="footer-contact">
              <li>
                <i className="fas fa-envelope"></i> support@imsolutions.com
              </li>
              <li>
                <i className="fas fa-phone"></i> +1 (555) 123-4567
              </li>
              <li>
                <i className="fas fa-clock"></i> Mon-Fri: 9AM-6PM
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} IM Solutions. All rights reserved.
          </p>
          <p className="footer-note">
            This portal contains proprietary dashboards and forms for internal
            use only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
