const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
    squadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Squad',
        required: true,
        index: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: String,
        default: 'Ne yiyelim? 🍽️'
    },
    options: [{
        foodType: {
            type: String,
            required: true
        },
        votes: {
            type: Number,
            default: 0
        }
    }],
    voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    winner: {
        type: String, // Winning foodType
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Poll expires after 1 hour automatically if not touched
    }
});

// Calculate winner before saving if completed
PollSchema.pre('save', function (next) {
    if (this.status === 'completed' && !this.winner) {
        // Find option with max votes
        let maxVotes = -1;
        let winningOption = null;

        for (const option of this.options) {
            if (option.votes > maxVotes) {
                maxVotes = option.votes;
                winningOption = option.foodType;
            }
        }

        this.winner = winningOption;
    }
    next();
});

module.exports = mongoose.model('Poll', PollSchema);
