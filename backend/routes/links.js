const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

module.exports = (app) => {
  const { allQuery } = app.locals;
  const db = app.locals.db;

  router.get("/", auth, async (req, res) => {
    try {
      const user = req.user;

      // 1. Admin and Top Management see everything
      if (user.role === "admin" || user.role === "top_management") {
        const allDashboards = await allQuery(
          db,
          "SELECT * FROM dashboards ORDER BY category, id",
        );
        return res.json({ links: allDashboards, userRole: user.role });
      }

      // 2. For all other users: return ONLY dashboards assigned to them
      const assignedDashboards = await allQuery(
        db,
        `SELECT d.* FROM dashboards d
                 JOIN user_dashboard_access u ON u.dashboard_id = d.id
                 WHERE u.user_id = ?`,
        [user.id],
      );

      // If no assignments, return empty array (user sees nothing)
      res.json({ links: assignedDashboards, userRole: user.role });
    } catch (err) {
      console.error("Error in /api/links:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  return router;
};
