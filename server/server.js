
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const app = express();

// Middleware
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    const localOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
    if (!origin || (allowedOrigins.length ? allowedOrigins : localOrigins).includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS"));
  },
}));
app.use(express.json());

// Health check + MySQL connection test
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS connected");

    res.json({
      message: "TaskFlow API is running",
      database: rows[0].connected === 1,
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

// Task CRUD routes
app.use("/api/tasks", require("./task"));

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to TaskFlow API");
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TaskFlow API running on port ${PORT}`);
  });
}

module.exports = { app, pool };
