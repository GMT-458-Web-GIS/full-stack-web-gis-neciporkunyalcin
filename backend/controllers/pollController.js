const Poll = require('../models/Poll');
const Restaurant = require('../models/Restaurant');
const Squad = require('../models/Squad');
const User = require('../models/User');

// Create a new poll
exports.createPoll = async (req, res) => {
    try {
        const { squadId, question, options } = req.body;

        // Validate squad membership
        const squad = await Squad.findById(squadId);
        if (!squad) {
            return res.status(404).json({ success: false, message: 'Squad not found' });
        }

        const isMember = squad.members.some(m => m.user_id.toString() === req.user.id);
        if (!isMember) {
            return res.status(401).json({ success: false, message: 'Not a member of this squad' });
        }

        const poll = await Poll.create({
            squadId,
            creator: req.user.id,
            question: question || 'Where should we eat?',
            options: options.map(opt => ({ foodType: opt, votes: 0 }))
        });

        res.status(201).json({
            success: true,
            data: poll
        });

    } catch (error) {
        console.error('Error in createPoll:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Vote in a poll
exports.votePoll = async (req, res) => {
    try {
        const { pollId, optionId } = req.body;

        const poll = await Poll.findById(pollId);
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }

        if (poll.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Poll is closed' });
        }

        // Check if already voted
        if (poll.voters.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'You have already voted' });
        }

        // Register vote
        const option = poll.options.id(optionId);
        if (!option) {
            return res.status(404).json({ success: false, message: 'Option not found' });
        }

        option.votes += 1;
        poll.voters.push(req.user.id);

        await poll.save();

        res.status(200).json({
            success: true,
            message: 'Vote cast',
            data: poll
        });

    } catch (error) {
        console.error('Error in votePoll:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Resolve poll and get recommendations
exports.resolvePoll = async (req, res) => {
    try {
        const { pollId } = req.params;

        let poll = await Poll.findById(pollId);
        if (!poll) {
            return res.status(404).json({ success: false, message: 'Poll not found' });
        }

        // Mark as completed to trigger winner calculation (pre-save hook)
        poll.status = 'completed';
        await poll.save();

        // Recommendation Engine using $in operator
        const winnerCuisine = poll.winner;
        let recommendations = [];

        if (winnerCuisine) {
            recommendations = await Restaurant.find({
                $or: [
                    { cuisine_type: winnerCuisine },
                    { cuisineTypes: { $in: [winnerCuisine] } }
                ]
            })
                .sort({ rating: -1 })
                .limit(5);
        }

        res.status(200).json({
            success: true,
            message: `Poll completed! Winner: ${winnerCuisine}`,
            winner: winnerCuisine,
            recommendations
        });

    } catch (error) {
        console.error('Error in resolvePoll:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get poll details
exports.getPoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });
        res.json({ success: true, data: poll });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
