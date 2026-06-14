const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

module.exports = (app) => {
  const { allQuery } = app.locals;
  const db = app.locals.db;

  router.get("/", auth, async (req, res) => {
    try {
      const user = req.user;

      // Admin and top_management see everything
      if (user.role === "admin" || user.role === "top_management") {
        const allDashboards = await allQuery(
          db,
          "SELECT * FROM dashboards ORDER BY category, title",
        );
        return res.json({ links: allDashboards, userRole: user.role });
      }

      // Everyone else sees ONLY what the admin has explicitly assigned them.
      // No assignment = empty dashboard.
      const userDashboards = await allQuery(
        db,
        `SELECT d.* FROM dashboards d
         JOIN user_dashboard_access u ON u.dashboard_id = d.id
         WHERE u.user_id = ?
         ORDER BY d.category, d.title`,
        [user.id],
      );

      res.json({ links: userDashboards, userRole: user.role });
    } catch (err) {
      console.error("Error in /api/links:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  return router;
};
