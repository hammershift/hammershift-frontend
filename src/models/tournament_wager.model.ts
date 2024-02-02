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
}, { timestamps: true });

const TournamentWager = mongoose.models.TournamentWager || mongoose.model('tournament_wagers', tournamentWagerSchema);

export default TournamentWager;
