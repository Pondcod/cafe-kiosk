// routes/products.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// IMPORTANT: This route must come BEFORE /:id route to prevent conflicts
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`Getting products for category ID: ${categoryId}`);
    
    // First check if the category exists
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('category_id')
      .eq('category_id', categoryId);
    
    if (categoryError) {
      console.error('Error checking category:', categoryError);
      throw categoryError;
    }
    
    if (categoryData.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `Category with ID ${categoryId} not found` 
      });
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId);
    
    if (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    console.log('Getting all products');
    
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)');
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting product with ID: ${id}`);
    
    // Don't use .single() - it causes the error you're seeing
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('product_id', id);
    
    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
    
    if (data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `Product with ID ${id} not found` 
      });
    }
    
    // Return the first (and only) matching product
    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error getting product by ID:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, img_url, category_id } = req.body;
    console.log('Creating product with data:', { name, description, price, img_url, category_id });
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name is required' 
      });
    }
    
    if (!price || isNaN(parseFloat(price))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid price is required' 
      });
    }
    
    // Check if category exists if category_id is provided
    if (category_id) {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('category_id')
        .eq('category_id', category_id);
      
      if (categoryError) {
        console.error('Error checking category:', categoryError);
        throw categoryError;
      }
      
      if (categoryData.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Category with ID ${category_id} not found` 
        });
      }
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        name, 
        description: description || null, 
        price: parseFloat(price), 
        img_url: img_url || null, 
        category_id: category_id || null,
        active_status: true
      }])
      .select();
    
    if (error) {
      console.error('Supabase error creating product:', error);
      throw error;
    }
    
    console.log('Product created successfully:', data);
    res.status(201).json({ 
      success: true, 
      message: 'Product created successfully', 
      data: data[0]
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, img_url, category_id, active_status } = req.body;
    console.log(`Updating product ${id} with data:`, { name, description, price, img_url, category_id, active_status });
    
    // First check if the product exists
    const { data: existingData, error: checkError } = await supabase
      .from('products')
      .select('product_id')
      .eq('product_id', id);
    
    if (checkError) {
      console.error('Error checking product:', checkError);
      throw checkError;
    }
    
    if (existingData.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `Product with ID ${id} not found` 
      });
    }
    
    // Check if category exists if category_id is provided
    if (category_id !== undefined) {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('category_id')
        .eq('category_id', category_id);
      
      if (categoryError) {
        console.error('Error checking category:', categoryError);
        throw categoryError;
      }
      
      if (categoryData.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Category with ID ${category_id} not found` 
        });
      }
    }
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined && !isNaN(parseFloat(price))) updateData.price = parseFloat(price);
    if (img_url !== undefined) updateData.img_url = img_url;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (active_status !== undefined) updateData.active_status = active_status === true || active_status === 'true';
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('product_id', id)
      .select();
    
    if (error) {
      console.error('Supabase error updating product:', error);
      throw error;
    }
    
    console.log('Product updated successfully:', data);
    res.json({ 
      success: true, 
      message: 'Product updated successfully', 
      data: data[0]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting product with ID: ${id}`);
    
    // First check if the product exists
    const { data: existingData, error: checkError } = await supabase
      .from('products')
      .select('product_id')
      .eq('product_id', id);
    
    if (checkError) {
      console.error('Error checking product:', checkError);
      throw checkError;
    }
    
    if (existingData.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `Product with ID ${id} not found` 
      });
    }
    
    // Delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', id);
    
    if (error) {
      console.error('Supabase error deleting product:', error);
      throw error;
    }
    
    console.log('Product deleted successfully');
    res.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;