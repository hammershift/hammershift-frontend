import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema(
  {
    buyInFee: {
      type: Number,
      required: true,
    },
    finalPrize: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Tournament = mongoose.model('Tournament', tournamentSchema);

export default Tournament;
