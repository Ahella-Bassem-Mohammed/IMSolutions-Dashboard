const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { dashboardLinks } = require("../data/links");

module.exports = (app) => {
  const { getQuery, allQuery } = app.locals;
  const db = app.locals.db;

  // GET all links (filtered by user role/department)
  router.get("/", auth, async (req, res) => {
    try {
      const user = req.user;
      let filteredLinks = [...dashboardLinks];

      if (!filteredLinks || filteredLinks.length === 0) {
        return res.status(500).json({
          message: "No dashboard links configured",
          links: [],
        });
      }

      // Admin sees everything
      if (user.role === "admin") {
        return res.json({ links: filteredLinks, userRole: user.role });
      }

      // Get allowed categories for this user's department
      const accessRules = await allQuery(
        db,
        "SELECT allowed_category FROM department_access WHERE department = ?",
        [user.department || "viewer"],
      );

      const allowedCategories = accessRules.map((row) => row.allowed_category);

      // Filter by allowed categories
      if (allowedCategories.length > 0) {
        filteredLinks = filteredLinks.filter((link) =>
          allowedCategories.includes(link.category),
        );
      }

      res.json({
        links: filteredLinks,
        userRole: user.role,
        department: user.department,
      });
    } catch (err) {
      console.error("Error in /api/links:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  return router;
};
