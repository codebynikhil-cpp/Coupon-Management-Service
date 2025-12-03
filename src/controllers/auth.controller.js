const { authenticate } = require("../services/auth.service");

// Simple login endpoint for the demo user(s).
// NOTE: This is NOT production-grade authentication; it's only for the assignment demo.
exports.login = (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = authenticate(email, password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Do not return the password field.
  const { password: _pwd, ...safeUser } = user;

  return res.json({
    user: safeUser,
    // Fake token just for UI demos; no real auth.
    token: "demo-token"
  });
};


