const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config(); 
const { supabase } = require('./server/config/supabase'); // Simplified path // Import from config file
const routes = require('./server/routes');
const errorHandler = require('./server/middleware/errorHandler');

// CORS setup
const corsOptions = {
  origin: ["http://localhost:5173"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// JSON parsing middleware
app.use(express.json());

// Test route to check if server is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Test Supabase connection
app.get('/api/supabase-test', async (req, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('count(*)');
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      message: 'Supabase connection successful',
      data
    });
  } catch (error) {
    console.error('Supabase connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect to Supabase',
      error: error.message
    });
  }
});

// List Supabase tables
app.get('/api/supabase-tables', async (req, res) => {
  try {
    // Query the pg_tables system catalog
    const { data, error } = await supabase.from('pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public');
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      tables: data.map(t => t.tablename)
    });
  } catch (error) {
    console.error('Error listing tables:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to list tables',
      error: error.message
    });
  }
});

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// Server startup
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test your backend connection at: http://localhost:${PORT}/api/test`);
  console.log(`Test your Supabase connection at: http://localhost:${PORT}/api/supabase-test`);
  console.log(`List your Supabase tables at: http://localhost:${PORT}/api/supabase-tables`);
});