export const dashboardLinks = [
  // SEO Performance (as per your request)
  {
    id: 1,
    title: "IM Holding Arabia Audit",
    description:
      "Comprehensive SEO metrics, rankings, and performance analytics",
    url: "https://lookerstudio.google.com/reporting/cd2cda87-5149-459d-a423-2f5808c55ffe",
    category: "SEO",
    icon: "🔍",
    backgroundColor: "#4CAF50",
    tags: ["analytics", "performance", "rankings", "seo", "im holding"],
  },
  {
    id: 11,
    title: "Core Construction Audit ",
    description:
      "Comprehensive SEO metrics, rankings, and performance analytics",
    url: "https://lookerstudio.google.com/reporting/f4988046-c9c4-4148-9ed1-5310c744fee9",
    category: "SEO",
    icon: "🔍",
    backgroundColor: "#4CAF50",
    tags: ["analytics", "performance", "rankings", "seo", "im holding"],
  },

  {
    id: 12,
    title: "HNI UAE Audit ",
    description:
      "Comprehensive SEO metrics, rankings, and performance analytics",
    url: "https://lookerstudio.google.com/reporting/f4988046-c9c4-4148-9ed1-5310c744fee9",
    category: "SEO",
    icon: "🔍",
    backgroundColor: "#4CAF50",
    tags: ["analytics", "performance", "rankings", "seo", "hni"],
  },

  // Project Pages (couple of pages for each project)
  {
    id: 2,
    title: "Zanussi Requests ",
    description: "Detailed metrics and analytics of requests for Zanussi site",
    url: "https://lookerstudio.google.com/s/o1XBdxBhICE",
    category: "Client Requests",
    icon: "📊",
    backgroundColor: "#2196F3",
    tags: ["zanussi", "analytics", "performance"],
  },
  {
    id: 3,
    title: "Propster Requests ", //, Kent Collede, IM Solutions, Core Construction and HNI
    description: "Detailed metrics and analytics of requests for Propster site",
    url: "https://lookerstudio.google.com/s/lWalxcXLfd8",
    category: "Client Requests",
    icon: "📈",
    backgroundColor: "#2196F3",
    tags: ["propster", "analytics", "performance"],
  },

  // Client Requests Tracking (two separate links)
  /*{
    id: 4,
    title: "Client Requests Tracker",
    description: "Track all incoming client requests and resolution status",
    url: "https://lookerstudio.google.com/reporting/client-requests-id",
    category: "Client Requests",
    icon: "👥",
    backgroundColor: "#9C27B0",
    tags: ["clients", "requests", "tracking"],
  },
  {
    id: 5,
    title: "Client Support Dashboard",
    description: "Client support metrics and response time analytics",
    url: "https://lookerstudio.google.com/reporting/client-support-id",
    category: "Client Requests",
    icon: "🛟",
    backgroundColor: "#9C27B0",
    tags: ["support", "clients", "response"],
  },*/

  // Forms (as per your request)
  {
    id: 6,
    title: "Zanussi Requests Form",
    description: "Submit Zanussi project requests and issues",
    url: "https://script.google.com/macros/s/AKfycbymkqgeNlLsLTEyfaEUmLUXfILKm57IFoUD2YNihm5mr1yrTJvsn3n59DDLvvdQvzfZjg/exec",
    category: "Forms",
    icon: "📝",
    backgroundColor: "#ff6600",
    tags: ["zanussi", "requests", "form", "submission"],
  },
  {
    id: 7,
    title: "Project Requests Form",
    description: "Submit new project requests or modifications",
    url: "https://script.google.com/macros/s/AKfycbw70pFy667_2SxINH5740lscv8h9RS9eGzC6utZJw5AoOcn1mMGC4wX95LOGl5CrCljtA/exec",
    category: "Forms",
    icon: "🚀",
    backgroundColor: "#ff6600",
    tags: ["projects", "requests", "submission"],
  },
  {
    id: 8,
    title: "Weekly KPI Submission",
    description: "Employee weekly performance KPI tracking and submission",
    url: "https://script.google.com/macros/s/AKfycbwRNBSDi0LWmMCfEUY3N-ni8rrL1HiUArT0YHKRjco_HeSq-wKHmht-K8-BDrjl1hvjMw/exec",
    category: "Forms",
    icon: "⭐",
    backgroundColor: "#ff6600",
    tags: ["kpi", "performance", "employees", "weekly"],
  },

  // Employee KPI Dashboard
  {
    id: 9,
    title: "Employee Performance Dashboard",
    description:
      "Weekly KPI tracking and performance analytics for all employees",
    url: "https://lookerstudio.google.com/s/gDZZqoCmGGU",
    category: "Employee KPI",
    icon: "👨‍💼",
    backgroundColor: "#FF9800",
    tags: ["employees", "performance", "kpi", "analytics"],
  },
];

// Helper function to get links by category
export const getLinksByCategory = (category) => {
  return dashboardLinks.filter((link) => link.category === category);
};

// Get all unique categories
export const getAllCategories = () => {
  const categories = dashboardLinks.map((link) => link.category);
  return [...new Set(categories)];
};

// Count links per category
export const getCategoryCounts = () => {
  const counts = {};
  dashboardLinks.forEach((link) => {
    counts[link.category] = (counts[link.category] || 0) + 1;
  });
  return counts;
};
