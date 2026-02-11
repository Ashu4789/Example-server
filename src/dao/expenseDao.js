const Expense = require('../model/Expense');

const expenseDao = {
    createExpense: async (data) => {
        const newExpense = new Expense(data);
        return await newExpense.save();
    },

    getExpensesByGroupId: async (groupId) => {
        return await Expense.find({ groupId }).sort({ date: -1 });
    },

    settleGroupExpenses: async (groupId) => {
        return await Expense.updateMany(
            { groupId, isSettled: false },
            { $set: { isSettled: true } }
        );
    }
};

module.exports = expenseDao;
