import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
  auctionID: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  tournamentID: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  tournamentImages: {
    type: [String],
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Watchlist = mongoose.models.Watchlist || mongoose.model('Watchlist', watchlistSchema);

export default Watchlist;
