import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
    },
    auctionID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    userID: {
        type: Object,
        required: true,
        properties: {
            UserId: {
                type: String,
                required: true,
            },
            username: {
                type: String,
                required: true,
            },
            profilePicture: {
                type: String,
            },
        }

    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default Comment;