import React, { useState } from "react";
import "./styles/App.css";
import Header from "./components/Header";
import LinkCard from "./components/LinkCard";
import Footer from "./components/Footer";
import { dashboardLinks } from "./data/links";
import { searchLinks, getUniqueCategories } from "./utils/helpers";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredLinks = searchLinks(
    selectedCategory
      ? dashboardLinks.filter((link) => link.category === selectedCategory)
      : dashboardLinks,
    searchTerm
  );

  const categories = getUniqueCategories(dashboardLinks);

  return (
    <div className="App">
      <Header />

      {/* Search and Filter Section */}
      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search dashboards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filters">
          <button
            className={`category-btn ${!selectedCategory ? "active" : ""}`}
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
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <main className="main-content">
        {filteredLinks.length > 0 ? (
          <div className="links-container">
            {filteredLinks.map((link) => (
              <LinkCard key={link.id} {...link} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No dashboards found matching your search.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
