import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const tournamentWinnerSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  },
  username: {
    type: String,
  },
  userImage: {
    type: String,
  },
  prize: {
    type: Number,
  },
  rank: {
    type: Number,
  },
  winningDate: {
    type: Date,
    default: Date.now,
  },
});

const tournamentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    buyInFee: {
      type: Number,
      required: true,
    },
    winners: [tournamentWinnerSchema],
    pot: {
      type: Number,
      default: 0,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    tournamentEndTime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Tournaments = mongoose.models.tournaments || mongoose.model('tournaments', tournamentSchema);

export default Tournaments;
