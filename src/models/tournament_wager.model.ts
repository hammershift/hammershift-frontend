import mongoose from 'mongoose';

const subWagerSchema = new mongoose.Schema({
  auctionID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  priceGuessed: {
    type: Number,
    required: true,
  },
}, { _id: false });

const tournamentWagerSchema = new mongoose.Schema({
  tournamentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
  },
  wagers: [subWagerSchema],

  buyInAmount: {
    type: Number,
    required: true,
  },
  tournamentImages: {
    type: [String],
    required: true,
  },
  user: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fullName: String,
    username: String,
    image: String,
  },
  refunded: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  prize: {
    type: Number,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const TournamentWager = mongoose.models.tournament_wager || mongoose.model('tournament_wager', tournamentWagerSchema);

export default TournamentWager;
