// server.js or index.js
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { supabase } = require("./server/config/supabase");
const routes = require("./server/routes");
const errorHandler = require("./server/middleware/errorHandler");

// CORS setup
const corsOptions = {
  origin: ["http://localhost:5173"], // Add any other origins you need
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // Add this if you're using credentials
};
app.use(cors(corsOptions));

// IMPORTANT: Body parsing middleware must come BEFORE routes
// Configure body parser for JSON
app.use(express.json()); // Increase limit if needed
app.use(express.urlencoded({ extended: true }));

// Add this middleware for debugging request bodies
app.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)) {
    console.log(`[${req.method}] ${req.url} - Request Body:`, req.body);
    console.log('Content-Type:', req.get('Content-Type'));
  }
  next();
});

// Test route to check if server is running
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

// Debug body parsing
app.post("/api/test-body", (req, res) => {
  console.log("Testing body parsing, received:", req.body);
  res.json({
    success: true,
    received: req.body,
    bodyType: typeof req.body,
    contentType: req.get('Content-Type'),
    isEmpty: Object.keys(req.body).length === 0
  });
});

// Test Supabase connection
app.get("/api/supabase-test", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("count(*)");

    if (error) throw error;

    res.json({
      success: true,
      message: "Supabase connection successful",
      data,
    });
  } catch (error) {
    console.error("Supabase connection error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to connect to Supabase",
      error: error.message,
    });
  }
});

// List Supabase tables
app.get("/api/supabase-tables", async (req, res) => {
  try {
    // Query the pg_tables system catalog
    const { data, error } = await supabase
      .from("pg_tables")
      .select("schemaname, tablename")
      .eq("schemaname", "public");

    if (error) throw error;

    res.json({
      success: true,
      tables: data.map((t) => t.tablename),
    });
  } catch (error) {
    console.error("Error listing tables:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list tables",
      error: error.message,
    });
  }
});

// API routes
app.use("/api", routes);

// Error handling middleware - must be AFTER routes
app.use(errorHandler);

// 404 handler for any other routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Server startup
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test your backend at: http://localhost:${PORT}/api/test`);
  console.log(`Test body parsing at: http://localhost:${PORT}/api/test-body`);
});