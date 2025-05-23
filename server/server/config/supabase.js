// config/supabase.js
const { createClient } = require("@supabase/supabase-js");
require('dotenv').config();

// Your existing Supabase initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


module.exports = { supabase };
