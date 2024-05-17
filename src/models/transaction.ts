import mongoose from 'mongoose';

const TransactionType = {
  WAGER: 'wager',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  WINNINGS: 'winnings',
  REFUND: 'refund',
  TOURNAMENT_BUY_IN: 'tournament buy-in',
  PROCESSING_FEE: 'processing fee',
};

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
  auctionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
  },
  auction_id: {
    type: String,
  },
  tournamentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['wager', 'deposit', 'withdraw', 'winnings', 'refund', 'tournament buy-in', 'processing_fee'],
    // enum: Object.values(TransactionType),
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
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
