const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    paidBy: { type: String, required: true }, // Email of the payer
    splits: [{
        email: { type: String, required: true },
        amount: { type: Number, required: true }
    }],
    isSettled: { type: Boolean, default: false }
});

module.exports = mongoose.model('Expense', expenseSchema);
