import mongoose from 'mongoose';

const walletBalanceSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  balance: {
    type: Number,
    default: 100,
  },
  // add more fields if necessary
});

const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', walletBalanceSchema);

export default Wallet;
