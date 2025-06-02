const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  uploadToCloudinary,
  uploadImage,
  deleteFromCloudinary,
} = require('../controllers/uploadController');

// Upload to local storage
router.post('/', protect, upload.single('image'), uploadImage);

// Upload to cloudinary
router.post('/cloudinary', protect, upload.single('image'), uploadToCloudinary);

// Delete from cloudinary
router.delete('/cloudinary/:id', protect, admin, deleteFromCloudinary);

module.exports = router;
