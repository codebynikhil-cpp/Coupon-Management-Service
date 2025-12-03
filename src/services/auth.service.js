const { demoUsers } = require("../models/memoryStore");

// Very simple credential check against in-memory demo users.
exports.authenticate = (email, password) => {
  return demoUsers.find(
    (u) => u.email === email && u.password === password
  );
};


