const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

module.exports = (app) => {
  const { allQuery } = app.locals;
  const db = app.locals.db;

  router.get("/", auth, async (req, res) => {
    try {
      const user = req.user;
      let allowedDashboardIds = null;
      let allowedCategories = [];

      // 1. Admin or top_management see everything
      if (user.role === "admin" || user.role === "top_management") {
        const allDashboards = await allQuery(
          db,
          "SELECT * FROM dashboards ORDER BY category, id",
        );
        return res.json({ links: allDashboards, userRole: user.role });
      }

      // 2. Check explicit dashboard assignments for this user
      const userDashboards = await allQuery(
        db,
        `SELECT d.* FROM dashboards d
                 JOIN user_dashboard_access u ON u.dashboard_id = d.id
                 WHERE u.user_id = ?`,
        [user.id],
      );
      if (userDashboards && userDashboards.length > 0) {
        return res.json({ links: userDashboards, userRole: user.role });
      }

      // 3. No explicit assignments – fallback to role‑based or department‑based categories
      // Role-based categories
      const roleCats = await allQuery(
        db,
        "SELECT category FROM role_category_access WHERE role = ?",
        [user.role],
      );
      allowedCategories.push(...roleCats.map((r) => r.category));

      // Department-based (if user has department)
      if (user.department) {
        const deptCats = await allQuery(
          db,
          "SELECT allowed_category FROM department_access WHERE department = ?",
          [user.department],
        );
        allowedCategories.push(...deptCats.map((r) => r.allowed_category));
      }

      // Remove duplicates
      allowedCategories = [...new Set(allowedCategories)];

      let filteredLinks = [];
      if (allowedCategories.length > 0) {
        const placeholders = allowedCategories.map(() => "?").join(",");
        filteredLinks = await allQuery(
          db,
          `SELECT * FROM dashboards WHERE category IN (${placeholders})`,
          allowedCategories,
        );
      }

      res.json({ links: filteredLinks, userRole: user.role });
    } catch (err) {
      console.error("Error in /api/links:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  return router;
};
