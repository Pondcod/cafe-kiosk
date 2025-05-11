// controllers/inventory.js - Simplified without product tracking
const { supabase } = require("../config/supabase");

// Get all inventory items
const getAllInventory = async (req, res) => {
  try {
    console.log("Getting all inventory items");

    const { data, error } = await supabase.from("inventory").select("*");

    if (error) {
      console.error("Supabase error fetching inventory:", error);
      throw error;
    }

    console.log(`Retrieved ${data ? data.length : 0} inventory items`);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get inventory item by ID
const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting inventory item with ID: ${id}`);

    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("inventory_id", id);

    if (error) {
      console.error("Supabase error fetching inventory item:", error);
      throw error;
    }

    // Check if any data was returned
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Inventory item with ID ${id} not found`,
      });
    }

    // Get transaction history for this inventory item
    const { data: transactionData, error: transactionError } = await supabase
      .from("inventorytransaction")
      .select("*")
      .eq("inventory_id", id)
      .order("timestamp", { ascending: false });

    if (transactionError) {
      console.error("Error fetching inventory transactions:", transactionError);
    }

    // Combine inventory data with transaction history
    const responseData = {
      ...data[0],
      transactions: transactionData || [],
    };

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error getting inventory item by ID:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new inventory item
const createInventory = async (req, res) => {
  try {
    const { item_name, quantity, unit, reorder_level } = req.body;
    console.log("Creating inventory item with data:", {
      item_name,
      quantity,
      unit,
      reorder_level,
    });

    // Validate required fields
    if (!item_name) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    // Insert inventory item
    const { data, error } = await supabase
      .from("inventory")
      .insert([
        {
          item_name,
          quantity: quantity || 0,
          unit: unit || null,
          reorder_level: reorder_level || 10,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error creating inventory item:", error);
      throw error;
    }

    // Create an initial inventory transaction record
    if (quantity && quantity > 0) {
      await supabase.from("inventorytransaction").insert([
        {
          inventory_id: data[0].inventory_id,
          quantity_change: quantity,
          transaction_type: "adjusted",
          note: "Initial inventory creation",
        },
      ]);
    }

    console.log("Inventory item created successfully:", data);
    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update inventory
// Update inventory
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, quantity, unit, reorder_level } = req.body;
    console.log(`Updating inventory ${id} with data:`, {
      item_name,
      quantity,
      unit,
      reorder_level,
    });

    // First check if the inventory item exists
    const { data: existingData, error: checkError } = await supabase
      .from("inventory")
      .select("inventory_id, quantity, item_name")
      .eq("inventory_id", id);

    if (checkError) {
      console.error("Error checking inventory:", checkError);
      throw checkError;
    }

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Inventory item with ID ${id} not found`,
      });
    }

    // Calculate quantity change if new quantity is provided
    const oldQuantity = existingData[0].quantity;
    let quantityChange = 0;

    if (quantity !== undefined) {
      quantityChange = quantity - oldQuantity;
    }

    // Build update object with only provided fields
    const updateData = {};
    if (item_name !== undefined) updateData.item_name = item_name;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (unit !== undefined) updateData.unit = unit;
    if (reorder_level !== undefined) updateData.reorder_level = reorder_level;

    const { data, error } = await supabase
      .from("inventory")
      .update(updateData)
      .eq("inventory_id", id)
      .select();

    if (error) {
      console.error("Supabase error updating inventory:", error);
      throw error;
    }

    // Create inventory transaction record if quantity changed
    if (quantityChange !== 0) {
      await supabase.from("inventorytransaction").insert([
        {
          inventory_id: id,
          quantity_change: quantityChange,
          transaction_type: "adjusted",
          note: "Manual inventory adjustment",
        },
      ]);

      // Check if inventory is below reorder level
      if (quantity < (reorder_level || data[0].reorder_level)) {
        // Create notification with correct fields
        await supabase.from("notification").insert([
          {
            user_id: null, // Can be null or admin user ID
            message: `Inventory item "${data[0].item_name}" is below reorder level`,
            type: "inventory",
            content: `Current quantity: ${quantity}, Reorder level: ${
              reorder_level || data[0].reorder_level
            }`,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    }

    console.log("Inventory updated successfully:", data);
    res.json({
      success: true,
      message: "Inventory updated successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add this to controllers/orders.js
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
        const newQuantity = inventoryItem.quantity - item.quantity;

        // Create inventory transaction
        await supabase.from("inventorytransaction").insert([
          {
            inventory_id: inventoryItem.inventory_id,
            quantity_change: -item.quantity,
            transaction_type: "order_used",
            note: `Order #${orderId}`,
          },
        ]);

        // Update inventory quantity
        await supabase
          .from("inventory")
          .update({
            quantity: newQuantity,
          })
          .eq("inventory_id", inventoryItem.inventory_id);

        // Create notification if stock is low
        if (newQuantity <= inventoryItem.reorder_level) {
          await supabase.from("notification").insert([
            {
              user_id: null, // Can be null or admin user ID
              message: `Low stock alert: ${inventoryItem.item_name}`,
              type: "inventory",
              content: `Current quantity: ${newQuantity}, Reorder level: ${inventoryItem.reorder_level}`,
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

// Delete inventory
const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting inventory with ID: ${id}`);

    // First check if the inventory item exists
    const { data: existingData, error: checkError } = await supabase
      .from("inventory")
      .select("inventory_id")
      .eq("inventory_id", id);

    if (checkError) {
      console.error("Error checking inventory:", checkError);
      throw checkError;
    }

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Inventory item with ID ${id} not found`,
      });
    }

    // Delete related inventory transactions first
    const { error: transactionError } = await supabase
      .from("inventorytransaction")
      .delete()
      .eq("inventory_id", id);

    if (transactionError) {
      console.error("Error deleting inventory transactions:", transactionError);
      throw transactionError;
    }

    // Delete the inventory item
    const { error } = await supabase
      .from("inventory")
      .delete()
      .eq("inventory_id", id);

    if (error) {
      console.error("Supabase error deleting inventory:", error);
      throw error;
    }

    console.log("Inventory deleted successfully");
    res.json({
      success: true,
      message: "Inventory deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create inventory transaction (restock)
const restockInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, note } = req.body;
    console.log(`Restocking inventory ID ${id} with ${quantity} units`);

    // Validate quantity
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid positive quantity is required",
      });
    }

    // First check if the inventory item exists
    const { data: inventoryData, error: inventoryError } = await supabase
      .from("inventory")
      .select("inventory_id, quantity, item_name")
      .eq("inventory_id", id);

    if (inventoryError) {
      console.error("Error checking inventory:", inventoryError);
      throw inventoryError;
    }

    if (!inventoryData || inventoryData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Inventory item with ID ${id} not found`,
      });
    }

    const parsedQuantity = parseInt(quantity);
    const newQuantity = inventoryData[0].quantity + parsedQuantity;

    // Create transaction record
    const { data: transactionData, error: transactionError } = await supabase
      .from("inventorytransaction")
      .insert([
        {
          inventory_id: id,
          quantity_change: parsedQuantity,
          transaction_type: "restock",
          note: note || "Inventory restock",
        },
      ])
      .select();

    if (transactionError) {
      console.error("Error creating transaction record:", transactionError);
      throw transactionError;
    }

    // Update inventory quantity
    const { data, error } = await supabase
      .from("inventory")
      .update({ quantity: newQuantity })
      .eq("inventory_id", id)
      .select();

    if (error) {
      console.error("Supabase error updating inventory quantity:", error);
      throw error;
    }

    console.log("Inventory restocked successfully:", data);
    res.json({
      success: true,
      message: "Inventory restocked successfully",
      data: {
        inventory: data[0],
        transaction: transactionData[0],
      },
    });
  } catch (error) {
    console.error("Error restocking inventory:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get inventory items with low stock
const getLowStockInventory = async (req, res) => {
  try {
    console.log("Getting low stock inventory items");

    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .lt("quantity", supabase.raw("reorder_level"));

    if (error) {
      console.error("Supabase error fetching low stock inventory:", error);
      throw error;
    }

    console.log(
      `Retrieved ${data ? data.length : 0} low stock inventory items`
    );
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching low stock inventory:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  restockInventory,
  getLowStockInventory,
};
