// Utility functions for the app

// Format URLs to ensure they open properly
export const formatUrl = (url) => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

// Filter links by category
export const filterLinksByCategory = (links, category) => {
  if (!category) return links;
  return links.filter((link) => link.category === category);
};

// Search links by title or description
export const searchLinks = (links, searchTerm) => {
  if (!searchTerm) return links;
  const term = searchTerm.toLowerCase();
  return links.filter(
    (link) =>
      link.title.toLowerCase().includes(term) ||
      link.description.toLowerCase().includes(term)
  );
};

// Get unique categories from links
export const getUniqueCategories = (links) => {
  const categories = links.map((link) => link.category);
  return [...new Set(categories)];
};
