const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile, uploadProfileImage } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Auth Routes
router.post("/register", registerUser);           // Register User
router.post("/login", loginUser);                 // Login User
router.get("/profile", protect, getUserProfile);  // Get User Profile
router.put("/profile", protect, updateUserProfile); // Update Profile
router.post("/upload-image", upload.single("image"), uploadProfileImage);

module.exports = router;
