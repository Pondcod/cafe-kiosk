// controllers/orders.js
const { supabase } = require('../config/supabase');

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    console.log('Getting all orders');
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        orderitems(
          *,
          products(name, price),
          ordercustomization(
            *,
            customization(name, price_adjustment)
          )
        )
      `)
      .order('order_date', { ascending: false });
    
    if (error) {
      console.error('Supabase error fetching orders:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data ? data.length : 0} orders`);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting order with ID: ${id}`);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        orderitems(
          *,
          products(name, price, img_url),
          ordercustomization(
            *,
            customization(name, price_adjustment, customization_type)
          )
        ),
        orderpromotion(
          *,
          promotiontable(name, promotion_type, discount_value)
        ),
        paymenttransaction(*)
      `)
      .eq('order_id', id);
    
    if (error) {
      console.error('Supabase error fetching order:', error);
      throw error;
    }
    
    // Check if any data was returned
    if (!data || data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `Order with ID ${id} not found` 
      });
    }
    
    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error getting order by ID:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Create new order
const createOrder = async (req, res) => {
  try {
    const { 
      order_items,  // Array of {product_id, quantity, customizations}
      promotions,   // Array of promotion_ids
      payment_method
    } = req.body;
    
    // Validate required fields
    if (!order_items || !Array.isArray(order_items) || order_items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order items are required' 
      });
    }
    
    // Start a transaction
    const { data: orderData, error: orderError } = await supabase.rpc('create_order', {
      order_items_json: JSON.stringify(order_items),
      promotions_json: promotions ? JSON.stringify(promotions) : null,
      payment_method_input: payment_method || null
    });
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }
    
    // Get the created order with details
    const { data: createdOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        orderitems(
          *,
          products(name, price),
          ordercustomization(
            *,
            customization(name, price_adjustment)
          )
        ),
        orderpromotion(
          *,
          promotiontable(name, promotion_type, discount_value)
        ),
        paymenttransaction(*)
      `)
      .eq('order_id', orderData.order_id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching created order:', fetchError);
      throw fetchError;
    }
    
    console.log('Order created successfully:', createdOrder);
    res.status(201).json({ 
      success: true, 
      message: 'Order created successfully', 
      data: createdOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
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
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!order_status || !validStatuses.includes(order_status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // First check if the order exists
    const { data: existingData, error: checkError } = await supabase
      .from('orders')
      .select('order_id, order_status')
      .eq('order_id', id);
    
    if (checkError) {
      console.error('Error checking order:', checkError);
      throw checkError;
    }
    
    if (!existingData || existingData.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `Order with ID ${id} not found` 
      });
    }
    
    // If order is already in the requested status, return success without updating
    if (existingData[0].order_status === order_status) {
      return res.json({ 
        success: true, 
        message: `Order already has status: ${order_status}`, 
        data: existingData[0]
      });
    }
    
    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({ order_status })
      .eq('order_id', id)
      .select();
    
    if (error) {
      console.error('Supabase error updating order status:', error);
      throw error;
    }
    
    // If the order is completed, update inventory
    if (order_status === 'completed') {
      // Get order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('orderitems')
        .select('product_id, quantity')
        .eq('order_id', id);
      
      if (!itemsError && orderItems) {
        // Update inventory for each product
        for (const item of orderItems) {
          // Get inventory entry for this product
          const { data: inventoryItems, error: invError } = await supabase
            .from('inventory')
            .select('inventory_id, quantity')
            .eq('product_id', item.product_id);
          
          if (!invError && inventoryItems && inventoryItems.length > 0) {
            // Update inventory quantity
            const inventoryId = inventoryItems[0].inventory_id;
            const newQuantity = inventoryItems[0].quantity - item.quantity;
            
            await supabase
              .from('inventory')
              .update({ quantity: newQuantity })
              .eq('inventory_id', inventoryId);
            
            // Create inventory transaction record
            await supabase
              .from('inventorytransaction')
              .insert([{
                inventory_id: inventoryId,
                quantity_change: -item.quantity,
                transaction_type: 'order_used',
                reference_id: id,
                note: `Order #${id} completed`
              }]);
          }
        }
      }
    }
    
    console.log('Order status updated successfully:', data);
    res.json({ 
      success: true, 
      message: 'Order status updated successfully', 
      data: data[0]
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
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
        message: 'Both start_date and end_date are required (YYYY-MM-DD format)' 
      });
    }
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        orderitems(
          *,
          products(name, price)
        )
      `);
    
    // Add date filters
    query = query.gte('order_date', `${start_date}T00:00:00.000Z`);
    query = query.lte('order_date', `${end_date}T23:59:59.999Z`);
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error fetching orders by date:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data ? data.length : 0} orders in date range`);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error getting orders by date range:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
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
    const validMethods = ['credit', 'debit', 'cash'];
    if (!payment_method || !validMethods.includes(payment_method)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}` 
      });
    }
    
    // Check if order exists and get amount
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('order_id, final_total, payment_complete')
      .eq('order_id', id)
      .single();
    
    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return res.status(404).json({ 
        success: false, 
        message: `Order with ID ${id} not found` 
      });
    }
    
    // Check if payment already completed
    if (order.payment_complete) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment already completed for this order' 
      });
    }
    
    // Create payment transaction
    const { data: paymentData, error: paymentError } = await supabase
      .from('paymenttransaction')
      .insert([{
        order_id: id,
        amount: order.final_total,
        payment_method,
        status: 'completed',
        transaction_id: transaction_id || null,
        timestamp: new Date().toISOString(),
        processor_response: 'Payment processed successfully'
      }])
      .select();
    
    if (paymentError) {
      console.error('Error creating payment transaction:', paymentError);
      throw paymentError;
    }
    
    // Update order payment status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ payment_complete: true })
      .eq('order_id', id)
      .select();
    
    if (updateError) {
      console.error('Error updating order payment status:', updateError);
      throw updateError;
    }
    
    console.log('Payment processed successfully:', paymentData);
    res.json({ 
      success: true, 
      message: 'Payment processed successfully', 
      data: {
        order: updatedOrder[0],
        payment: paymentData[0]
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getOrdersByDateRange,
  processPayment
};