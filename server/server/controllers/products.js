// server/controllers/products.js
const { supabase } = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");

const handleImageUpload = async (imageFile, productId) => {
  if (!imageFile) return null;

  try {
    console.log("Handling image upload:", imageFile.name);

    // Create a unique file name
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${productId || uuidv4()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile.data, {
        cacheControl: "3600",
        upsert: true,
        contentType: imageFile.mimetype,
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    // UPDATED: Get the public URL - the syntax might have changed
    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    const publicURL = publicUrlData.publicUrl;  // Note: might be publicUrl (lowercase u) in newer versions

    console.log("Image uploaded successfully, URL:", publicURL);
    return publicURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

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

// Create new product - UPDATED WITH IMAGE UPLOAD
const createProduct = async (req, res) => {
  try {
    // Debug the request
    console.log("Received product creation request");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const { name, description, price, category_id, active_status } = req.body;

    // Get image file from request if using express-fileupload
    const imageFile = req.files?.image;

    console.log("Creating product with data:", {
      name,
      description,
      price,
      category_id,
      active_status,
      hasImage: !!imageFile,
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

    // Create product without image URL first
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          description: description || null,
          price: parseFloat(price),
          img_url: null, // We'll update this after upload if needed
          category_id: category_id || null,
          active_status: active_status !== undefined ? active_status : true,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error creating product:", error);
      throw error;
    }

    // If we have an image, upload it and update the product
    if (imageFile) {
      const productId = data[0].product_id;
      console.log(`Uploading image for product ID: ${productId}`);

      const imageUrl = await handleImageUpload(imageFile, productId);

      if (imageUrl) {
        console.log(`Image uploaded successfully: ${imageUrl}`);
        // Update product with image URL
        const { data: updatedProduct, error: updateError } = await supabase
          .from("products")
          .update({ img_url: imageUrl })
          .eq("product_id", productId)
          .select();

        if (updateError) {
          console.error("Error updating product with image URL:", updateError);
          throw updateError;
        }

        console.log("Product updated with image URL");
        return res.status(201).json({
          success: true,
          message: "Product created with image",
          data: updatedProduct[0],
        });
      }
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

// Update product - UPDATED WITH IMAGE UPLOAD
// In controllers/products.js - updateProduct function
// Update just this part of your updateProduct function
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Enhanced debugging
    console.log(`Updating product ${id}`);
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    // Create empty updateData object
    const updateData = {};
    
    // Check if price is provided in the form data
    if (req.body && req.body.price) {
      updateData.price = parseFloat(req.body.price);
    }
    
    // Get the image file
    const imageFile = req.files?.img_url || req.files?.image;
    
    // Check if we have an image to upload
    if (imageFile) {
      console.log(`Uploading new image for product ID: ${id}`);
      const imageUrl = await handleImageUpload(imageFile, id);
      
      if (imageUrl) {
        console.log(`New image uploaded: ${imageUrl}`);
        updateData.img_url = imageUrl;
      }
    }
    
    // Skip all the other processing and just update with what we have
    if (Object.keys(updateData).length > 0) {
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
        data: data[0]
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No data provided for update"
      });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product - UPDATED TO HANDLE IMAGE DELETION
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting product with ID: ${id}`);

    // First check if the product exists and get img_url
    const { data: existingData, error: checkError } = await supabase
      .from("products")
      .select("product_id, img_url")
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

    // Delete product image from storage if it exists
    if (existingData[0].img_url) {
      try {
        // Extract the path from the URL
        const urlParts = existingData[0].img_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `products/${fileName}`;

        await supabase.storage.from("product-images").remove([filePath]);

        console.log(`Product image deleted: ${filePath}`);
      } catch (deleteError) {
        console.error("Error deleting product image:", deleteError);
        // Continue despite error - not critical for product deletion
      }
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
