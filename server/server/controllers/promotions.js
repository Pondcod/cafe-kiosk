// controllers/promotions.js
const { supabase } = require("../config/supabase");

// Get all promotions
const getAllPromotions = async (req, res) => {
  try {
    console.log("Getting all promotions");

    const { data, error } = await supabase.from("promotiontable").select(`
        *,
        promotionproduct(
          products(product_id, name, price, category_id, categories(name))
        )
      `);

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
const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting promotion with ID: ${id}`);

    const { data, error } = await supabase
      .from("promotiontable")
      .select(
        `
        *,
        promotionproduct(
          products(product_id, name, price, category_id, categories(name))
        )
      `
      )
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

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error("Error getting promotion by ID:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get active promotions for current day
const getActivePromotions = async (req, res) => {
  try {
    console.log("Getting active promotions for today");

    // Get current date and day of week
    const today = new Date();
    const currentDate = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const daysOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const currentDay = daysOfWeek[today.getDay()];

    console.log(`Current date: ${currentDate}, Current day: ${currentDay}`);

    // Get promotions that are active today
    const { data, error } = await supabase
      .from("promotiontable")
      .select(
        `
        *,
        promotionproduct(
          products(product_id, name, price, category_id, categories(name))
        )
      `
      )
      .lte("start_date", currentDate) // Start date is before or equal to today
      .gte("end_date", currentDate) // End date is after or equal to today
      .eq("is_active", true); // Promotion is active

    if (error) {
      console.error("Supabase error fetching active promotions:", error);
      throw error;
    }

    // Filter promotions by day of week (if specified)
    const daySpecificPromotions = data.filter((promotion) => {
      // If day_of_week is null or empty, promotion applies to all days
      if (!promotion.day_of_week) return true;

      // Check if the current day is included in the promotion's day_of_week
      return promotion.day_of_week.toLowerCase().includes(currentDay);
    });

    console.log(
      `Retrieved ${daySpecificPromotions.length} active promotions for today`
    );
    res.json({
      success: true,
      currentDate,
      currentDay,
      data: daySpecificPromotions,
    });
  } catch (error) {
    console.error("Error fetching active promotions:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new promotion
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
      product_ids, // Array of product IDs this promotion applies to
    } = req.body;

    console.log("Creating promotion with data:", {
      name,
      promotion_type,
      discount_value,
      start_date,
      end_date,
      day_of_week,
      product_ids,
    });

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!promotion_type || promotion_type !== "percentage_off") {
      return res.status(400).json({
        success: false,
        message: "Promotion type must be percentage_off",
      });
    }

    if (!discount_value || isNaN(parseFloat(discount_value))) {
      return res.status(400).json({
        success: false,
        message: "Valid discount value is required",
      });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    // Validate product IDs if provided
    if (
      product_ids &&
      (!Array.isArray(product_ids) || product_ids.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Product IDs must be a non-empty array",
      });
    }

    // Format day_of_week as a comma-separated string if it's an array
    let formattedDaysOfWeek = day_of_week;
    if (Array.isArray(day_of_week)) {
      formattedDaysOfWeek = day_of_week.join(",");
    }

    // Create the promotion
    const { data: promotionData, error: promotionError } = await supabase
      .from("promotiontable")
      .insert([
        {
          name,
          description: description || null,
          promotion_type,
          discount_value: parseFloat(discount_value),
          start_date,
          end_date,
          day_of_week: formattedDaysOfWeek,
          is_active: true,
        },
      ])
      .select();

    if (promotionError) {
      console.error("Supabase error creating promotion:", promotionError);
      throw promotionError;
    }

    const newPromotion = promotionData[0];
    console.log("Promotion created:", newPromotion);

    // If product IDs were provided, create promotion-product associations
    if (product_ids && product_ids.length > 0) {
      const promotionProductData = product_ids.map((product_id) => ({
        promotion_id: newPromotion.promotion_id,
        product_id,
      }));

      const { error: associationError } = await supabase
        .from("promotionproduct")
        .insert(promotionProductData);

      if (associationError) {
        console.error(
          "Error associating products with promotion:",
          associationError
        );

        // Even if association fails, we still created the promotion
        return res.status(201).json({
          success: true,
          message: "Promotion created but product associations failed",
          data: newPromotion,
          associationError: associationError.message,
        });
      }
    }

    // Get the full promotion data with associated products
    const { data: fullPromotionData, error: fullPromotionError } =
      await supabase
        .from("promotiontable")
        .select(
          `
        *,
        promotionproduct(
          products(product_id, name)
        )
      `
        )
        .eq("promotion_id", newPromotion.promotion_id)
        .single();

    if (fullPromotionError) {
      console.error("Error fetching full promotion data:", fullPromotionError);
      // Still return success as the promotion was created
      return res.status(201).json({
        success: true,
        message: "Promotion created successfully",
        data: newPromotion,
      });
    }

    res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      data: fullPromotionData,
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
      is_active,
      product_ids, // Array of product IDs this promotion applies to
    } = req.body;

    console.log(`Updating promotion ${id} with data:`, {
      name,
      promotion_type,
      discount_value,
      start_date,
      end_date,
      day_of_week,
      is_active,
      product_ids,
    });

    // First check if the promotion exists
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

    // Format day_of_week as a comma-separated string if it's an array
    let formattedDaysOfWeek = day_of_week;
    if (Array.isArray(day_of_week)) {
      formattedDaysOfWeek = day_of_week.join(",");
    }

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (promotion_type !== undefined)
      updateData.promotion_type = promotion_type;
    if (discount_value !== undefined && !isNaN(parseFloat(discount_value)))
      updateData.discount_value = parseFloat(discount_value);
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (formattedDaysOfWeek !== undefined)
      updateData.day_of_week = formattedDaysOfWeek;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update the promotion
    const { data: updatedPromotion, error: updateError } = await supabase
      .from("promotiontable")
      .update(updateData)
      .eq("promotion_id", id)
      .select();

    if (updateError) {
      console.error("Supabase error updating promotion:", updateError);
      throw updateError;
    }

    // If product IDs were provided, update the product associations
    if (product_ids !== undefined) {
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

        // Even if association update fails, we still updated the promotion
        return res.status(200).json({
          success: true,
          message: "Promotion updated but product associations update failed",
          data: updatedPromotion[0],
          associationError: deleteError.message,
        });
      }

      // Then add new associations if there are product IDs
      if (Array.isArray(product_ids) && product_ids.length > 0) {
        const promotionProductData = product_ids.map((product_id) => ({
          promotion_id: id,
          product_id,
        }));

        const { error: insertError } = await supabase
          .from("promotionproduct")
          .insert(promotionProductData);

        if (insertError) {
          console.error(
            "Error creating new product associations:",
            insertError
          );

          return res.status(200).json({
            success: true,
            message: "Promotion updated but new product associations failed",
            data: updatedPromotion[0],
            associationError: insertError.message,
          });
        }
      }
    }

    // Get the full updated promotion data with associated products
    const { data: fullPromotionData, error: fullPromotionError } =
      await supabase
        .from("promotiontable")
        .select(
          `
        *,
        promotionproduct(
          products(product_id, name)
        )
      `
        )
        .eq("promotion_id", id)
        .single();

    if (fullPromotionError) {
      console.error(
        "Error fetching full updated promotion data:",
        fullPromotionError
      );
      // Still return success as the promotion was updated
      return res.status(200).json({
        success: true,
        message: "Promotion updated successfully",
        data: updatedPromotion[0],
      });
    }

    console.log("Promotion updated successfully:", fullPromotionData);
    res.json({
      success: true,
      message: "Promotion updated successfully",
      data: fullPromotionData,
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

    // First check if the promotion exists
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

    // First delete associated product records
    const { error: productError } = await supabase
      .from("promotionproduct")
      .delete()
      .eq("promotion_id", id);

    if (productError) {
      console.error("Error deleting promotion products:", productError);
      throw productError;
    }

    // Then delete the promotion
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

// Apply promotions to cart items
const applyPromotionsToCart = async (req, res) => {
  try {
    const { cart_items } = req.body; // Array of {product_id, quantity, customizations}

    if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Valid cart items are required",
      });
    }

    // Get current date and day of week
    const today = new Date();
    const currentDate = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const daysOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const currentDay = daysOfWeek[today.getDay()];

    console.log(
      `Applying promotions for date: ${currentDate}, day: ${currentDay}`
    );

    // Get active promotions for today
    const { data: promotions, error: promotionsError } = await supabase
      .from("promotiontable")
      .select(
        `
        *,
        promotionproduct(product_id)
      `
      )
      .lte("start_date", currentDate) // Start date is before or equal to today
      .gte("end_date", currentDate) // End date is after or equal to today
      .eq("is_active", true) // Promotion is active
      .eq("promotion_type", "percentage_off"); // Only percentage off promotions

    if (promotionsError) {
      console.error("Error fetching active promotions:", promotionsError);
      throw promotionsError;
    }

    // Filter promotions by day of week
    const applicablePromotions = promotions.filter((promotion) => {
      // If day_of_week is null or empty, promotion applies to all days
      if (!promotion.day_of_week) return true;

      // Check if the current day is included in the promotion's day_of_week
      return promotion.day_of_week.toLowerCase().includes(currentDay);
    });

    if (applicablePromotions.length === 0) {
      return res.json({
        success: true,
        message: "No applicable promotions found for today",
        data: {
          cart_items: cart_items,
          applied_promotions: [],
          total_discount: 0,
        },
      });
    }

    // Get details for all products in the cart
    const productIds = cart_items.map((item) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(
        "product_id, name, price, category_id, categories(category_id, name)"
      )
      .in("product_id", productIds);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      throw productsError;
    }

    // Create a map of product details for easy lookup
    const productMap = {};
    products.forEach((product) => {
      productMap[product.product_id] = product;
    });

    // Apply promotions to each cart item
    let totalDiscount = 0;
    const appliedPromotions = [];
    const cartWithDiscounts = cart_items.map((item) => {
      const product = productMap[item.product_id];
      if (!product) return item; // Skip if product not found

      let itemDiscount = 0;
      let appliedPromotion = null;

      // Find applicable promotions for this product
      for (const promotion of applicablePromotions) {
        // Check if this promotion applies to this product
        const productMatches = promotion.promotionproduct.some(
          (pp) => pp.product_id === item.product_id
        );

        if (productMatches) {
          // Calculate discount for this item
          const discountAmount =
            (product.price * promotion.discount_value) / 100;
          itemDiscount = Math.max(itemDiscount, discountAmount); // Take the largest discount

          if (
            !appliedPromotion ||
            appliedPromotion.discount_value < promotion.discount_value
          ) {
            appliedPromotion = promotion;
          }
        }
      }

      // If a promotion was applied, track it
      if (appliedPromotion && itemDiscount > 0) {
        const discountForAllUnits = itemDiscount * item.quantity;
        totalDiscount += discountForAllUnits;

        // Check if this promotion is already in the list
        const existingPromo = appliedPromotions.find(
          (p) => p.promotion_id === appliedPromotion.promotion_id
        );
        if (existingPromo) {
          existingPromo.discount_amount += discountForAllUnits;
          existingPromo.applied_to.push({
            product_id: product.product_id,
            product_name: product.name,
            discount_per_unit: itemDiscount,
            quantity: item.quantity,
            total_discount: discountForAllUnits,
          });
        } else {
          appliedPromotions.push({
            promotion_id: appliedPromotion.promotion_id,
            name: appliedPromotion.name,
            discount_value: appliedPromotion.discount_value,
            discount_amount: discountForAllUnits,
            applied_to: [
              {
                product_id: product.product_id,
                product_name: product.name,
                discount_per_unit: itemDiscount,
                quantity: item.quantity,
                total_discount: discountForAllUnits,
              },
            ],
          });
        }
      }

      // Return item with discount info
      return {
        ...item,
        original_price: product.price,
        discounted_price: Math.max(0, product.price - itemDiscount),
        discount_amount: itemDiscount,
        discount_percentage:
          itemDiscount > 0 ? appliedPromotion.discount_value : 0,
      };
    });

    // Return the cart with applied discounts
    res.json({
      success: true,
      message: `Applied ${appliedPromotions.length} promotions to the cart`,
      data: {
        cart_items: cartWithDiscounts,
        applied_promotions: appliedPromotions,
        total_discount: totalDiscount,
      },
    });
  } catch (error) {
    console.error("Error applying promotions to cart:", error);
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
  applyPromotionsToCart,
};
