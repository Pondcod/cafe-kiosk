const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config(); // For environment variables
const { createClient } = require('@supabase/supabase-js'); // Supabase client

// CORS setup
const corsOption = {
  origin: ["http://localhost:5173"],
};
app.use(cors(corsOption));

// JSON parsing middleware
app.use(express.json());

// Set up Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test route to check if server is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Update your /api/supabase-test endpoint with this code
app.get('/api/supabase-test', async (req, res) => {
    try {
      // Using a simpler query that's less likely to cause syntax errors
      const { data, error } = await supabase
        .from('test')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      res.json({
        success: true,
        message: 'Successfully connected to Supabase!',
        data: data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Failed to connect to Supabase: ${error.message}`
      });
    }
  });

// Add this new endpoint to your server.js
app.get('/api/supabase-connection', async (req, res) => {
    try {
      // Just check if we can connect to Supabase at all
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      res.json({
        success: true,
        message: 'Successfully connected to Supabase!',
        connected: true
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Failed to connect to Supabase: ${error.message}`
      });
    }
  });

// Additional test route that lists all tables in your Supabase
app.get('/api/supabase-tables', async (req, res) => {
  try {
    // This query lists all tables in your database schema
    const { data, error } = await supabase
      .rpc('list_tables');
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Successfully retrieved tables from Supabase!',
      tables: data
    });
  } catch (error) {
    // If the RPC isn't available, try an alternative approach
    try {
      const { data, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (error) throw error;
      
      res.json({
        success: true,
        message: 'Successfully retrieved tables from Supabase!',
        tables: data.map(t => t.tablename)
      });
    } catch (secondError) {
      res.status(500).json({
        success: false,
        message: `Failed to list tables: ${secondError.message}`,
        originalError: error.message
      });
    }
  }
});

// Server startup
app.listen(8080, () => {
  console.log("Server start on port 8080");
  console.log("Test your backend connection at: http://localhost:8080/api/test");
  console.log("Test your Supabase connection at: http://localhost:8080/api/supabase-test");
  console.log("List your Supabase tables at: http://localhost:8080/api/supabase-tables");
});