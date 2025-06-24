const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Attachment = require('../models/Attachment');
const Task = require('../models/Task');

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

/**
 * @desc    Upload an attachment
 * @route   POST /api/attachments/upload
 * @access  Private
 */
const uploadAttachment = (req, res) => {
    // Multer middleware handles the file upload
    upload.single('attachment')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: `Multer error: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ message: `Unknown error: ${err.message}` });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // File uploaded successfully, return its path/URL
        const fileUrl = `/uploads/${req.file.filename}`;
        res.status(200).json({ message: "File uploaded successfully", filePath: fileUrl });
    });
};

/**
 * @desc    Download an attachment
 * @route   GET /api/attachments/download/:filename
 * @access  Private
 */
const downloadAttachment = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath, (err) => {
            if (err) {
                if (res.headersSent) {
                    console.error("Error sending file, headers already sent:", err);
                } else {
                    res.status(500).json({ message: "Error downloading file", error: err.message });
                }
            }
        });
    } else {
        res.status(404).json({ message: "File not found" });
    }
};

// Multi-file upload for a task
const uploadAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only admin or assigned member can upload
    if (
      req.user.role !== 'admin' &&
      !task.assignedTo.map(String).includes(String(userId))
    ) {
      return res.status(403).json({ message: 'Not authorized for this task' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Save each file as an Attachment
    const attachments = await Promise.all(
      req.files.map(file =>
        Attachment.create({
          task: taskId,
          uploadedBy: userId,
          originalName: file.originalname,
          filePath: `/uploads/${file.filename}`,
        })
      )
    );
    res.status(201).json({ message: 'Files uploaded', attachments });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

// List attachments for a task
const listAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only admin or assigned member can view
    if (
      req.user.role !== 'admin' &&
      !task.assignedTo.map(String).includes(String(req.user._id))
    ) {
      return res.status(403).json({ message: 'Not authorized for this task' });
    }

    const attachments = await Attachment.find({ task: taskId }).populate('uploadedBy', 'name');
    res.json(attachments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch attachments', error: err.message });
  }
};

// Download attachment by ID
const downloadAttachmentById = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const attachment = await Attachment.findById(attachmentId).populate('task');
    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

    // Only admin or assigned member can download
    const userId = req.user._id;
    const task = attachment.task;
    if (
      req.user.role !== 'admin' &&
      !task.assignedTo.map(String).includes(String(userId))
    ) {
      return res.status(403).json({ message: 'Not authorized for this task' });
    }

    const filePath = path.join(uploadsDir, path.basename(attachment.filePath));
    if (fs.existsSync(filePath)) {
      res.download(filePath, attachment.originalName);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Download failed', error: err.message });
  }
};

module.exports = { uploadAttachment, downloadAttachment, uploadAttachments, listAttachments, downloadAttachmentById }; 