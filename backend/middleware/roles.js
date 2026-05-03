// Check if user has admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

// Check if user can access a specific category
const canAccessCategory = (allowedCategories) => {
  return (req, res, next) => {
    const category = req.params.category || req.body.category;

    if (req.user.role === "admin") {
      return next(); // Admin can access everything
    }

    if (allowedCategories.includes(category)) {
      return next();
    }

    res.status(403).json({
      message: `Access denied. You cannot access ${category} dashboards.`,
    });
  };
};

module.exports = { isAdmin, canAccessCategory };
