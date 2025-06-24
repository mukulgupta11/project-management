const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { uploadAttachments, listAttachments, downloadAttachmentById } = require('../controllers/attachmentController');
const { protect } = require('../middlewares/authMiddleware');

// Upload multiple files to a task
router.post('/:taskId', protect, upload.array('files'), uploadAttachments);

// List attachments for a task
router.get('/:taskId', protect, listAttachments);

// Download attachment by ID
router.get('/download/:attachmentId', protect, downloadAttachmentById);

module.exports = router;