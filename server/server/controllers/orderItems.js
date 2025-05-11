// controllers/orderItems.js
const { supabase } = require("../config/supabase");

// Get all items for a specific order
const getOrderItems = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data, error } = await supabase
      .from("orderitems")
      .select("*, products(*)")
      .eq("order_id", orderId);

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error getting order items:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add item to an order
const addOrderItem = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { product_id, quantity, unit_price, subtotal } = req.body;

    // Check if product exists
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("price")
      .eq("product_id", product_id)
      .single();

    if (productError || !productData) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Calculate subtotal if not provided
    const calculatedSubtotal = subtotal || productData.price * quantity;

    const { data, error } = await supabase
      .from("orderitems")
      .insert([
        {
          order_id: orderId,
          product_id,
          quantity,
          unit_price: unit_price || productData.price,
          subtotal: calculatedSubtotal,
        },
      ])
      .select();

    if (error) throw error;

    // Update order total
    await updateOrderTotal(orderId);

    res.status(201).json({
      success: true,
      message: "Item added to order",
      data: data[0],
    });
  } catch (error) {
    console.error("Error adding order item:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to update order total
const updateOrderTotal = async (orderId) => {
  // Get sum of all order items
  const { data, error } = await supabase
    .from("orderitems")
    .select("subtotal")
    .eq("order_id", orderId);

  if (error) throw error;

  // Calculate total
  const total = data.reduce((sum, item) => sum + item.subtotal, 0);

  // Update order
  await supabase
    .from("orders")
    .update({ total_amount: total })
    .eq("order_id", orderId);
};

module.exports = {
  getOrderItems,
  addOrderItem,
};
