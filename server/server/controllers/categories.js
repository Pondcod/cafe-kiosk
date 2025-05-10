// controllers/categories.js - FIXED with lowercase table names
const { supabase } = require("../config/supabase");

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categories") // LOWERCASE table name
      .select("*");

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("categories") // LOWERCASE table name
      .select("*")
      .eq("category_id", id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const { data, error } = await supabase
      .from("categories") // LOWERCASE table name
      .insert([{ name, description }])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const { data, error } = await supabase
      .from("categories") // LOWERCASE table name
      .update({ name, description })
      .eq("category_id", id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      message: "Category updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("categories") // LOWERCASE table name
      .delete()
      .eq("category_id", id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
