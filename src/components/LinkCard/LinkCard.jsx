import React from "react";
import "./LinkCard.css";

const LinkCard = ({
  title,
  description,
  url,
  category,
  icon,
  backgroundColor,
  tags = [],
}) => {
  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  };

  return (
    <div
      className="link-card"
      style={{ "--card-color": backgroundColor }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={handleKeyPress}
    >
      <div className="card-header">
        <div className="card-icon-container">
          <span
            className="card-icon"
            style={{ backgroundColor }}
            aria-label={`${category} icon`}
          >
            {icon}
          </span>
          <span className="card-category" style={{ color: backgroundColor }}>
            {category}
          </span>
        </div>
        <div className="card-external">↗</div>
      </div>

      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>

      {tags.length > 0 && (
        <div className="card-tags">
          {tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="tag-more">+{tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="card-footer">
        <button className="card-action-btn">
          Open {category === "Forms" ? "Form" : "Dashboard"} →
        </button>
      </div>
    </div>
  );
};

export default LinkCard;
