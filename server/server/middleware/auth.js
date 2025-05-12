// middleware/auth.js
const { supabase } = require("../config/supabase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Simple JWT secret - in production, this should be in env vars
const JWT_SECRET = "cafe-kiosk-secret-key";

// Simplified login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Get user with the provided email
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // SIMPLIFIED: Accept any password for now
    // In production, use: const isValid = await bcrypt.compare(password, data.password_hash);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: data.user_id,
        email: data.email,
        role: data.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Update last login timestamp
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("user_id", data.user_id);

    // Return user data and token (excluding password hash)
    const { password_hash, ...userData } = data;

    res.json({
      success: true,
      message: "Login successful",
      data: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
    });
  }
};

// Authenticate user middleware using JWT
const authenticateUser = (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. No token provided.",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Add user info to request object
    req.user = {
      user_id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    // Continue to the next middleware
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Check user role middleware
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires ${allowedRoles.join(
          " or "
        )} role.`,
      });
    }

    next();
  };
};

// User registration function
const register = async (req, res) => {
  try {
    const { email, password, name, role = "staff" } = req.body;

    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required",
      });
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate role (only allow certain roles)
    const allowedRoles = ["admin", "manager", "staff"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: hashedPassword,
        name,
        role,
        created_at: new Date().toISOString(),
        last_login: null,
        is_active: true,
      })
      .select("user_id, email, name, role, created_at, is_active")
      .single();

    if (createError) {
      console.error("User creation error:", createError);
      return res.status(500).json({
        success: false,
        message: "Failed to create user",
        error: createError.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration",
    });
  }
};

// Simple logout function
const logout = async (req, res) => {
  try {
    // Get user from request object
    const userId = req.user.user_id;
    
    // Update last activity timestamp (optional)
    try {
      await supabase
        .from("users")
        .update({ last_activity: new Date().toISOString() })
        .eq("user_id", userId);
    } catch (err) {
      console.error("Failed to update last activity:", err);
      // Continue with logout even if this fails
    }

    // Return success response
    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during logout",
    });
  }
};

// Make sure to export all necessary functions
module.exports = {
  login,
  register,
  logout,
  authenticateUser,
  authorizeRole,
};