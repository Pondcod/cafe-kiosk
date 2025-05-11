// controllers/notifications.js
const { supabase } = require("../config/supabase");

// Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const { user_id, is_read, type } = req.query;

    let query = supabase.from("notification").select("*");

    // Apply filters if provided
    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    if (is_read !== undefined) {
      query = query.eq("is_read", is_read === "true");
    }

    if (type) {
      query = query.eq("type", type);
    }

    // Order by newest first
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create notification
const createNotification = async (req, res) => {
  try {
    const { user_id, message, type, content, is_read } = req.body;

    // Validate required fields
    if (!message || !type) {
      return res.status(400).json({
        success: false,
        message: "Message and type are required",
      });
    }

    const { data, error } = await supabase
      .from("notification")
      .insert([
        {
          user_id: user_id || null,
          message,
          type,
          content: content || null,
          is_read: is_read !== undefined ? is_read : false,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("notification")
      .update({ is_read: true })
      .eq("notification_id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Notification with ID ${id} not found`,
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      data: data[0],
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if notification exists
    const { data: existingData, error: checkError } = await supabase
      .from("notification")
      .select("notification_id")
      .eq("notification_id", id);

    if (checkError) throw checkError;

    if (!existingData || existingData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Notification with ID ${id} not found`,
      });
    }

    // Delete the notification
    const { error } = await supabase
      .from("notification")
      .delete()
      .eq("notification_id", id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const { user_id } = req.body;

    let query = supabase.from("notification").update({ is_read: true });

    // If user_id provided, only mark that user's notifications
    if (user_id) {
      query = query.eq("user_id", user_id);
    } else {
      // If no user_id, mark all where user_id is null (system notifications)
      query = query.is("user_id", null);
    }

    const { error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
  markAllAsRead,
};
