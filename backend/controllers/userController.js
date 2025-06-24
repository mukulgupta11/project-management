const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");


// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    // Add task counts to each user
    const users = await User.find({ role: "member" }).select("-password");

    const usersWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        const pendingTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Pending",
        });
    
        const inProgressTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "In Progress",
        });
    
        // All completed tasks
        const completedTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Completed",
        });
    
        // Completed but NOT verified
        const unverifiedCompletedTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Completed",
          verifiedBy: null,
        });
    
        // Completed AND verified
        const verifiedCompletedTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Completed",
          verifiedBy: { $exists: true, $ne: null },
        });
    
        return {
          ...user._doc,
          pendingTasks,
          inProgressTasks,
          completedTasks,
          unverifiedCompletedTasks,
          verifiedCompletedTasks,
        };
      })
    );
    res.json(usersWithTaskCounts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = { getUsers, getUserById, deleteUser };
