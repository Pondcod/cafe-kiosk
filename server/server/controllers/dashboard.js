// controllers/dashboard.js
const { supabase } = require("../config/supabase");

// Get dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Get active orders
    const { data: activeOrders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .not("order_status", "eq", "completed")
      .not("order_status", "eq", "cancelled");

    if (ordersError) throw ordersError;

    // Get today's sales
    const { data: todaySales, error: salesError } = await supabase
      .from("orders")
      .select("final_total")
      .eq("payment_complete", true)
      .gte("order_date", `${todayStr}T00:00:00.000Z`)
      .lte("order_date", `${todayStr}T23:59:59.999Z`);

    if (salesError) throw salesError;

    // Get low stock items
    const { data: lowStockItems, error: stockError } = await supabase
      .from("inventory")
      .select("inventory_id, item_name, current_quantity, reorder_level")
      .lt("current_quantity", supabase.raw("reorder_level"));

    if (stockError) throw stockError;

    // Calculate summary
    const totalTodaySales = todaySales.reduce(
      (sum, order) => sum + order.final_total,
      0
    );

    res.json({
      success: true,
      data: {
        activeOrders: {
          count: activeOrders.length,
          details: activeOrders,
        },
        todaySales: {
          total: totalTodaySales,
          orderCount: todaySales.length,
        },
        lowStockItems: {
          count: lowStockItems.length,
          items: lowStockItems,
        },
      },
    });
  } catch (error) {
    console.error("Error getting dashboard summary:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
};
