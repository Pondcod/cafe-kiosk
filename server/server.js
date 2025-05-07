const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config(); 
const { supabase } = require('../server/server/config/supabase'); // Import from config file
const routes = require('./server/routes');

// CORS setup
const corsOption = {
  origin: ["http://localhost:5173"],
};
app.use(cors(corsOption));

// JSON parsing middleware
app.use(express.json());

app.use('/api', routes);

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

  // Server startup
  app.listen(8080, () => {
    console.log("Server start on port 8080");
    console.log("Test your backend connection at: http://localhost:8080/api/test");
    console.log("Test your Supabase connection at: http://localhost:8080/api/supabase-test");
    console.log("List your Supabase tables at: http://localhost:8080/api/supabase-tables");
  });