const expenseDao = require('../dao/expenseDao');
const groupDao = require('../dao/groupDao');

const expenseController = {
    addExpense: async (request, response) => {
        try {
            const { description, amount, groupId, paidBy, splits } = request.body;

            // Basic Validation
            if (!description || !amount || !groupId || !paidBy || !splits) {
                return response.status(400).json({ message: "All fields are required" });
            }

            // Verify split sum matches total amount (allow small floating point diff)
            const splitSum = splits.reduce((acc, split) => acc + split.amount, 0);
            if (Math.abs(splitSum - amount) > 0.01) {
                return response.status(400).json({ message: "Split amounts do not match total amount" });
            }

            const newExpense = await expenseDao.createExpense({
                description,
                amount,
                groupId,
                paidBy,
                splits
            });

            response.status(201).json(newExpense);
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Internal server error" });
        }
    },

    getGroupExpenses: async (request, response) => {
        try {
            const { groupId } = request.params;
            const expenses = await expenseDao.getExpensesByGroupId(groupId);
            response.status(200).json(expenses);
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Error fetching expenses" });
        }
    },

    getGroupSummary: async (request, response) => {
        try {
            const { groupId } = request.params;
            const expenses = await expenseDao.getExpensesByGroupId(groupId);

            // Calculate balances
            const balances = {}; // { email: amount } (positive = receives, negative = owes)

            // Initialize balances for all involved members could be better, 
            // but let's build it dynamically from expenses for now.

            expenses.forEach(expense => {
                if (expense.isSettled) return;

                const payer = expense.paidBy;
                if (!balances[payer]) balances[payer] = 0;
                balances[payer] += expense.amount; // Payer paid full amount

                expense.splits.forEach(split => {
                    const debtor = split.email;
                    if (!balances[debtor]) balances[debtor] = 0;
                    balances[debtor] -= split.amount; // Debtor owes their share
                });
            });

            response.status(200).json(balances);
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Error calculating summary" });
        }
    },

    settleGroup: async (request, response) => {
        try {
            const { groupId } = request.body;
            await expenseDao.settleGroupExpenses(groupId);
            response.status(200).json({ message: "Group settled successfully" });
        } catch (error) {
            console.error(error);
            response.status(500).json({ message: "Error settling group" });
        }
    }
};

module.exports = expenseController;
