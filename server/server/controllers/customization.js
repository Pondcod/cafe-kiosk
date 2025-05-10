// controllers/customization.js
const { supabase } = require("../config/supabase");

// Get all customizations
const getAllCustomizations = async (req, res) => {
  try {
    console.log("Getting all customizations");

    const { data, error } = await supabase.from("customization").select("*");

    if (error) {
      console.error("Supabase error fetching customizations:", error);
      throw error;
    }

    console.log(`Retrieved ${data ? data.length : 0} customizations`);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching customizations:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get customization by ID
const getCustomizationById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting customization with ID: ${id}`);

    const { data, error } = await supabase
      .from("customization")
      .select("*")
      .eq("customization_id", id);

    if (error) {
      console.error("Supabase error fetching customization:", error);
      throw error;
    }

    // Check if any data was returned
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Customization with ID ${id} not found`,
      });
    }

    // Get products that have this customization
    const { data: productData, error: productError } = await supabase
      .from("productcustomizeoption")
      .select(
        `
        products(product_id, name, price, img_url)
      `
      )
      .eq("customization_id", id);

    if (productError) {
      console.error("Error fetching related products:", productError);
    }

    // Extract products from nested structure
    const products = productData
      ? productData.map((item) => item.products)
      : [];

    // Combine customization data with related products
    const responseData = {
      ...data[0],
      products,
    };

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error getting customization by ID:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get customizations by type
const getCustomizationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    console.log(`Getting customizations of type: ${type}`);

    const { data, error } = await supabase
      .from("customization")
      .select("*")
      .eq("customization_type", type);

    if (error) {
      console.error("Supabase error fetching customizations by type:", error);
      throw error;
    }

    console.log(
      `Retrieved ${data ? data.length : 0} customizations of type ${type}`
    );
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error getting customizations by type:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get customizations by product ID
const getCustomizationsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`Getting customizations for product ID: ${productId}`);

    // First check if the product exists
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("product_id, name")
      .eq("product_id", productId);

    if (productError) {
      console.error("Error checking product:", productError);
      throw productError;
    }

    if (!productData || productData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productId} not found`,
      });
    }

    // Get customization options for this product
    const { data, error } = await supabase
      .from("productcustomizeoption")
      .select(
        `
        customization(*)
      `
      )
      .eq("product_id", productId);

    if (error) {
      console.error(
        "Supabase error fetching customizations for product:",
        error
      );
      throw error;
    }

    // Extract customizations from nested structure
    const customizations = data ? data.map((item) => item.customization) : [];

    res.json({
      success: true,
      product: productData[0],
      data: customizations,
    });
  } catch (error) {
    console.error("Error getting customizations by product ID:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new customization
const createCustomization = async (req, res) => {
  try {
    const { name, price_adjustment, customization_type } = req.body;
    console.log("Creating customization with data:", {
      name,
      price_adjustment,
      customization_type,
    });

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!customization_type) {
      return res.status(400).json({
        success: false,
        message: "Customization type is required",
      });
    }

    const { data, error } = await supabase
      .from("customization")
      .insert([
        {
          name,
          price_adjustment: price_adjustment || 0,
          customization_type,
          active_status: true,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error creating customization:", error);
      throw error;
    }

    console.log("Customization created successfully:", data);
    res.status(201).json({
      success: true,
      message: "Customization created successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error creating customization:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update customization
const updateCustomization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price_adjustment, customization_type, active_status } =
      req.body;
    console.log(`Updating customization ${id} with data:`, {
      name,
      price_adjustment,
      customization_type,
      active_status,
    });

    // First check if the customization exists
    const { data: existingData, error: checkError } = await supabase
      .from("customization")
      .select("customization_id")
      .eq("customization_id", id);

    if (checkError) {
      console.error("Error checking customization:", checkError);
      throw checkError;
    }

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Customization with ID ${id} not found`,
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price_adjustment !== undefined)
      updateData.price_adjustment = price_adjustment;
    if (customization_type !== undefined)
      updateData.customization_type = customization_type;
    if (active_status !== undefined) updateData.active_status = active_status;

    const { data, error } = await supabase
      .from("customization")
      .update(updateData)
      .eq("customization_id", id)
      .select();

    if (error) {
      console.error("Supabase error updating customization:", error);
      throw error;
    }

    console.log("Customization updated successfully:", data);
    res.json({
      success: true,
      message: "Customization updated successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error updating customization:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete customization
const deleteCustomization = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting customization with ID: ${id}`);

    // First check if the customization exists
    const { data: existingData, error: checkError } = await supabase
      .from("customization")
      .select("customization_id")
      .eq("customization_id", id);

    if (checkError) {
      console.error("Error checking customization:", checkError);
      throw checkError;
    }

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Customization with ID ${id} not found`,
      });
    }

    // Check if the customization is used in any product
    const { data: productData, error: productError } = await supabase
      .from("productcustomizeoption")
      .select("pco_id")
      .eq("customization_id", id);

    if (productError) {
      console.error("Error checking related products:", productError);
      throw productError;
    }

    if (productData && productData.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customization: it is used by ${productData.length} products`,
      });
    }

    // Check if the customization is used in any order
    const { data: orderData, error: orderError } = await supabase
      .from("ordercustomization")
      .select("oc_id")
      .eq("customization_id", id);

    if (orderError) {
      console.error("Error checking related orders:", orderError);
      throw orderError;
    }

    if (orderData && orderData.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customization: it is used in ${orderData.length} orders`,
      });
    }

    // Delete the customization
    const { error } = await supabase
      .from("customization")
      .delete()
      .eq("customization_id", id);

    if (error) {
      console.error("Supabase error deleting customization:", error);
      throw error;
    }

    console.log("Customization deleted successfully");
    res.json({
      success: true,
      message: "Customization deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customization:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add customization to product
const addCustomizationToProduct = async (req, res) => {
  try {
    const { product_id, customization_id } = req.body;
    console.log(
      `Adding customization ${customization_id} to product ${product_id}`
    );

    // Validate required fields
    if (!product_id || !customization_id) {
      return res.status(400).json({
        success: false,
        message: "Product ID and customization ID are required",
      });
    }

    // Check if product exists
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("product_id")
      .eq("product_id", product_id);

    if (productError) {
      console.error("Error checking product:", productError);
      throw productError;
    }

    if (!productData || productData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${product_id} not found`,
      });
    }

    // Check if customization exists
    const { data: customizationData, error: customizationError } =
      await supabase
        .from("customization")
        .select("customization_id")
        .eq("customization_id", customization_id);

    if (customizationError) {
      console.error("Error checking customization:", customizationError);
      throw customizationError;
    }

    if (!customizationData || customizationData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Customization with ID ${customization_id} not found`,
      });
    }

    // Check if the association already exists
    const { data: existingData, error: checkError } = await supabase
      .from("productcustomizeoption")
      .select("pco_id")
      .eq("product_id", product_id)
      .eq("customization_id", customization_id);

    if (checkError) {
      console.error("Error checking existing association:", checkError);
      throw checkError;
    }

    if (existingData && existingData.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This customization is already added to the product",
      });
    }

    // Create the association
    const { data, error } = await supabase
      .from("productcustomizeoption")
      .insert([
        {
          product_id,
          customization_id,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error adding customization to product:", error);
      throw error;
    }

    console.log("Customization added to product successfully:", data);
    res.status(201).json({
      success: true,
      message: "Customization added to product successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error adding customization to product:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove customization from product
const removeCustomizationFromProduct = async (req, res) => {
  try {
    const { product_id, customization_id } = req.params;
    console.log(
      `Removing customization ${customization_id} from product ${product_id}`
    );

    // Check if the association exists
    const { data: existingData, error: checkError } = await supabase
      .from("productcustomizeoption")
      .select("pco_id")
      .eq("product_id", product_id)
      .eq("customization_id", customization_id);

    if (checkError) {
      console.error("Error checking existing association:", checkError);
      throw checkError;
    }

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "This customization is not associated with the product",
      });
    }

    // Delete the association
    const { error } = await supabase
      .from("productcustomizeoption")
      .delete()
      .eq("product_id", product_id)
      .eq("customization_id", customization_id);

    if (error) {
      console.error(
        "Supabase error removing customization from product:",
        error
      );
      throw error;
    }

    console.log("Customization removed from product successfully");
    res.json({
      success: true,
      message: "Customization removed from product successfully",
    });
  } catch (error) {
    console.error("Error removing customization from product:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllCustomizations,
  getCustomizationById,
  getCustomizationsByType,
  getCustomizationsByProduct,
  createCustomization,
  updateCustomization,
  deleteCustomization,
  addCustomizationToProduct,
  removeCustomizationFromProduct,
};
