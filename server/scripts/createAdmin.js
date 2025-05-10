// server/scripts/createAdmin.js
const { supabase } = require("../config/supabase");
const bcrypt = require("bcrypt");

const createAdmin = async () => {
  try {
    console.log("Starting admin user creation...");
    
    // First check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", "admin@example.com")
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking if admin exists:", checkError);
      return;
    }

    if (existingAdmin) {
      console.log("Admin user already exists with ID:", existingAdmin.user_id);
      return;
    }
    
    console.log("No existing admin found, creating new admin user...");

    // Hash the password using bcrypt
    const saltRounds = 10;
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create admin user with hashed password
    const adminUser = {
      username: "admin",
      email: "admin@example.com",
      password_hash: hashedPassword, // Hashed for security
      role: "admin",
      first_name: "Admin",
      last_name: "User",
      activate_status: true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("users")
      .insert([adminUser])
      .select();

    if (error) {
      console.error("Error creating admin user:", error);
    } else {
      console.log("Admin user created successfully with ID:", data[0].user_id);
      console.log("Admin credentials:");
      console.log("Email: admin@example.com");
      console.log("Password: admin123");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
};

// Execute the function
createAdmin();