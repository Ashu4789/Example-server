const express = require('express');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeMiddleware = require('../middlewares/authorizeMiddleware');

const checkGroupRole = require('../middlewares/groupRoleMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/create', authorizeMiddleware('group:create'), groupController.create);
router.put('/update', checkGroupRole(['admin']), groupController.update);
router.delete('/:groupId', checkGroupRole(['admin']), groupController.deleteGroup);
router.patch('/members/add', checkGroupRole(['admin']), groupController.addMembers);
router.patch('/members/remove', checkGroupRole(['admin']), groupController.removeMembers);
router.patch('/members/role', checkGroupRole(['admin']), groupController.updateMemberRole);

router.get('/my-groups', groupController.getGroupsByUser);
router.get('/status', groupController.getGroupsByPaymentStatus);
router.get('/:groupId', checkGroupRole(['admin', 'manager', 'viewer']), groupController.getGroupById);
router.get('/:groupId/audit', checkGroupRole(['admin', 'manager', 'viewer']), groupController.getAudit);

module.exports = router;