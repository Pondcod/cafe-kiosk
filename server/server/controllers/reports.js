// controllers/reports.js
const { supabase } = require("../config/supabase");

// Get sales summary report (daily, weekly, monthly, or custom range)
const getSalesSummary = async (req, res) => {
  try {
    const { period, start_date, end_date } = req.query;
    let startDate, endDate;

    // Calculate date range based on period
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (start_date && end_date) {
      // Custom date range
      startDate = new Date(start_date);
      startDate.setHours(0, 0, 0, 0); // Start of day

      endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999); // End of day
    } else if (period === "daily") {
      // Daily - just today
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0); // Start of today
      endDate = today;
    } else if (period === "weekly") {
      // Weekly - last 7 days
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6); // 7 days ago
      startDate.setHours(0, 0, 0, 0); // Start of day
      endDate = today;
    } else if (period === "monthly") {
      // Monthly - last 30 days
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29); // 30 days ago
      startDate.setHours(0, 0, 0, 0); // Start of day
      endDate = today;
    } else {
      // Default to daily if no valid period is provided
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0); // Start of today
      endDate = today;
    }

    // Format dates for Supabase query
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();

    console.log(
      `Generating sales report from ${formattedStartDate} to ${formattedEndDate}`
    );

    // Get completed orders in the date range
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("order_id, order_date, final_total, payment_complete")
      .gte("order_date", formattedStartDate)
      .lte("order_date", formattedEndDate)
      .eq("order_status", "completed")
      .eq("payment_complete", true);

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      throw ordersError;
    }

    // Get order items for these orders to calculate product-wise sales
    const orderIds = orders.map((order) => order.order_id);

    let orderItems = [];
    if (orderIds.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from("orderitems")
        .select(
          `
          order_item_id,
          order_id,
          product_id,
          quantity,
          sub_total,
          products(name, category_id, categories(name))
        `
        )
        .in("order_id", orderIds);

      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
        throw itemsError;
      }

      orderItems = items;
    }

    // Calculate total sales
    const totalSales = orders.reduce(
      (sum, order) => sum + order.final_total,
      0
    );
    const orderCount = orders.length;
    const averageOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    // Group sales by day
    const salesByDay = {};
    orders.forEach((order) => {
      const date = new Date(order.order_date).toISOString().split("T")[0];
      if (!salesByDay[date]) {
        salesByDay[date] = {
          date,
          total: 0,
          order_count: 0,
        };
      }
      salesByDay[date].total += order.final_total;
      salesByDay[date].order_count += 1;
    });

    // Group sales by product
    const salesByProduct = {};
    orderItems.forEach((item) => {
      const productId = item.product_id;
      const productName = item.products?.name || `Product ${productId}`;
      const categoryName = item.products?.categories?.name || "Uncategorized";

      if (!salesByProduct[productId]) {
        salesByProduct[productId] = {
          product_id: productId,
          product_name: productName,
          category: categoryName,
          quantity_sold: 0,
          total_sales: 0,
        };
      }

      salesByProduct[productId].quantity_sold += item.quantity;
      salesByProduct[productId].total_sales += item.sub_total;
    });

    // Group sales by category
    const salesByCategory = {};
    orderItems.forEach((item) => {
      const categoryName = item.products?.categories?.name || "Uncategorized";

      if (!salesByCategory[categoryName]) {
        salesByCategory[categoryName] = {
          category_name: categoryName,
          quantity_sold: 0,
          total_sales: 0,
        };
      }

      salesByCategory[categoryName].quantity_sold += item.quantity;
      salesByCategory[categoryName].total_sales += item.sub_total;
    });

    // Prepare final report data
    const reportData = {
      period: period || "custom",
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      summary: {
        total_sales: totalSales,
        order_count: orderCount,
        average_order_value: averageOrderValue,
      },
      sales_by_day: Object.values(salesByDay),
      sales_by_product: Object.values(salesByProduct),
      sales_by_category: Object.values(salesByCategory),
    };

    res.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get inventory usage report
const getInventoryUsageReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Calculate date range
    const today = new Date();
    const startDate = start_date
      ? new Date(start_date)
      : new Date(today.setDate(today.getDate() - 30));
    const endDate = end_date ? new Date(end_date) : new Date();

    // Format dates for Supabase query
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();

    console.log(
      `Generating inventory report from ${formattedStartDate} to ${formattedEndDate}`
    );

    // Get all inventory items
    const { data: inventoryItems, error: inventoryError } = await supabase.from(
      "inventory"
    ).select(`
        inventory_id,
        item_name,
        quantity,
        unit,
        reorder_level,
        product_id,
        products(name)
      `);

    if (inventoryError) {
      console.error("Error fetching inventory:", inventoryError);
      throw inventoryError;
    }

    // Get inventory transactions in the date range
    const { data: transactions, error: transactionsError } = await supabase
      .from("inventorytransaction")
      .select(
        `
        transaction_id,
        inventory_id,
        quantity_change,
        transaction_type,
        reference_id,
        timestamp,
        note
      `
      )
      .gte("timestamp", formattedStartDate)
      .lte("timestamp", formattedEndDate)
      .order("timestamp", { ascending: false });

    if (transactionsError) {
      console.error(
        "Error fetching inventory transactions:",
        transactionsError
      );
      throw transactionsError;
    }

    // Group transactions by inventory item
    const usageByItem = {};

    inventoryItems.forEach((item) => {
      usageByItem[item.inventory_id] = {
        inventory_id: item.inventory_id,
        item_name: item.item_name,
        product_name: item.products?.name || null,
        current_quantity: item.quantity,
        unit: item.unit || "",
        reorder_level: item.reorder_level,
        status: item.quantity <= item.reorder_level ? "low" : "ok",
        usage: {
          restock: 0,
          order_used: 0,
          damaged: 0,
          adjusted: 0,
          total: 0,
        },
        transactions: [],
      };
    });

    // Add transaction data
    transactions.forEach((transaction) => {
      const inventoryId = transaction.inventory_id;

      if (usageByItem[inventoryId]) {
        // Add transaction to the list
        usageByItem[inventoryId].transactions.push({
          transaction_id: transaction.transaction_id,
          quantity_change: transaction.quantity_change,
          transaction_type: transaction.transaction_type,
          timestamp: transaction.timestamp,
          note: transaction.note,
        });

        // Update usage statistics
        const quantity = Math.abs(transaction.quantity_change);

        if (transaction.transaction_type === "restock") {
          usageByItem[inventoryId].usage.restock += quantity;
        } else if (transaction.transaction_type === "order_used") {
          usageByItem[inventoryId].usage.order_used += quantity;
          usageByItem[inventoryId].usage.total += quantity;
        } else if (transaction.transaction_type === "damaged") {
          usageByItem[inventoryId].usage.damaged += quantity;
          usageByItem[inventoryId].usage.total += quantity;
        } else if (transaction.transaction_type === "adjusted") {
          usageByItem[inventoryId].usage.adjusted +=
            transaction.quantity_change < 0 ? quantity : 0;
          usageByItem[inventoryId].usage.total +=
            transaction.quantity_change < 0 ? quantity : 0;
        }
      }
    });

    // Identify low stock and out of stock items
    const lowStockItems = Object.values(usageByItem)
      .filter(
        (item) =>
          item.current_quantity <= item.reorder_level &&
          item.current_quantity > 0
      )
      .map((item) => ({
        inventory_id: item.inventory_id,
        item_name: item.item_name,
        current_quantity: item.current_quantity,
        reorder_level: item.reorder_level,
        status: "low",
      }));

    const outOfStockItems = Object.values(usageByItem)
      .filter((item) => item.current_quantity <= 0)
      .map((item) => ({
        inventory_id: item.inventory_id,
        item_name: item.item_name,
        current_quantity: item.current_quantity,
        reorder_level: item.reorder_level,
        status: "out",
      }));

    // Calculate total usage
    const totalUsage = Object.values(usageByItem).reduce(
      (sum, item) => sum + item.usage.total,
      0
    );

    // Prepare final report data
    const reportData = {
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      summary: {
        total_usage: totalUsage,
        low_stock_count: lowStockItems.length,
        out_of_stock_count: outOfStockItems.length,
      },
      inventory_status: {
        low_stock: lowStockItems,
        out_of_stock: outOfStockItems,
      },
      usage_by_item: Object.values(usageByItem),
    };

    res.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating inventory report:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get product popularity analytics
const getProductPopularity = async (req, res) => {
  try {
    const { period, limit } = req.query;
    const resultLimit = limit ? parseInt(limit) : 10; // Default to top 10

    // Calculate date range based on period
    const today = new Date();
    let startDate;

    if (period === "weekly") {
      // Last 7 days
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
    } else if (period === "monthly") {
      // Last 30 days
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
    } else if (period === "yearly") {
      // Last 365 days
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 364);
    } else {
      // Default to monthly
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
    }

    startDate.setHours(0, 0, 0, 0); // Start of day
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = today.toISOString();

    console.log(
      `Generating product popularity report from ${formattedStartDate} to ${formattedEndDate}`
    );

    // Get completed orders in the date range
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("order_id")
      .gte("order_date", formattedStartDate)
      .lte("order_date", formattedEndDate)
      .eq("order_status", "completed");

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      throw ordersError;
    }

    // Get order items for these orders
    const orderIds = orders.map((order) => order.order_id);

    let orderItems = [];
    let productPopularity = [];

    if (orderIds.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from("orderitems")
        .select(
          `
          product_id,
          quantity,
          products(name, price, category_id, categories(name))
        `
        )
        .in("order_id", orderIds);

      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
        throw itemsError;
      }

      orderItems = items;

      // Group by product and calculate popularity metrics
      const productStats = {};

      orderItems.forEach((item) => {
        const productId = item.product_id;
        const productName = item.products?.name || `Product ${productId}`;
        const categoryName = item.products?.categories?.name || "Uncategorized";
        const price = item.products?.price || 0;

        if (!productStats[productId]) {
          productStats[productId] = {
            product_id: productId,
            product_name: productName,
            category: categoryName,
            price: price,
            quantity_sold: 0,
            total_sales: 0,
            order_count: 0,
          };
        }

        productStats[productId].quantity_sold += item.quantity;
        productStats[productId].total_sales += item.quantity * price;
        productStats[productId].order_count += 1;
      });

      // Convert to array and sort by quantity sold (descending)
      productPopularity = Object.values(productStats)
        .sort((a, b) => b.quantity_sold - a.quantity_sold)
        .slice(0, resultLimit); // Limit to top N products
    }

    // Calculate category popularity
    const categoryPopularity = {};
    orderItems.forEach((item) => {
      const categoryName = item.products?.categories?.name || "Uncategorized";

      if (!categoryPopularity[categoryName]) {
        categoryPopularity[categoryName] = {
          category_name: categoryName,
          quantity_sold: 0,
          total_sales: 0,
          product_count: 0,
        };
      }

      categoryPopularity[categoryName].quantity_sold += item.quantity;
      categoryPopularity[categoryName].total_sales +=
        item.quantity * (item.products?.price || 0);
    });

    // Add unique product count to each category
    const uniqueProductsByCategory = {};
    orderItems.forEach((item) => {
      const categoryName = item.products?.categories?.name || "Uncategorized";
      const productId = item.product_id;

      if (!uniqueProductsByCategory[categoryName]) {
        uniqueProductsByCategory[categoryName] = new Set();
      }

      uniqueProductsByCategory[categoryName].add(productId);
    });

    Object.keys(categoryPopularity).forEach((category) => {
      categoryPopularity[category].product_count = uniqueProductsByCategory[
        category
      ]
        ? uniqueProductsByCategory[category].size
        : 0;
    });

    // Convert to array and sort by quantity sold (descending)
    const sortedCategoryPopularity = Object.values(categoryPopularity).sort(
      (a, b) => b.quantity_sold - a.quantity_sold
    );

    // Calculate time-based popularity (hourly)
    const hourlyPopularity = Array(24)
      .fill()
      .map((_, hour) => ({
        hour,
        order_count: 0,
        total_sales: 0,
      }));

    // Get order data with timestamps for hourly analysis
    const { data: timeOrders, error: timeOrdersError } = await supabase
      .from("orders")
      .select("order_id, order_date, final_total")
      .gte("order_date", formattedStartDate)
      .lte("order_date", formattedEndDate)
      .eq("order_status", "completed");

    if (!timeOrdersError && timeOrders) {
      timeOrders.forEach((order) => {
        const hour = new Date(order.order_date).getHours();
        hourlyPopularity[hour].order_count += 1;
        hourlyPopularity[hour].total_sales += order.final_total;
      });
    }

    // Prepare final report data
    const reportData = {
      period: period || "monthly",
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      top_products: productPopularity,
      category_popularity: sortedCategoryPopularity,
      hourly_popularity: hourlyPopularity,
    };

    res.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Error generating product popularity report:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Dashboard summary - key metrics for overview
const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today);
    startOfMonth.setDate(1); // First day of month
    startOfMonth.setHours(0, 0, 0, 0);

    // Format dates for Supabase query
    const formattedStartOfToday = startOfToday.toISOString();
    const formattedStartOfWeek = startOfWeek.toISOString();
    const formattedStartOfMonth = startOfMonth.toISOString();
    const formattedNow = today.toISOString();

    // Get today's sales
    const { data: todaySales, error: todaySalesError } = await supabase
      .from("orders")
      .select("final_total, order_status")
      .gte("order_date", formattedStartOfToday)
      .lte("order_date", formattedNow)
      .eq("payment_complete", true);

    // Get this week's sales
    const { data: weeklySales, error: weeklySalesError } = await supabase
      .from("orders")
      .select("final_total, order_status")
      .gte("order_date", formattedStartOfWeek)
      .lte("order_date", formattedNow)
      .eq("payment_complete", true);

    // Get this month's sales
    const { data: monthlySales, error: monthlySalesError } = await supabase
      .from("orders")
      .select("final_total, order_status")
      .gte("order_date", formattedStartOfMonth)
      .lte("order_date", formattedNow)
      .eq("payment_complete", true);

    // Get inventory status
    const { data: inventory, error: inventoryError } = await supabase
      .from("inventory")
      .select("inventory_id, quantity, reorder_level");

    // Get pending orders
    const { data: pendingOrders, error: pendingOrdersError } = await supabase
      .from("orders")
      .select("order_id")
      .eq("order_status", "pending");

    // Calculate metrics
    const todayRevenue = todaySales
      ? todaySales.reduce((sum, order) => sum + order.final_total, 0)
      : 0;

    const todayOrderCount = todaySales ? todaySales.length : 0;

    const weeklyRevenue = weeklySales
      ? weeklySales.reduce((sum, order) => sum + order.final_total, 0)
      : 0;

    const weeklyOrderCount = weeklySales ? weeklySales.length : 0;

    const monthlyRevenue = monthlySales
      ? monthlySales.reduce((sum, order) => sum + order.final_total, 0)
      : 0;

    const monthlyOrderCount = monthlySales ? monthlySales.length : 0;

    // Inventory metrics
    const lowStockCount = inventory
      ? inventory.filter(
          (item) => item.quantity <= item.reorder_level && item.quantity > 0
        ).length
      : 0;

    const outOfStockCount = inventory
      ? inventory.filter((item) => item.quantity <= 0).length
      : 0;

    // Pending orders
    const pendingOrderCount = pendingOrders ? pendingOrders.length : 0;

    // Prepare dashboard summary
    const dashboardData = {
      current_time: formattedNow,
      sales: {
        today: {
          revenue: todayRevenue,
          order_count: todayOrderCount,
          average_order:
            todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0,
        },
        weekly: {
          revenue: weeklyRevenue,
          order_count: weeklyOrderCount,
          average_order:
            weeklyOrderCount > 0 ? weeklyRevenue / weeklyOrderCount : 0,
        },
        monthly: {
          revenue: monthlyRevenue,
          order_count: monthlyOrderCount,
          average_order:
            monthlyOrderCount > 0 ? monthlyRevenue / monthlyOrderCount : 0,
        },
      },
      inventory: {
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount,
        total_items: inventory ? inventory.length : 0,
      },
      orders: {
        pending_count: pendingOrderCount,
      },
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error generating dashboard summary:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSalesSummary,
  getInventoryUsageReport,
  getProductPopularity,
  getDashboardSummary,
};
