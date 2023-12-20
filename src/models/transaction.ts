import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  wagerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wager',
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['wager', 'deposits', 'withdrawals', 'winnings'],
  },
  amount: {
    type: Number,
    required: true,
  },
  balanceChange: {
    type: String,
    required: true,
    enum: ['+', '-'],
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction;
