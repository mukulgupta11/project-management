const express = require("express");
const { adminOnly, protect } = require("../middlewares/authMiddleware");
const { getUsers, getUserById, deleteUser } = require("../controllers/userController");

const router = express.Router();

// User Management Routes
router.get("/", protect, adminOnly, getUsers);             // Get all users (Admin only)
router.get("/:id", protect, getUserById);                  // Get single user by ID (Admin only)
router.delete("/:id", protect, adminOnly, deleteUser);     // Delete user (Admin only)

module.exports = router;
