// src/config/colors.js

export const brandColors = {
  // Primary Orange Theme (from your AppsScript)
  primary: "#ff6600", // Main orange - from your button background
  primaryDark: "#e65c00", // Hover state - from button:hover
  primaryLight: "#fff8f0", // Light background - from file-input-button:hover

  // Secondary colors
  secondary: "#2C3E50", // Dark blue/grey - for text and accents
  accent: "#4CAF50", // Green - for success/progress
  danger: "#ff4444", // Red - for errors/removal
  warning: "#FF9800", // Orange warning

  // Neutral colors
  dark: "#2C3E50",
  light: "#fdfdfd", // Body background from your code
  grey: "#cccccc",
  white: "#FFFFFF",
  black: "#000000",

  // UI Colors
  border: "#ddd", // Input borders
  borderFocus: "#ff6600", // Input focus border
  shadow: "rgba(0, 0, 0, 0.1)",

  // Backgrounds
  bodyBg: "#fdfdfd", // Body background
  cardBg: "#FFFFFF", // Card/Container background
  inputBg: "#f8f9fa", // Input background

  // Gradients
  headerGradient: "linear-gradient(135deg, #ff6600 0%, #ff8533 100%)",
  cardGradient: "linear-gradient(135deg, #FFFFFF 0%, #fdfdfd 100%)",

  // States
  success: "#4CAF50",
  error: "#ff4444",
  info: "#2196F3",
};

export const categoryColors = {
  SEO: "#4CAF50", // Green - for growth/SEO
  Projects: "#2196F3", // Blue - for projects
  "Client Requests": "#9C27B0", // Purple - for client management
  Forms: "#ff6600", // Orange - main brand color for forms
  "Employee KPI": "#FF9800", // Orange - for performance
  Dashboards: "#607D8B", // Blue Grey - for dashboards
  Reports: "#795548", // Brown - for reports
};

export const categoryIcons = {
  SEO: "🔍",
  Projects: "📁",
  "Client Requests": "👥",
  Forms: "📝",
  "Employee KPI": "⭐",
  Dashboards: "📊",
  Reports: "📈",
};
