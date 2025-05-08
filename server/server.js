const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config(); 
const { supabase } = require('../server/server/config/supabase'); // Import from config file
const routes = require('./server/routes');
const errorHandler = require('./server/middleware/errorHandler');

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

app.use(errorHandler);

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

  // Add this to your server.js file
app.get('/api/tables', async (req, res) => {
  try {
    // List tables in the 'public' schema
    const { data, error } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (error) throw error;
    
    res.json({
      success: true,
      tables: data.map(t => t.tablename)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error listing tables: ${error.message}`
    });
  }
});
// Debug endpoint to test Supabase connection
app.get('/api/debug', async (req, res) => {
  try {
    console.log('Debug endpoint called');
    const { data: tablesData, error: tablesError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tablesError) {
      console.error('Error listing tables:', tablesError);
      return res.status(500).json({
        success: false,
        message: 'Error listing tables',
        error: tablesError.message
      });
    }
    
    // Try to query each table
    const tableResults = {};
    for (const table of tablesData) {
      const tableName = table.tablename;
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        tableResults[tableName] = {
          success: !error,
          count: data?.length || 0,
          error: error?.message
        };
      } catch (err) {
        tableResults[tableName] = {
          success: false,
          error: err.message
        };
      }
    }
    
    res.json({
      success: true,
      message: 'Debug information',
      tables: tablesData,
      queries: tableResults
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create test data
app.get('/api/setup', async (req, res) => {
  try {
    console.log('Setup endpoint called');
    
    // Create a test category
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .insert([{ 
        name: 'Test Category', 
        description: 'Created by setup endpoint' 
      }])
      .select();
    
    if (categoryError) {
      console.error('Error creating category:', categoryError);
      throw categoryError;
    }
    
    console.log('Category created:', categoryData);
    
    // Create a test product
    const categoryId = categoryData[0].category_id;
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert([{
        name: 'Test Product',
        description: 'Created by setup endpoint',
        price: 9.99,
        category_id: categoryId,
        active_status: true
      }])
      .select();
    
    if (productError) {
      console.error('Error creating product:', productError);
      throw productError;
    }
    
    console.log('Product created:', productData);
    
    res.json({
      success: true,
      message: 'Setup completed successfully',
      category: categoryData[0],
      product: productData[0]
    });
  } catch (error) {
    console.error('Setup endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

//For categories
// * GET http://localhost:8080/api/categories/1 (Get category by ID)
// * POST http://localhost:8080/api/categories (Create category)
// * PUT http://localhost:8080/api/categories/1 (Update category)
// * DELETE http://localhost:8080/api/categories/1 (Delete category)
// For products:
// * GET http://localhost:8080/api/products/1 (Get product by ID)
// * POST http://localhost:8080/api/products (Create product)
// * PUT http://localhost:8080/api/products/1 (Update product)
// * DELETE http://localhost:8080/api/products/1 (Delete product)

  // Server startup
  app.listen(8080, () => {
    console.log("Server start on port 8080");
    console.log("Test your backend connection at: http://localhost:8080/api/test");
    console.log("Test your Supabase connection at: http://localhost:8080/api/supabase-test");
    console.log("List your Supabase tables at: http://localhost:8080/api/supabase-tables");
  });