// controllers/reports.js
const { supabase } = require("../config/supabase");

// Get sales summary report
const getSalesSummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Validate date format
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message:
          "Both start_date and end_date are required (YYYY-MM-DD format)",
      });
    }

    // Get completed orders in date range
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("payment_complete", true)
      .gte("order_date", `${start_date}T00:00:00.000Z`)
      .lte("order_date", `${end_date}T23:59:59.999Z`);

    if (ordersError) throw ordersError;

    // Calculate summary statistics
    const totalSales = orders.reduce(
      (sum, order) => sum + order.final_total,
      0
    );
    const totalOrders = orders.length;
    const totalDiscount = orders.reduce(
      (sum, order) => sum + (order.discount_total || 0),
      0
    );

    // Get sales by day
    const salesByDay = {};
    orders.forEach((order) => {
      const date = order.order_date.split("T")[0];
      if (!salesByDay[date]) {
        salesByDay[date] = {
          date,
          orders: 0,
          total: 0,
          discount: 0,
        };
      }
      salesByDay[date].orders++;
      salesByDay[date].total += order.final_total;
      salesByDay[date].discount += order.discount_total || 0;
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalSales,
          totalOrders,
          totalDiscount,
          averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
        },
        salesByDay: Object.values(salesByDay),
      },
    });
  } catch (error) {
    console.error("Error generating sales summary:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get top selling products
const getTopProducts = async (req, res) => {
  try {
    const { start_date, end_date, limit = 10 } = req.query;

    // Validate date format
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message:
          "Both start_date and end_date are required (YYYY-MM-DD format)",
      });
    }

    // Get orders in date range
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("order_id")
      .eq("payment_complete", true)
      .gte("order_date", `${start_date}T00:00:00.000Z`)
      .lte("order_date", `${end_date}T23:59:59.999Z`);

    if (ordersError) throw ordersError;

    if (!orders || orders.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Get order items for these orders
    const orderIds = orders.map((order) => order.order_id);
    const { data: orderItems, error: itemsError } = await supabase
      .from("orderitems")
      .select("product_id, quantity")
      .in("order_id", orderIds);

    if (itemsError) throw itemsError;

    // Aggregate by product
    const productSales = {};
    orderItems.forEach((item) => {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = {
          product_id: item.product_id,
          quantity: 0,
        };
      }
      productSales[item.product_id].quantity += item.quantity;
    });

    // Get product details
    const productIds = Object.keys(productSales);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("product_id, name, price, category_id")
      .in("product_id", productIds);

    if (productsError) throw productsError;

    // Merge product details with sales data
    const productSalesWithDetails = products.map((product) => {
      return {
        ...product,
        quantity_sold: productSales[product.product_id]?.quantity || 0,
        revenue:
          (productSales[product.product_id]?.quantity || 0) * product.price,
      };
    });

    // Sort by quantity sold and limit results
    const topProducts = productSalesWithDetails
      .sort((a, b) => b.quantity_sold - a.quantity_sold)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    console.error("Error getting top products:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get inventory status report
const getInventoryStatus = async (req, res) => {
  try {
    const { low_stock_only } = req.query;

    let query = supabase.from("inventory").select(`
        *,
        products(name, price)
      `);

    // Filter by low stock if requested
    if (low_stock_only === "true") {
      query = query.lt("current_quantity", supabase.raw("reorder_level"));
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate days until reorder
    const inventoryWithStatus = data.map((item) => {
      // Calculate average daily usage (if usage data available)
      const avgDailyUsage = item.avg_daily_usage || 1; // Default to 1 if no data

      return {
        ...item,
        days_until_reorder: Math.max(
          0,
          Math.floor(
            (item.current_quantity - item.reorder_level) / avgDailyUsage
          )
        ),
        stock_status:
          item.current_quantity <= item.reorder_level ? "low" : "normal",
      };
    });

    res.json({
      success: true,
      data: inventoryWithStatus,
    });
  } catch (error) {
    console.error("Error getting inventory status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSalesSummary,
  getTopProducts,
  getInventoryStatus,
};
