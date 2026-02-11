const express = require('express');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/add', expenseController.addExpense);
router.get('/group/:groupId', expenseController.getGroupExpenses);
router.get('/group/:groupId/summary', expenseController.getGroupSummary);
router.post('/settle', expenseController.settleGroup);

module.exports = router;
