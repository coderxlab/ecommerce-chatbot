const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Upload image to cloudinary
// @route   POST /upload/cloudinary
// @access  Private
const uploadToCloudinary = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    // Verify cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      res.status(500);
      throw new Error('Cloudinary configuration is missing');
    }
    console.log(req.file.path)
    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ecommerce',
    });

    // Remove file from local storage
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
    });
  } catch (error) {
    // Remove file from local storage if exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error removing temporary file:', unlinkError);
      }
    }
    
    res.status(500);
    const errorMessage = error.message || 'Unknown error occurred during upload';
    throw new Error(`Upload failed: ${errorMessage}`);
  }
});

// @desc    Upload image to local storage
// @route   POST /upload
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  res.json({
    message: 'Image uploaded successfully',
    imageUrl: `/${req.file.path}`,
  });
});

// @desc    Delete image from cloudinary
// @route   DELETE /upload/cloudinary/:id
// @access  Private/Admin
const deleteFromCloudinary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const result = await cloudinary.uploader.destroy(id);
    
    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(400);
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    res.status(500);
    throw new Error(`Delete failed: ${error.message}`);
  }
});

module.exports = {
  uploadToCloudinary,
  uploadImage,
  deleteFromCloudinary,
};
