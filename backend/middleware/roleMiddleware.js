// middleware/roleMiddleware.js

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    // Debug log to check what's happening
    console.log("ROLE CHECK:", req.user.role);

    //console.log("🧩 Role check -> current:", req.user?.role, " | allowed:", roles);

    // If no user found
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized: user missing" });
    }

    // Normalize both to lowercase to prevent case mismatch
    const userRole = req.user.role?.toLowerCase();
    const allowed = roles.map(r => r.toLowerCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        message: `Forbidden: insufficient role (${userRole}). Allowed: ${allowed.join(", ")}`,
      });
    }

    next();
  };
};
