// server.js or index.js
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const { supabase } = require("./server/config/supabase");
const routes = require("./server/routes");
const errorHandler = require("./server/middleware/errorHandler");

// CORS setup
const corsOptions = {
  origin: ["http://localhost:5173"], // Add any other origins you need
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Add this if you're using credentials
};
app.use(cors(corsOptions));

// IMPORTANT: File upload middleware MUST come BEFORE routes
// This must be registered BEFORE any body parsers
app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
    createParentPath: true,
    debug: true, // Enable debug mode temporarily
  })
);

// Body parsers after file upload middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware - BEFORE routes to capture all requests
app.use((req, res, next) => {
  if (["POST", "PUT"].includes(req.method)) {
    console.log(`[${req.method}] ${req.url} - Request Body:`, req.body);
    console.log("Content-Type:", req.get("Content-Type"));
    if (req.files) console.log("Files:", req.files);
  }
  next();
});

// Test routes
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

app.post("/api/test-upload", (req, res) => {
  console.log("Test upload route hit");
  console.log("Body:", req.body);
  console.log("Files:", req.files);
  return res.json({
    success: true,
    body: req.body,
    files: req.files ? Object.keys(req.files) : [],
  });
});

app.post("/api/test-body", (req, res) => {
  console.log("Testing body parsing, received:", req.body);
  res.json({
    success: true,
    received: req.body,
    bodyType: typeof req.body,
    contentType: req.get("Content-Type"),
    isEmpty: Object.keys(req.body).length === 0,
  });
});

// Supabase test routes
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

app.get("/api/supabase-tables", async (req, res) => {
  try {
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

// API routes - only register ONCE
app.use("/api", routes);

// Error handling middleware - must be AFTER routes
app.use(errorHandler);

// 404 handler for any other routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Server startup
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test your backend at: http://localhost:${PORT}/api/test`);
  console.log(`Test file upload at: http://localhost:${PORT}/api/test-upload`);
  console.log(`Test body parsing at: http://localhost:${PORT}/api/test-body`);
});
