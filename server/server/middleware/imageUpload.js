// middleware/imageUpload.js
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { supabase } = require("../config/supabase");

// Configure multer for temporary file storage
const storage = multer.memoryStorage();

// Set file size limits and file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG and WebP are allowed."),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: fileFilter,
});

// Middleware for handling single image upload
const handleImageUpload = async (req, res, next) => {
  // Check if there's a file to upload
  if (!req.file) {
    return next();
  }

  try {
    // Generate unique filename
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: "3600",
      });

    if (error) {
      console.error("Error uploading image to storage:", error);
      return res.status(500).json({
        success: false,
        message: "Error uploading image",
      });
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    // Attach image URL to request body
    req.body.img_url = urlData.publicUrl;
    next();
  } catch (error) {
    console.error("Image processing error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing image",
    });
  }
};

// Export middleware
const singleImageUpload = upload.single("image");
module.exports = { singleImageUpload, handleImageUpload };
