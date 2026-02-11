const express = require('express');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');

const checkGroupRole = require('../middlewares/groupRoleMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

// Ping route for debugging
router.get('/ping', (req, res) => res.json({ message: 'pong' }));

router.post('/add', checkGroupRole(['admin', 'manager']), expenseController.addExpense);
router.get('/group/:groupId', checkGroupRole(['admin', 'manager', 'viewer']), expenseController.getGroupExpenses);
router.get('/group/:groupId/summary', checkGroupRole(['admin', 'manager', 'viewer']), expenseController.getGroupSummary);
router.post('/settle', checkGroupRole(['admin', 'manager']), expenseController.settleGroup);

module.exports = router;
