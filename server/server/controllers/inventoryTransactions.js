// controllers/inventoryTransactions.js
const { supabase } = require("../config/supabase");

// Get all inventory transactions
const getAllTransactions = async (req, res) => {
  try {
    // Allow filtering by date range
    const { startDate, endDate, type } = req.query;

    let query = supabase.from("inventorytransaction").select("*, inventory(*)");

    // Add filters if provided
    if (startDate) {
      query = query.gte("transaction_date", startDate);
    }

    if (endDate) {
      query = query.lte("transaction_date", endDate);
    }

    if (type) {
      query = query.eq("transaction_type", type);
    }

    // Execute query
    const { data, error } = await query.order("transaction_date", {
      ascending: false,
    });

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching inventory transactions:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("inventorytransaction")
      .select("*, inventory(*)")
      .eq("transaction_id", id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new inventory transaction
const createTransaction = async (req, res) => {
  try {
    const { inventory_id, transaction_type, quantity, unit_cost, notes } =
      req.body;

    // Validate required fields
    if (!inventory_id || !transaction_type || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Inventory ID, transaction type, and quantity are required",
      });
    }

    // Get current inventory item
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from("inventory")
      .select("*")
      .eq("inventory_id", inventory_id)
      .single();

    if (inventoryError || !inventoryItem) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // Calculate new quantity based on transaction type
    let newQuantity = inventoryItem.current_quantity;

    switch (transaction_type) {
      case "restock":
      case "adjustment_add":
        newQuantity += quantity;
        break;
      case "usage":
      case "waste":
      case "adjustment_subtract":
        newQuantity -= quantity;
        // Prevent negative quantity
        if (newQuantity < 0) {
          return res.status(400).json({
            success: false,
            message: "Insufficient quantity available",
          });
        }
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid transaction type",
        });
    }

    // Begin transaction
    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from("inventorytransaction")
      .insert([
        {
          inventory_id,
          transaction_type,
          quantity,
          unit_cost: unit_cost || inventoryItem.unit_cost,
          notes,
          transaction_date: new Date().toISOString(),
          previous_quantity: inventoryItem.current_quantity,
          new_quantity: newQuantity,
        },
      ])
      .select();

    if (transactionError) throw transactionError;

    // Update inventory quantity
    const { error: updateError } = await supabase
      .from("inventory")
      .update({
        current_quantity: newQuantity,
        last_updated: new Date().toISOString(),
      })
      .eq("inventory_id", inventory_id);

    if (updateError) throw updateError;

    // Check if item is below reorder level and notify if needed
    if (newQuantity <= inventoryItem.reorder_level) {
      // Insert notification for low stock
      await supabase.from("notification").insert([
        {
          notification_type: "low_stock",
          item_id: inventory_id,
          message: `Low stock alert: ${inventoryItem.item_name} is below reorder level (${newQuantity} remaining)`,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    res.status(201).json({
      success: true,
      message: "Inventory transaction created successfully",
      data: transaction[0],
    });
  } catch (error) {
    console.error("Error creating inventory transaction:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
};
