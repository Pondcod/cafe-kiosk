// controllers/users.js
const { supabase } = require('../config/supabase');
const bcrypt = require('bcrypt');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    console.log('Getting all users');
    
    // Don't include password_hash in the response
    const { data, error } = await supabase
      .from('users')
      .select('user_id, username, email, role, first_name, last_name, activate_status, last_login, created_at');
    
    if (error) {
      console.error('Supabase error fetching users:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data ? data.length : 0} users`);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting user with ID: ${id}`);
    
    // Don't include password_hash in the response
    const { data, error } = await supabase
      .from('users')
      .select('user_id, username, email, role, first_name, last_name, activate_status, last_login, created_at')
      .eq('user_id', id);
    
    if (error) {
      console.error('Supabase error fetching user:', error);
      throw error;
    }
    
    // Check if any data was returned
    if (!data || data.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `User with ID ${id} not found` 
      });
    }
    
    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { username, email, password, role, first_name, last_name } = req.body;
    console.log('Creating user with data:', { username, email, role, first_name, last_name });
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email and password are required' 
      });
    }
    
    // Check if username or email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('user_id')
      .or(`username.eq.${username},email.eq.${email}`);
    
    if (checkError) {
      console.error('Error checking existing user:', checkError);
      throw checkError;
    }
    
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }
    
    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Set default role if not provided
    const userRole = role || 'user';
    
    // Insert the new user
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        username, 
        email, 
        password_hash, 
        role: userRole,
        first_name, 
        last_name,
        activate_status: false,
        created_at: new Date().toISOString()
      }])
      .select('user_id, username, email, role, first_name, last_name, activate_status, last_login, created_at');
    
    if (error) {
      console.error('Supabase error creating user:', error);
      throw error;
    }
    
    console.log('User created successfully:', data);
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully', 
      data: data[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role, first_name, last_name, activate_status } = req.body;
    console.log(`Updating user ${id} with data:`, { username, email, role, first_name, last_name, activate_status });
    
    // First check if the user exists
    const { data: existingData, error: checkError } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', id);
    
    if (checkError) {
      console.error('Error checking user:', checkError);
      throw checkError;
    }
    
    if (!existingData || existingData.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `User with ID ${id} not found` 
      });
    }
    
    // Build update object with only provided fields
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) {
      const saltRounds = 10;
      updateData.password_hash = await bcrypt.hash(password, saltRounds);
    }
    if (role !== undefined) updateData.role = role;
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (activate_status !== undefined) updateData.activate_status = activate_status;
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', id)
      .select('user_id, username, email, role, first_name, last_name, activate_status, last_login, created_at');
    
    if (error) {
      console.error('Supabase error updating user:', error);
      throw error;
    }
    
    console.log('User updated successfully:', data);
    res.json({ 
      success: true, 
      message: 'User updated successfully', 
      data: data[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting user with ID: ${id}`);
    
    // First check if the user exists
    const { data: existingData, error: checkError } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', id);
    
    if (checkError) {
      console.error('Error checking user:', checkError);
      throw checkError;
    }
    
    if (!existingData || existingData.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `User with ID ${id} not found` 
      });
    }
    
    // Delete the user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', id);
    
    if (error) {
      console.error('Supabase error deleting user:', error);
      throw error;
    }
    
    console.log('User deleted successfully');
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Authentication function (login)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Get user with the provided email
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, data.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user account is activated
    if (!data.activate_status) {
      return res.status(401).json({
        success: false,
        message: 'Account is not activated'
      });
    }
    
    // Update last login timestamp
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('user_id', data.user_id);
    
    // Create activity log entry
    await supabase
      .from('activitylog')
      .insert([{
        user_id: data.user_id,
        action_type: 'login',
        details: 'User logged in',
        ip_address: req.ip || '0.0.0.0'
      }]);
    
    // Return user data (excluding password hash)
    const { password_hash, ...userData } = data;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login
};