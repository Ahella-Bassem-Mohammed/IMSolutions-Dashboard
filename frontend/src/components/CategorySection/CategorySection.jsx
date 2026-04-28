import React, { useState } from "react";
import "./CategorySection.css";
import LinkCard from "../LinkCard/LinkCard";
import { categoryColors } from "../../config/colors";

const CategorySection = ({ category, links, limit = 4 }) => {
  const [showAll, setShowAll] = useState(false);

  const displayedLinks = showAll ? links : links.slice(0, limit);
  const hasMore = links.length > limit;

  return (
    <section className="category-section">
      <div className="section-header">
        <h2
          className="section-title"
          style={{ color: categoryColors[category] || "#3498DB" }}
        >
          {category}
          <span className="section-count">({links.length})</span>
        </h2>
        {hasMore && !showAll && (
          <button
            className="view-all-btn"
            onClick={() => setShowAll(true)}
            style={{
              "--category-color": categoryColors[category] || "#3498DB",
            }}
          >
            View All ({links.length})
          </button>
        )}
        {hasMore && showAll && (
          <button
            className="view-all-btn"
            onClick={() => setShowAll(false)}
            style={{
              "--category-color": categoryColors[category] || "#3498DB",
            }}
          >
            Show Less
          </button>
        )}
      </div>

      <p className="section-description">{getCategoryDescription(category)}</p>

      <div className="section-grid">
        {displayedLinks.map((link) => (
          <LinkCard key={link.id} {...link} />
        ))}
      </div>
    </section>
  );
};

// Helper function for category descriptions
const getCategoryDescription = (category) => {
  const descriptions = {
    SEO: "Search Engine Optimization performance metrics, rankings, and analytics",
    Projects:
      "Project management dashboards, timelines, and resource allocation",
    "Client Requests":
      "Client support requests tracking and resolution metrics",
    Forms: "Submission forms for requests, KPIs, and project documentation",
    "Employee KPI":
      "Employee performance tracking and Key Performance Indicators",
    Dashboards:
      "Interactive data visualization and business intelligence reports",
    Reports: "Detailed analytical reports and insights",
  };

  return descriptions[category] || "Collection of related dashboards and tools";
};

export default CategorySection;
