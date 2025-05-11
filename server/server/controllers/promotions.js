// controllers/promotions.js
const { supabase } = require("../config/supabase");

// Get all promotions
const getAllPromotions = async (req, res) => {
  try {
    console.log("Getting all promotions");

    const { data, error } = await supabase.from("promotiontable").select("*");

    if (error) {
      console.error("Supabase error fetching promotions:", error);
      throw error;
    }

    console.log(`Retrieved ${data ? data.length : 0} promotions`);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching promotions:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get promotion by ID
// Fixed getPromotionById function
const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting promotion with ID: ${id}`);

    // Don't use .single() which causes errors when no rows are found
    const { data, error } = await supabase
      .from("promotiontable")
      .select("*")
      .eq("promotion_id", id);

    if (error) {
      console.error("Supabase error fetching promotion:", error);
      throw error;
    }

    // Check if any data was returned
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Promotion with ID ${id} not found`,
      });
    }

    // Get associated products if any
    const { data: productData, error: productError } = await supabase
      .from("promotionproduct")
      .select(
        `
        product_id,
        products(product_id, name, price)
      `
      )
      .eq("promotion_id", id);

    if (!productError) {
      data[0].products = productData || [];
    }

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error("Error getting promotion by ID:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active promotions
const getActivePromotions = async (req, res) => {
  try {
    console.log("Getting active promotions");

    const today = new Date();
    const dayOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][today.getDay()];
    const currentDate = today.toISOString().split("T")[0]; // YYYY-MM-DD format

    const { data, error } = await supabase
      .from("promotiontable")
      .select("*")
      .eq("active_status", true)
      .or(`start_date.lte.${currentDate},start_date.is.null`)
      .or(`end_date.gte.${currentDate},end_date.is.null`);

    if (error) {
      console.error("Supabase error fetching active promotions:", error);
      throw error;
    }

    // Filter for day-specific promotions if applicable
    const filtered = data.filter((promo) => {
      // If day_of_week is null or matches today's day, include it
      return !promo.day_of_week || promo.day_of_week === dayOfWeek;
    });

    console.log(`Retrieved ${filtered.length} active promotions`);
    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error("Error fetching active promotions:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new promotion
// Create new promotion with default dates
const createPromotion = async (req, res) => {
  try {
    const {
      name,
      description,
      promotion_type,
      discount_value,
      start_date,
      end_date,
      day_of_week,
      active_status,
      product_ids,
    } = req.body;

    console.log("Creating promotion with data:", req.body);

    // Validate required fields
    if (!name || !promotion_type || !discount_value) {
      return res.status(400).json({
        success: false,
        message: "Name, promotion type, and discount value are required",
      });
    }

    // Validate promotion_type
    const validTypes = ["percentage_off", "bogo"];
    if (!validTypes.includes(promotion_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid promotion type. Must be one of: ${validTypes.join(
          ", "
        )}`,
      });
    }

    // Validate day_of_week if provided
    if (day_of_week) {
      const validDays = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      if (!validDays.includes(day_of_week.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid day of week. Must be one of: ${validDays.join(
            ", "
          )}`,
        });
      }
    }

    // Set default dates if not provided
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    const oneYearLaterDate = oneYearLater.toISOString().split("T")[0];

    // Create promotion
    const { data, error } = await supabase
      .from("promotiontable")
      .insert([
        {
          name,
          description: description || null,
          promotion_type,
          discount_value: parseFloat(discount_value),
          start_date: start_date || currentDate, // Default to today
          end_date: end_date || oneYearLaterDate, // Default to 1 year from now
          day_of_week: day_of_week ? day_of_week.toLowerCase() : null,
          active_status: active_status !== undefined ? active_status : true,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error creating promotion:", error);
      throw error;
    }

    const promotionId = data[0].promotion_id;

    // If product_ids are provided, associate them with the promotion
    if (product_ids && Array.isArray(product_ids) && product_ids.length > 0) {
      const productPromotions = product_ids.map((product_id) => ({
        promotion_id: promotionId,
        product_id,
      }));

      const { error: productError } = await supabase
        .from("promotionproduct")
        .insert(productPromotions);

      if (productError) {
        console.error(
          "Error associating products with promotion:",
          productError
        );
        // Continue despite error, just log it
      }
    }

    console.log("Promotion created successfully:", data);
    res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error creating promotion:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update promotion
const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      promotion_type,
      discount_value,
      start_date,
      end_date,
      day_of_week,
      active_status,
      product_ids,
    } = req.body;

    console.log(`Updating promotion ${id} with data:`, req.body);

    // First check if promotion exists
    const { data: existingData, error: checkError } = await supabase
      .from("promotiontable")
      .select("promotion_id")
      .eq("promotion_id", id);

    if (checkError) {
      console.error("Error checking promotion:", checkError);
      throw checkError;
    }

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Promotion with ID ${id} not found`,
      });
    }

    // Validate promotion_type if provided
    if (promotion_type) {
      const validTypes = ["percentage", "fixed_amount"];
      if (!validTypes.includes(promotion_type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid promotion type. Must be one of: ${validTypes.join(
            ", "
          )}`,
        });
      }
    }

    // Validate day_of_week if provided
    if (day_of_week) {
      const validDays = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      if (!validDays.includes(day_of_week.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid day of week. Must be one of: ${validDays.join(
            ", "
          )}`,
        });
      }
    }

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (promotion_type !== undefined)
      updateData.promotion_type = promotion_type;
    if (discount_value !== undefined)
      updateData.discount_value = parseFloat(discount_value);
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (day_of_week !== undefined)
      updateData.day_of_week = day_of_week ? day_of_week.toLowerCase() : null;
    if (active_status !== undefined) updateData.active_status = active_status;

    const { data, error } = await supabase
      .from("promotiontable")
      .update(updateData)
      .eq("promotion_id", id)
      .select();

    if (error) {
      console.error("Supabase error updating promotion:", error);
      throw error;
    }

    // Update product associations if provided
    if (product_ids && Array.isArray(product_ids)) {
      // First delete existing associations
      const { error: deleteError } = await supabase
        .from("promotionproduct")
        .delete()
        .eq("promotion_id", id);

      if (deleteError) {
        console.error(
          "Error deleting existing product associations:",
          deleteError
        );
        // Continue despite error
      }

      // Then add new associations if there are any products
      if (product_ids.length > 0) {
        const productPromotions = product_ids.map((product_id) => ({
          promotion_id: id,
          product_id,
        }));

        const { error: insertError } = await supabase
          .from("promotionproduct")
          .insert(productPromotions);

        if (insertError) {
          console.error(
            "Error associating products with promotion:",
            insertError
          );
          // Continue despite error
        }
      }
    }

    console.log("Promotion updated successfully:", data);
    res.json({
      success: true,
      message: "Promotion updated successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error updating promotion:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete promotion
const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting promotion with ID: ${id}`);

    // First check if promotion exists
    const { data: existingData, error: checkError } = await supabase
      .from("promotiontable")
      .select("promotion_id")
      .eq("promotion_id", id);

    if (checkError) {
      console.error("Error checking promotion:", checkError);
      throw checkError;
    }

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Promotion with ID ${id} not found`,
      });
    }

    // Check if promotion is used in any orders
    const { data: orderData, error: orderError } = await supabase
      .from("orderpromotion")
      .select("promotion_id")
      .eq("promotion_id", id);

    if (!orderError && orderData && orderData.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete promotion: it is used in ${orderData.length} orders`,
      });
    }

    // Delete product associations first
    const { error: productError } = await supabase
      .from("promotionproduct")
      .delete()
      .eq("promotion_id", id);

    if (productError) {
      console.error(
        "Error deleting promotion product associations:",
        productError
      );
      // Continue despite error
    }

    // Delete the promotion
    const { error } = await supabase
      .from("promotiontable")
      .delete()
      .eq("promotion_id", id);

    if (error) {
      console.error("Supabase error deleting promotion:", error);
      throw error;
    }

    console.log("Promotion deleted successfully");
    res.json({
      success: true,
      message: "Promotion deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add product to promotion
const addProductToPromotion = async (req, res) => {
  try {
    const { promotion_id, product_id } = req.body;
    console.log(`Adding product ${product_id} to promotion ${promotion_id}`);

    // Validate required fields
    if (!promotion_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: "Promotion ID and product ID are required",
      });
    }

    // Check if promotion exists
    const { data: promotionData, error: promotionError } = await supabase
      .from("promotiontable")
      .select("promotion_id")
      .eq("promotion_id", promotion_id);

    if (promotionError) {
      console.error("Error checking promotion:", promotionError);
      throw promotionError;
    }

    if (!promotionData || promotionData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Promotion with ID ${promotion_id} not found`,
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

    // Check if association already exists
    const { data: existingData, error: checkError } = await supabase
      .from("promotionproduct")
      .select("*")
      .eq("promotion_id", promotion_id)
      .eq("product_id", product_id);

    if (checkError) {
      console.error("Error checking existing association:", checkError);
      throw checkError;
    }

    if (existingData && existingData.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This product is already associated with this promotion",
      });
    }

    // Create association
    const { data, error } = await supabase
      .from("promotionproduct")
      .insert([
        {
          promotion_id,
          product_id,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error adding product to promotion:", error);
      throw error;
    }

    console.log("Product added to promotion successfully:", data);
    res.status(201).json({
      success: true,
      message: "Product added to promotion successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error adding product to promotion:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove product from promotion
const removeProductFromPromotion = async (req, res) => {
  try {
    const { promotion_id, product_id } = req.params;
    console.log(
      `Removing product ${product_id} from promotion ${promotion_id}`
    );

    // Check if association exists
    const { data: existingData, error: checkError } = await supabase
      .from("promotionproduct")
      .select("*")
      .eq("promotion_id", promotion_id)
      .eq("product_id", product_id);

    if (checkError) {
      console.error("Error checking existing association:", checkError);
      throw checkError;
    }

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "This product is not associated with this promotion",
      });
    }

    // Delete association
    const { error } = await supabase
      .from("promotionproduct")
      .delete()
      .eq("promotion_id", promotion_id)
      .eq("product_id", product_id);

    if (error) {
      console.error("Supabase error removing product from promotion:", error);
      throw error;
    }

    console.log("Product removed from promotion successfully");
    res.json({
      success: true,
      message: "Product removed from promotion successfully",
    });
  } catch (error) {
    console.error("Error removing product from promotion:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllPromotions,
  getPromotionById,
  getActivePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  addProductToPromotion,
  removeProductFromPromotion,
};
