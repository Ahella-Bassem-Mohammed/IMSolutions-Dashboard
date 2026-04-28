import React, { useState } from "react";
import "./styles/App.css";
import Header from "./components/Header/Header";
import LinkCard from "./components/LinkCard/LinkCard";
import FilterBar from "./components/FilterBar/FilterBar";
import CategorySection from "./components/CategorySection/CategorySection";
import Footer from "./components/Footer/Footer";
import {
  dashboardLinks,
  getAllCategories,
  getLinksByCategory,
} from "./data/links";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = getAllCategories();

  // Filter logic
  const filteredLinks = selectedCategory
    ? getLinksByCategory(selectedCategory)
    : dashboardLinks;

  const searchedLinks = searchTerm
    ? filteredLinks.filter(
        (link) =>
          link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          link.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          link.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    : filteredLinks;

  return (
    <div className="App">
      <Header />

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      <main className="main-content">
        {selectedCategory ? (
          // Show filtered view
          <div className="filtered-view">
            <h2 className="category-title">
              {selectedCategory} ({searchedLinks.length})
            </h2>
            <div className="links-grid">
              {searchedLinks.map((link) => (
                <LinkCard key={link.id} {...link} />
              ))}
            </div>
          </div>
        ) : (
          // Show categorized view
          <div className="categorized-view">
            {categories.map((category) => {
              const categoryLinks = getLinksByCategory(category);
              return (
                <CategorySection
                  key={category}
                  category={category}
                  links={categoryLinks}
                  limit={4}
                />
              );
            })}
          </div>
        )}

        {searchedLinks.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No results found</h3>
            <p>
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
