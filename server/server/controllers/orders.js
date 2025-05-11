// controllers/orders.js
const { supabase } = require("../config/supabase");

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    console.log("Getting all orders");

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        orderitems(
          *,
          products(name, price),
          ordercustomization(
            *,
            customization(name, price_adjustment)
          )
        )
      `
      )
      .order("order_date", { ascending: false });

    if (error) {
      console.error("Supabase error fetching orders:", error);
      throw error;
    }

    console.log(`Retrieved ${data ? data.length : 0} orders`);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get order by ID - THIS IS THE FIXED FUNCTION
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting order with ID: ${id}`);

    // Fetch the main order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", id)
      .single();

    if (orderError) {
      console.error("Supabase error fetching order:", orderError);
      throw orderError;
    }

    if (!orderData) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${id} not found`,
      });
    }

    // Fetch order items with products
    const { data: orderItems, error: itemsError } = await supabase
      .from("orderitems")
      .select(
        `
        *,
        products(name, price, img_url)
      `
      )
      .eq("order_id", id);

    if (itemsError) {
      console.error("Supabase error fetching order items:", itemsError);
      // Continue even if there's an error
    }

    // Fetch order customizations
    const { data: customizations, error: customError } = await supabase
      .from("ordercustomization")
      .select(
        `
        *,
        customization(name, price_adjustment, customization_type)
      `
      )
      .eq("order_id", id);

    if (customError) {
      console.error("Supabase error fetching customizations:", customError);
      // Continue even if there's an error
    }

    // Map customizations to their respective order items
    const itemsWithCustomizations = (orderItems || []).map((item) => {
      const itemCustomizations = (customizations || []).filter(
        (c) => c.order_item_id === item.order_item_id
      );
      return {
        ...item,
        ordercustomization: itemCustomizations,
      };
    });

    // Build the response object
    const orderResponse = {
      ...orderData,
      orderitems: itemsWithCustomizations,
    };

    // Try to fetch payment transactions
    try {
      const { data: payments } = await supabase
        .from("paymenttransaction")
        .select("*")
        .eq("order_id", id);

      orderResponse.paymenttransaction = payments || [];
    } catch (error) {
      console.error("Error fetching payment transactions:", error);
      orderResponse.paymenttransaction = [];
    }

    // Try to fetch promotions - WITHOUT using the nested select that's causing issues
    try {
      const { data: promotions } = await supabase
        .from("orderpromotion")
        .select("*")
        .eq("order_id", id);

      // If we have promotions, try to get their details separately
      if (promotions && promotions.length > 0) {
        const promotionDetails = [];

        for (const promo of promotions) {
          try {
            const { data: details } = await supabase
              .from("promotiontable")
              .select("name, promotion_type, discount_value")
              .eq("promotion_id", promo.promotion_id)
              .single();

            promotionDetails.push({
              ...promo,
              promotion_details: details,
            });
          } catch (detailError) {
            console.error("Error fetching promotion details:", detailError);
            promotionDetails.push(promo);
          }
        }

        orderResponse.orderpromotion = promotionDetails;
      } else {
        orderResponse.orderpromotion = [];
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      orderResponse.orderpromotion = [];
    }

    res.json({ success: true, data: orderResponse });
  } catch (error) {
    console.error("Error getting order by ID:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new order - Adjusted for correct column names
const createOrder = async (req, res) => {
  try {
    console.log("Creating order with data:", req.body);

    // Extract data from request body
    let order_items = req.body.order_items || req.body.orderitems || [];
    const payment_method = req.body.payment_method;

    // Validate required fields
    if (
      !order_items ||
      !Array.isArray(order_items) ||
      order_items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Order items are required as an array",
      });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of order_items) {
      subtotal += parseFloat(item.subtotal || item.sub_total || 0);
    }

    const discount = 0;
    const finalTotal = subtotal - discount;

    // Create the order
    console.log("Creating order with calculated values:", {
      subtotal,
      discount,
      finalTotal,
    });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          order_date: new Date().toISOString(),
          total_amount: finalTotal,
          payment_complete: false,
          sub_total: subtotal,
          discount_total: discount,
          final_total: finalTotal,
          order_status: "pending",
        },
      ])
      .select();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw orderError;
    }

    if (!order || order.length === 0) {
      throw new Error("Failed to create order: No data returned");
    }

    const orderId = order[0].order_id;
    console.log("Created order with ID:", orderId);

    // Inspect the orderitems table structure first
    try {
      const { data: tableInfo, error: tableError } = await supabase.rpc(
        "describe_table",
        { table_name: "orderitems" }
      );

      if (!tableError && tableInfo) {
        console.log("orderitems table structure:", tableInfo);
      }
    } catch (e) {
      console.log("Could not get table structure:", e);
    }

    // Create order items - using sub_total instead of subtotal based on error message
    const orderItemsData = order_items.map((item) => ({
      order_id: orderId,
      product_id: parseInt(item.product_id),
      quantity: parseInt(item.quantity),
      sub_total: parseFloat(item.subtotal || item.sub_total || 0), // Changed from subtotal to sub_total
    }));

    console.log("Creating order items:", orderItemsData);

    const { data: createdItems, error: itemsError } = await supabase
      .from("orderitems")
      .insert(orderItemsData)
      .select();

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      throw itemsError;
    }

    // Add customizations if any
    for (const item of order_items) {
      if (
        item.customizations &&
        Array.isArray(item.customizations) &&
        item.customizations.length > 0
      ) {
        // Find the corresponding created item to get the order_item_id
        const createdItem = createdItems.find(
          (ci) => ci.product_id === parseInt(item.product_id)
        );

        if (createdItem) {
          const customizationsData = item.customizations.map((cust) => ({
            order_item_id: createdItem.order_item_id,
            order_id: orderId,
            customization_id: parseInt(cust.customization_id),
          }));

          const { error: customError } = await supabase
            .from("ordercustomization")
            .insert(customizationsData);

          if (customError) {
            console.error("Error adding customizations:", customError);
          }
        }
      }
    }

    // NEW: Apply automatic promotions to the order
    try {
      await applyPromotionsToOrder(
        { params: { id: orderId } },
        {
          json: (data) => {
            console.log("Automatic promotions applied:", data);
          },
          status: () => ({ json: () => {} }),
        }
      );
    } catch (promoError) {
      console.error("Error applying automatic promotions:", promoError);
      // Continue despite errors
    }

    // If payment method was provided, create a payment transaction
    if (payment_method) {
      try {
        const { data: paymentData, error: paymentError } = await supabase
          .from("paymenttransaction")
          .insert([
            {
              order_id: orderId,
              amount: finalTotal,
              payment_method,
              status: "pending",
              timestamp: new Date().toISOString(),
            },
          ])
          .select();

        if (paymentError) {
          console.error("Error creating payment record:", paymentError);
        } else {
          console.log("Created payment record:", paymentData);
        }
      } catch (paymentError) {
        console.error("Exception creating payment record:", paymentError);
      }
    }

    // Fetch the complete order
    const { data: orderData, error: fetchOrderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (fetchOrderError) {
      console.error("Error fetching created order:", fetchOrderError);
      throw fetchOrderError;
    }

    // Fetch order items with products
    const { data: orderItems, error: fetchItemsError } = await supabase
      .from("orderitems")
      .select(
        `
        *,
        products(name, price, img_url)
      `
      )
      .eq("order_id", orderId);

    if (fetchItemsError) {
      console.error("Error fetching order items:", fetchItemsError);
    }

    // Fetch order customizations
    const { data: customizations, error: customError } = await supabase
      .from("ordercustomization")
      .select(
        `
        *,
        customization(name, price_adjustment, customization_type)
      `
      )
      .eq("order_id", orderId);

    if (customError) {
      console.error("Supabase error fetching customizations:", customError);
    }

    // Map customizations to their respective order items
    const itemsWithCustomizations = (orderItems || []).map((item) => {
      const itemCustomizations = (customizations || []).filter(
        (c) => c.order_item_id === item.order_item_id
      );
      return {
        ...item,
        ordercustomization: itemCustomizations,
      };
    });

    // Fetch payment transactions
    const { data: payments, error: paymentsError } = await supabase
      .from("paymenttransaction")
      .select("*")
      .eq("order_id", orderId);

    // Build the complete order object
    const completeOrder = {
      ...orderData,
      orderitems: itemsWithCustomizations || [],
      paymenttransaction: payments || [],
    };

    console.log("Order created successfully with details:", {
      order_id: orderId,
      itemsCount: orderItems?.length || 0,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: completeOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;
    console.log(`Updating order ${id} status to: ${order_status}`);

    // Validate order status
    const validStatuses = ["pending", "processing", "completed", "cancelled"];
    if (!order_status || !validStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // First check if the order exists
    const { data: existingData, error: checkError } = await supabase
      .from("orders")
      .select("order_id, order_status")
      .eq("order_id", id);

    if (checkError) {
      console.error("Error checking order:", checkError);
      throw checkError;
    }

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${id} not found`,
      });
    }

    // If order is already in the requested status, return success without updating
    if (existingData[0].order_status === order_status) {
      return res.json({
        success: true,
        message: `Order already has status: ${order_status}`,
        data: existingData[0],
      });
    }

    // Update order status
    const { data, error } = await supabase
      .from("orders")
      .update({ order_status })
      .eq("order_id", id)
      .select();

    if (error) {
      console.error("Supabase error updating order status:", error);
      throw error;
    }

    // NEW: Simplified - If the order is completed, update inventory
    if (order_status === "completed") {
      await updateInventoryFromOrder(id);
    }

    console.log("Order status updated successfully:", data);
    res.json({
      success: true,
      message: "Order status updated successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get orders by date range
const getOrdersByDateRange = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    console.log(`Getting orders from ${start_date} to ${end_date}`);

    // Validate date format
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message:
          "Both start_date and end_date are required (YYYY-MM-DD format)",
      });
    }

    let query = supabase.from("orders").select(`
        *,
        orderitems(
          *,
          products(name, price)
        )
      `);

    // Add date filters
    query = query.gte("order_date", `${start_date}T00:00:00.000Z`);
    query = query.lte("order_date", `${end_date}T23:59:59.999Z`);

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error("Supabase error fetching orders by date:", error);
      throw error;
    }

    console.log(`Retrieved ${data ? data.length : 0} orders in date range`);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error getting orders by date range:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Process payment for an order
const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, transaction_id } = req.body;
    console.log(`Processing payment for order ${id}`);

    // Validate payment method
    const validMethods = ["credit", "debit", "cash"];
    if (!payment_method || !validMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validMethods.join(
          ", "
        )}`,
      });
    }

    // Check if order exists and get amount
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("order_id, final_total, payment_complete")
      .eq("order_id", id)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      return res.status(404).json({
        success: false,
        message: `Order with ID ${id} not found`,
      });
    }

    // Check if payment already completed
    if (order.payment_complete) {
      return res.status(400).json({
        success: false,
        message: "Payment already completed for this order",
      });
    }

    // Create payment transaction
    const { data: paymentData, error: paymentError } = await supabase
      .from("paymenttransaction")
      .insert([
        {
          order_id: id,
          amount: order.final_total,
          payment_method,
          status: "completed",
          transaction_id: transaction_id || null,
          timestamp: new Date().toISOString(),
          processor_response: "Payment processed successfully",
        },
      ])
      .select();

    if (paymentError) {
      console.error("Error creating payment transaction:", paymentError);
      throw paymentError;
    }

    // Update order payment status
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ payment_complete: true })
      .eq("order_id", id)
      .select();

    if (updateError) {
      console.error("Error updating order payment status:", updateError);
      throw updateError;
    }

    // NEW: Update inventory when payment is complete
    await updateInventoryFromOrder(id);

    console.log("Payment processed successfully:", paymentData);
    res.json({
      success: true,
      message: "Payment processed successfully",
      data: {
        order: updatedOrder[0],
        payment: paymentData[0],
      },
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update inventory from order
const updateInventoryFromOrder = async (orderId) => {
  try {
    // Get all items in the order
    const { data: orderItems, error: itemsError } = await supabase
      .from("orderitems")
      .select("*, products(*)")
      .eq("order_id", orderId);

    if (itemsError) throw itemsError;

    // Update inventory for each product
    for (const item of orderItems) {
      // Get inventory item for this product
      const { data: inventoryItems, error: invError } = await supabase
        .from("inventory")
        .select("*")
        .eq("product_id", item.product_id);

      if (invError) throw invError;

      // If product is tracked in inventory
      if (inventoryItems && inventoryItems.length > 0) {
        const inventoryItem = inventoryItems[0];
        const newQuantity = inventoryItem.current_quantity - item.quantity;

        // Create inventory transaction
        await supabase.from("inventorytransaction").insert([
          {
            inventory_id: inventoryItem.inventory_id,
            transaction_type: "usage",
            quantity: item.quantity,
            transaction_date: new Date().toISOString(),
            previous_quantity: inventoryItem.current_quantity,
            new_quantity: newQuantity,
            notes: `Order #${orderId}`,
          },
        ]);

        // Update inventory quantity
        await supabase
          .from("inventory")
          .update({
            current_quantity: newQuantity,
            last_updated: new Date().toISOString(),
          })
          .eq("inventory_id", inventoryItem.inventory_id);

        // Check if item is below reorder level
        if (newQuantity <= inventoryItem.reorder_level) {
          // Create notification
          await supabase.from("notification").insert([
            {
              notification_type: "low_stock",
              item_id: inventoryItem.inventory_id,
              message: `Low stock alert: ${inventoryItem.item_name} is below reorder level (${newQuantity} remaining)`,
              is_read: false,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }
    }
  } catch (error) {
    console.error("Error updating inventory from order:", error);
    // Log error but don't throw, to prevent order processing from failing
  }
};

// Apply promotions to order
const applyPromotionsToOrder = async (req, res) => {
  try {
    const { id } = req.params; // Order ID
    console.log(`Applying promotions to order ${id}`);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${id} not found`,
      });
    }

    // Get order items with product details
    const { data: orderItems, error: itemsError } = await supabase
      .from("orderitems")
      .select("*, products(*)")
      .eq("order_id", id);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      throw itemsError;
    }

    // Get active promotions
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

    const { data: activePromotions, error: promotionsError } = await supabase
      .from("promotiontable")
      .select("*")
      .eq("active_status", true)
      .or(`start_date.lte.${currentDate},start_date.is.null`)
      .or(`end_date.gte.${currentDate},end_date.is.null`)
      .or(`day_of_week.eq.${dayOfWeek},day_of_week.is.null`);

    if (promotionsError) {
      console.error("Error fetching active promotions:", promotionsError);
      throw promotionsError;
    }

    // Check if we have any active promotions
    if (!activePromotions || activePromotions.length === 0) {
      return res.json({
        success: true,
        message: "No active promotions available",
        data: {
          order_id: id,
          discount_amount: 0,
          applied_promotions: [],
        },
      });
    }

    // Get product-promotion associations
    const productPromotionMap = new Map();

    for (const promotion of activePromotions) {
      // Get products associated with this promotion
      const { data: promotionProducts, error: prodError } = await supabase
        .from("promotionproduct")
        .select("product_id")
        .eq("promotion_id", promotion.promotion_id);

      if (prodError) {
        console.error("Error fetching promotion products:", prodError);
        continue; // Skip this promotion if error
      }

      // If this promotion has specific products
      if (promotionProducts && promotionProducts.length > 0) {
        const productIds = promotionProducts.map((p) => p.product_id);

        for (const productId of productIds) {
          if (!productPromotionMap.has(productId)) {
            productPromotionMap.set(productId, []);
          }
          productPromotionMap.get(productId).push(promotion);
        }
      } else {
        // This promotion applies to all products (no specific products associated)
        for (const item of orderItems) {
          const productId = item.product_id;
          if (!productPromotionMap.has(productId)) {
            productPromotionMap.set(productId, []);
          }
          productPromotionMap.get(productId).push(promotion);
        }
      }
    }

    // Calculate discounts
    let totalDiscount = 0;
    const appliedPromotions = [];

    for (const item of orderItems) {
      const productId = item.product_id;
      const eligiblePromotions = productPromotionMap.get(productId) || [];

      if (eligiblePromotions.length > 0) {
        // Find the best promotion for this item
        let bestPromotion = null;
        let maxDiscount = 0;

        for (const promotion of eligiblePromotions) {
          let discount = 0;

          if (promotion.promotion_type === "percentage_off") {
            // Calculate percentage discount
            discount = (item.sub_total * promotion.discount_value) / 100;
          } else if (
            promotion.promotion_type === "bogo" &&
            item.quantity >= 2
          ) {
            // For BOGO, discount the price of every second item
            const freeItems = Math.floor(item.quantity / 2);
            discount = freeItems * (item.sub_total / item.quantity);
          }

          if (discount > maxDiscount) {
            maxDiscount = discount;
            bestPromotion = promotion;
          }
        }

        if (bestPromotion && maxDiscount > 0) {
          totalDiscount += maxDiscount;

          // Add to applied promotions
          appliedPromotions.push({
            promotion_id: bestPromotion.promotion_id,
            order_id: id,
            product_id: productId,
            discount_amount: maxDiscount,
          });
        }
      }
    }

    // Round discount to 2 decimal places
    totalDiscount = Math.round(totalDiscount * 100) / 100;

    // Clear any existing promotions for this order
    const { error: clearError } = await supabase
      .from("orderpromotion")
      .delete()
      .eq("order_id", id);

    if (clearError) {
      console.error("Error clearing existing promotions:", clearError);
    }

    // Update order with discount
    const newTotal = Math.max(0, order.sub_total - totalDiscount);

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        discount_total: totalDiscount,
        final_total: newTotal,
        total_amount: newTotal, // Update both columns for consistency
      })
      .eq("order_id", id);

    if (updateError) {
      console.error("Error updating order with discount:", updateError);
      throw updateError;
    }

    // Record applied promotions
    if (appliedPromotions.length > 0) {
      const { error: promoError } = await supabase
        .from("orderpromotion")
        .insert(appliedPromotions);

      if (promoError) {
        console.error("Error recording applied promotions:", promoError);
      }
    }

    res.json({
      success: true,
      message: "Promotions applied successfully",
      data: {
        order_id: id,
        total_before_discount: order.sub_total,
        discount_amount: totalDiscount,
        final_amount: newTotal,
        applied_promotions: appliedPromotions,
      },
    });
  } catch (error) {
    console.error("Error applying promotions:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getOrdersByDateRange,
  processPayment,
  applyPromotionsToOrder,
  updateInventoryFromOrder,
};
