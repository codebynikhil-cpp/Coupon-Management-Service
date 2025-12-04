const app = require("./app");

const PORT = process.env.PORT || 3000;

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
}

// For Vercel serverless
module.exports = app;

// package.json
{
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
