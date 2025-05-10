// server/controllers/products.js
const { supabase } = require("../config/supabase");

// Get all products
const getAllProducts = async (req, res) => {
  try {
    console.log("Getting all products");

    const { data, error } = await supabase.from("products").select(`
        *,
        categories(category_id, name)
      `);

    if (error) {
      console.error("Supabase error fetching products:", error);
      throw error;
    }

    console.log(`Retrieved ${data ? data.length : 0} products`);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting product with ID: ${id}`);

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories(category_id, name),
        productcustomizeoption(
          customization(customization_id, name, price_adjustment, customization_type, active_status)
        )
      `
      )
      .eq("product_id", id);

    if (error) {
      console.error("Supabase error fetching product:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`,
      });
    }

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error("Error getting product by ID:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`Getting products for category ID: ${categoryId}`);

    // First check if the category exists
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("category_id, name")
      .eq("category_id", categoryId);

    if (categoryError) {
      console.error("Error checking category:", categoryError);
      throw categoryError;
    }

    if (!categoryData || categoryData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${categoryId} not found`,
      });
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryId)
      .eq("active_status", true); // Only get active products

    if (error) {
      console.error("Supabase error fetching products by category:", error);
      throw error;
    }

    res.json({
      success: true,
      category: categoryData[0],
      data: data || [],
    });
  } catch (error) {
    console.error("Error getting products by category:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    // Debug the request
    console.log("Received product creation request");
    console.log("Request body:", req.body);

    const { name, description, price, img_url, category_id, active_status } =
      req.body;

    console.log("Creating product with data:", {
      name,
      description,
      price,
      img_url,
      category_id,
      active_status,
    });

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!price || isNaN(parseFloat(price))) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required",
      });
    }

    // Check if category exists if category_id is provided
    if (category_id) {
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("category_id")
        .eq("category_id", category_id);

      if (categoryError) {
        console.error("Error checking category:", categoryError);
        throw categoryError;
      }

      if (!categoryData || categoryData.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Category with ID ${category_id} not found`,
        });
      }
    }

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          description: description || null,
          price: parseFloat(price),
          img_url: img_url || null,
          category_id: category_id || null,
          active_status: active_status !== undefined ? active_status : true,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error creating product:", error);
      throw error;
    }

    console.log("Product created successfully:", data);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Debug the request
    console.log(`Updating product ${id}`);
    console.log("Request body:", req.body);

    const { name, description, price, img_url, category_id, active_status } =
      req.body;

    console.log("Update data:", {
      name,
      description,
      price,
      img_url,
      category_id,
      active_status,
    });

    // First check if the product exists
    const { data: existingData, error: checkError } = await supabase
      .from("products")
      .select("product_id")
      .eq("product_id", id);

    if (checkError) {
      console.error("Error checking product:", checkError);
      throw checkError;
    }

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`,
      });
    }

    // Check if category exists if category_id is provided
    if (category_id !== undefined && category_id !== null) {
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("category_id")
        .eq("category_id", category_id);

      if (categoryError) {
        console.error("Error checking category:", categoryError);
        throw categoryError;
      }

      if (!categoryData || categoryData.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Category with ID ${category_id} not found`,
        });
      }
    }

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined && !isNaN(parseFloat(price)))
      updateData.price = parseFloat(price);
    if (img_url !== undefined) updateData.img_url = img_url;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (active_status !== undefined) updateData.active_status = active_status;

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("product_id", id)
      .select();

    if (error) {
      console.error("Supabase error updating product:", error);
      throw error;
    }

    console.log("Product updated successfully:", data);
    res.json({
      success: true,
      message: "Product updated successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting product with ID: ${id}`);

    // First check if the product exists
    const { data: existingData, error: checkError } = await supabase
      .from("products")
      .select("product_id")
      .eq("product_id", id);

    if (checkError) {
      console.error("Error checking product:", checkError);
      throw checkError;
    }

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`,
      });
    }

    // Check if there are any orders using this product
    const { data: orderData, error: orderError } = await supabase
      .from("orderitems")
      .select("order_item_id")
      .eq("product_id", id);

    if (orderError) {
      console.error("Error checking related orders:", orderError);
      throw orderError;
    }

    if (orderData && orderData.length > 0) {
      // Instead of preventing deletion, we could set the active_status to false
      const { data, error } = await supabase
        .from("products")
        .update({ active_status: false })
        .eq("product_id", id)
        .select();

      if (error) {
        console.error("Error deactivating product:", error);
        throw error;
      }

      return res.json({
        success: true,
        message: `Product has ${orderData.length} related orders. Product was deactivated instead of deleted.`,
        data: data[0],
      });
    }

    // Delete related customization options first
    const { error: customizationError } = await supabase
      .from("productcustomizeoption")
      .delete()
      .eq("product_id", id);

    if (customizationError) {
      console.error(
        "Error deleting product customization options:",
        customizationError
      );
      throw customizationError;
    }

    // Delete the product
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("product_id", id);

    if (error) {
      console.error("Supabase error deleting product:", error);
      throw error;
    }

    console.log("Product deleted successfully");
    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
};
