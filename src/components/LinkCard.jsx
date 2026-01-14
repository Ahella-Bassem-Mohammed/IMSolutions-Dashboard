import React from "react";
import "../styles/App.css";

const LinkCard = ({
  title,
  description,
  url,
  category,
  icon,
  backgroundColor,
}) => {
  const handleClick = () => {
    // Open in new tab with security best practices
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="link-card"
      style={{ borderTopColor: backgroundColor }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      <div className="card-header">
        <span
          className="card-icon"
          style={{ backgroundColor }}
          aria-label={title}
        >
          {icon}
        </span>
        <div className="card-category">{category}</div>
      </div>
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
      <div className="card-footer">
        <span className="card-link">Open Dashboard →</span>
      </div>
    </div>
  );
};

export default LinkCard;
