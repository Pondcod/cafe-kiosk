// controllers/inventory.js
const { supabase } = require("../config/supabase");

// Get all inventory items
const getAllInventory = async (req, res) => {
  try {
    console.log("Getting all inventory items");

    // Modified to get only inventory data without the products join
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

    // Modified to get only inventory data without the products join
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

    // If product_id exists, get the product info separately
    let productInfo = null;
    if (data[0].product_id) {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("product_id, name")
        .eq("product_id", data[0].product_id)
        .single();

      if (!productError && productData) {
        productInfo = productData;
      }
    }

    // Combine inventory data with transaction history and product info
    const responseData = {
      ...data[0],
      product: productInfo,
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

// Get inventory by product ID
const getInventoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`Getting inventory for product ID: ${productId}`);

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

    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("product_id", productId);

    if (error) {
      console.error("Supabase error fetching inventory for product:", error);
      throw error;
    }

    res.json({
      success: true,
      product: productData[0],
      data: data || [],
    });
  } catch (error) {
    console.error("Error getting inventory by product ID:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create new inventory item
const createInventory = async (req, res) => {
  try {
    const { item_name, quantity, unit, reorder_level, product_id } = req.body;
    console.log("Creating inventory item with data:", {
      item_name,
      quantity,
      unit,
      reorder_level,
      product_id,
    });

    // Validate required fields
    if (!item_name) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    // Check if product exists if product_id is provided
    if (product_id) {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("product_id")
        .eq("product_id", product_id);

      if (productError) {
        console.error("Error checking product:", productError);
        throw productError;
      }

      if (!productData || productData.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${product_id} not found`,
        });
      }
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
          product_id: product_id || null,
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
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, quantity, unit, reorder_level, product_id } = req.body;
    console.log(`Updating inventory ${id} with data:`, {
      item_name,
      quantity,
      unit,
      reorder_level,
      product_id,
    });

    // First check if the inventory item exists
    const { data: existingData, error: checkError } = await supabase
      .from("inventory")
      .select("inventory_id, quantity")
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

    // Check if product exists if product_id is provided
    if (product_id !== undefined && product_id !== null) {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("product_id")
        .eq("product_id", product_id);

      if (productError) {
        console.error("Error checking product:", productError);
        throw productError;
      }

      if (!productData || productData.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${product_id} not found`,
        });
      }
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
    if (product_id !== undefined) updateData.product_id = product_id;

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
        await supabase.from("notification").insert([
          {
            message: `Inventory item "${data[0].item_name}" is below reorder level`,
            type: "inventory_low",
            content: JSON.stringify({
              inventory_id: id,
              current_quantity: quantity,
              reorder_level: reorder_level || data[0].reorder_level,
            }),
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

    // Modified to get only inventory data without the products join
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
  getInventoryByProduct,
  createInventory,
  updateInventory,
  deleteInventory,
  restockInventory,
  getLowStockInventory,
};
