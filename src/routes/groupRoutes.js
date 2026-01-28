const express = require('express');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Create a new group
router.post('/create', authMiddleware.protect, groupController.create);
module.exports = router;