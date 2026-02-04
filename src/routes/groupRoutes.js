const express = require('express');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

//  Protect all group routes
router.use(authMiddleware.protect);

router.post('/create', groupController.create);
router.put('/update', groupController.updateGroup);
router.put('/add-members', groupController.addMembers);
router.put('/remove-members', groupController.removeMembers);

router.get('/by-email/:email', groupController.getGroupByEmail);
router.get('/by-status/:status', groupController.getGroupByStatus);
router.get('/audit/:groupId', groupController.getAuditLog);

module.exports = router;
