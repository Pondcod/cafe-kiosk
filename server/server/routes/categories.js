const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);

// Protected routes (admin only)
router.post('/', isAuthenticated, isAdmin, categoriesController.createCategory);
router.put('/:id', isAuthenticated, isAdmin, categoriesController.updateCategory);
router.delete('/:id', isAuthenticated, isAdmin, categoriesController.deleteCategory);


// Get all categories
router.get('/', async (req, res) => {
  try {
    console.log('Getting all categories');
    
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting category with ID: ${id}`);
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('category_id', id);
    
    if (error) throw error;
    
    // Check if any data was returned
    if (data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `Category with ID ${id} not found` 
      });
    }
    
    // Return the first (and should be only) result
    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error getting category by ID:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    console.log('Creating category with data:', { name, description });
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name is required' 
      });
    }
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{ 
        name, 
        description: description || null
      }])
      .select();
    
    if (error) {
      console.error('Supabase error creating category:', error);
      throw error;
    }
    
    console.log('Category created successfully:', data);
    res.status(201).json({ 
      success: true, 
      message: 'Category created successfully', 
      data: data[0]
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    console.log(`Updating category ${id} with data:`, { name, description });
    
    // First check if the category exists
    const { data: existingData, error: checkError } = await supabase
      .from('categories')
      .select('category_id')
      .eq('category_id', id);
    
    if (checkError) {
      console.error('Error checking category:', checkError);
      throw checkError;
    }
    
    if (existingData.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `Category with ID ${id} not found` 
      });
    }
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('category_id', id)
      .select();
    
    if (error) {
      console.error('Supabase error updating category:', error);
      throw error;
    }
    
    console.log('Category updated successfully:', data);
    res.json({ 
      success: true, 
      message: 'Category updated successfully', 
      data: data[0]
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting category with ID: ${id}`);
    
    // First check if the category exists
    const { data: existingData, error: checkError } = await supabase
      .from('categories')
      .select('category_id')
      .eq('category_id', id);
    
    if (checkError) {
      console.error('Error checking category:', checkError);
      throw checkError;
    }
    
    if (existingData.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `Category with ID ${id} not found` 
      });
    }
    
    // Check if there are any products using this category
    const { data: relatedProducts, error: relatedError } = await supabase
      .from('products')
      .select('product_id')
      .eq('category_id', id);
    
    if (relatedError) {
      console.error('Error checking related products:', relatedError);
      throw relatedError;
    }
    
    if (relatedProducts.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category: ${relatedProducts.length} products are using this category` 
      });
    }
    
    // Delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('category_id', id);
    
    if (error) {
      console.error('Supabase error deleting category:', error);
      throw error;
    }
    
    console.log('Category deleted successfully');
    res.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});


module.exports = router;
