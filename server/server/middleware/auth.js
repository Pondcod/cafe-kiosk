// middleware/auth.js
const { supabase } = require('../config/supabase');
const bcrypt = require('bcrypt');

// Authenticate user middleware
const authenticateUser = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. No token provided.' 
      });
    }
    
    // In a real application, you would verify a JWT token here
    // For this example, we'll use a simple token lookup in Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', token)
      .single();
    
    if (error || !data) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    // Add user info to request object
    req.user = data;
    
    // Update last login time
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('user_id', data.user_id);
    
    // Log user activity
    await supabase
      .from('activitylog')
      .insert([{
        user_id: data.user_id,
        action_type: 'login',
        details: `API access: ${req.method} ${req.originalUrl}`,
        ip_address: req.ip || '0.0.0.0'
      }]);
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

// Check user role middleware
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. This action requires ${allowedRoles.join(' or ')} role.` 
      });
    }
    
    next();
  };
};

// For backward compatibility with your current code
const isAuthenticated = authenticateUser;
const isAdmin = authorizeRole(['admin']);

module.exports = {
  authenticateUser,
  authorizeRole,
  isAuthenticated, // For backward compatibility
  isAdmin          // For backward compatibility
};