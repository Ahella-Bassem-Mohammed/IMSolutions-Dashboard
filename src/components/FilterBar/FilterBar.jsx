import React from "react";
import "./FilterBar.css";
import { categoryColors } from "../../config/colors";

const FilterBar = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-container">
        <div className="search-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search dashboards, forms, or reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="category-filter">
          <div className="filter-label">Filter by:</div>
          <div className="category-buttons">
            <button
              className={`category-btn all-btn ${
                !selectedCategory ? "active" : ""
              }`}
              onClick={() => setSelectedCategory("")}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
                style={{
                  "--category-color": categoryColors[category] || "#3498DB",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
