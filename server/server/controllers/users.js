// const { supabase } = require('../config/supabase');
// const bcrypt = require('bcrypt');

// // Register new user
// const registerUser = async (req, res) => {
//   try {
//     const { email, password, username, first_name, last_name, role = 'user' } = req.body;
    
//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const password_hash = await bcrypt.hash(password, salt);
    
//     // Create user in Supabase Auth
//     const { data: authData, error: authError } = await supabase.auth.signUp({
//       email,
//       password
//     });
    
//     if (authError) throw authError;
    
//     // Create user in Users table
//     const { data, error } = await supabase
//       .from('Users')
//       .insert([{ 
//         username, 
//         email, 
//         password_hash,
//         first_name,
//         last_name,
//         role
//       }])
//       .select();
    
//     if (error) throw error;
    
//     res.status(201).json({ 
//       success: true, 
//       message: 'User registered successfully', 
//       data 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Login user
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Authenticate with Supabase Auth
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password
//     });
    
//     if (error) throw error;
    
//     // Update last login timestamp
//     await supabase
//       .from('Users')
//       .update({ last_login: new Date() })
//       .eq('email', email);
    
//     res.json({ 
//       success: true, 
//       message: 'Login successful', 
//       token: data.session.access_token,
//       user: data.user
//     });
//   } catch (error) {
//     res.status(401).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// // Get user profile
// const getUserProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const { data, error } = await supabase
//       .from('Users')
//       .select('user_id, username, email, role, first_name, last_name, created_at')
//       .eq('user_id', userId)
//       .single();
    
//     if (error) throw error;
    
//     res.json({ 
//       success: true, 
//       data 
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

// module.exports = {
//   registerUser,
//   loginUser,
//   getUserProfile
// };