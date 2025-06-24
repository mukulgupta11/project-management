const Task = require("../models/Task");

/**
 * @desc    Get all tasks (Admin: all, User: only assigned tasks)
 * @route   GET /api/tasks/
 * @access  Private
 */
const getTasks = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    let tasks;
    if (req.user.role === "admin") {
      tasks = await Task.find(filter).populate(
        "assignedTo",
        "name username profileImageUrl"
      );
    } else {
      tasks = await Task.find({ ...filter, assignedTo: req.user._id }).populate(
        "assignedTo",
        "name username profileImageUrl"
      );
    }

    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoCheckList.filter((item) => item.completed).length;
        return { ...task._doc, completedTodoCount: completedCount };
      })
    );

    const baseFilter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };

    const allTasks = await Task.countDocuments(baseFilter);
    const pendingTasks = await Task.countDocuments({ ...baseFilter, status: "Pending" });
    const inProgressTasks = await Task.countDocuments({ ...baseFilter, status: "In Progress" });
    const completedTasks = await Task.countDocuments({ ...baseFilter, status: "Completed" });
    const unverifiedTasks = await Task.countDocuments({
      ...baseFilter,
      status: "Unverified",
      verifiedBy: null,
    });

    res.json({
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        unverifiedTasks,
        completedTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name username profileImageUrl"
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Create a new task (Admin only)
 * @route   POST /api/tasks/
 * @access  Private (Admin)
 */
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoCheckList,
    } = req.body;

    if (!Array.isArray(assignedTo)) {
      return res
        .status(400)
        .json({ message: "assignedTo must be an array of user IDs" });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
      todoCheckList,
      attachments,
    });

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update task details
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoCheckList = req.body.todoCheckList || task.todoCheckList;
    task.attachments = req.body.attachments || task.attachments;

    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return res
          .status(400)
          .json({ message: "assignedTo must be an array of user IDs" });
      }
      task.assignedTo = req.body.assignedTo;
    }

    const updatedTask = await task.save();
    res.json({ message: "Task updated successfully", updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete a task (Admin only)
 * @route   DELETE /api/tasks/:id
 * @access  Private (Admin)
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Verify and update task status (Admin only)
 * @route   PUT /api/tasks/:id/verify
 * @access  Private/Admin
 */
const verifyTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = "Completed";
    task.verifiedBy = req.user._id;
    task.verifiedAt = new Date();

    const updatedTask = await task.save();

    res.json({
      _id: updatedTask._id,
      title: updatedTask.title,
      status: updatedTask.status,
      verifiedBy: updatedTask.verifiedBy,
      verifiedAt: updatedTask.verifiedAt,
      message: "Task verified and marked as completed",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update task status (Members)
 * @route   PUT /api/tasks/:id/status
 * @access  Private
 */
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );
    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.user.role !== "admin" && status === "Completed") {
      return res.status(403).json({
        message: "Only admins can mark tasks as completed. Please request verification.",
      });
    }

    if (!["Pending", "In Progress","Unverified", "Completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    task.status = status;

    if (status === "Completed") {
      task.todoCheckList.forEach((item) => (item.completed = true));
      task.progress = 100;
    }

    const updatedTask = await task.save();
    res.json({ message: "Task status updated", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update checklist
 * @route   PUT /api/tasks/:id/checklist
 * @access  Private
 */
const updateTaskChecklist = async (req, res) => {

  try {
    console.log("BODY:", req.body);
    const { todoCheckList } = req.body;
    if (!Array.isArray(todoCheckList)) {
      return res.status(400).json({ message: "todoCheckList must be an array" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Defensive: check assignedTo is an array
    if (!Array.isArray(task.assignedTo)) {
      return res.status(500).json({ message: "Task assignedTo is not an array" });
    }

    // Defensive: check req.user._id exists
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const isAssigned = task.assignedTo.some(userId => userId.equals(req.user._id));
    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update checklist" });
    }

    task.todoCheckList = todoCheckList;

    const completedCount = todoCheckList.filter((item) => item.completed).length;
    const totalItems = todoCheckList.length;

    if (totalItems > 0 && completedCount === totalItems) {
      task.progress = 100;
      task.status = "Unverified";
    } else if (completedCount > 0) {
      task.progress = Math.round((completedCount / totalItems) * 90); // up to 90%
      task.status = "In Progress";
    } else {
      task.progress = 0;
      task.status = "Pending";
    }

    await task.save();

    const updatedTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name username profileImageUrl"
    );

    res.json({ message: "Checklist updated", task: updatedTask });
  } catch (error) {
    console.error("Checklist update error:", error); // <--- LOG THE ERROR
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Dashboard Data (Admin only)
 * @route   GET /api/tasks/dashboard-data
 * @access  Private
 */
const getDashboardData = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: "Pending" });
    const completedTasks = await Task.countDocuments({ status: "Completed" });
    const overdueTasks = await Task.countDocuments({
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    const unverifiedTasks = await Task.countDocuments({
      status: "Unverified",
      verifiedBy: null,
    });

    const taskStatuses = ["Pending", "In Progress", "Unverified", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      acc[status.replace(/\s/g, "")] = taskDistributionRaw.find((d) => d._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution.All = totalTasks;

    const priorities = ["Low", "Medium", "High"];
    const priorityRaw = await Task.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);
    const taskPriorityLevels = priorities.reduce((acc, p) => {
      acc[p] = priorityRaw.find((d) => d._id === p)?.count || 0;
      return acc;
    }, {});

    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    res.json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
        unverifiedTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Dashboard Data (User-specific)
 * @route   GET /api/tasks/user-dashboard-data
 * @access  Private
 */
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: "Pending" });
    const completedTasks = await Task.countDocuments({ assignedTo: userId, status: "Completed" });
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });
    const unverifiedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Unverified",
      verifiedBy: null,
    });

    const taskStatuses = ["Pending", "In Progress", "Unverified", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      acc[status.replace(/\s/g, "")] = taskDistributionRaw.find((d) => d._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution.All = totalTasks;

    const priorities = ["Low", "Medium", "High"];
    const priorityRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);
    const taskPriorityLevels = priorities.reduce((acc, p) => {
      acc[p] = priorityRaw.find((d) => d._id === p)?.count || 0;
      return acc;
    }, {});

    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    res.json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
        unverifiedTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  verifyTaskStatus,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
};
