const Challenge = require('../models/Challenge');
const User = require('../models/User');

// Get all active challenges
exports.getActiveChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ 
      is_active: true,
      $or: [
        { end_date: { $gte: new Date() } },
        { end_date: null }
      ]
    }).sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      count: challenges.length,
      data: challenges
    });
  } catch (error) {
    console.error('Error in getActiveChallenges:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get challenge by ID
exports.getChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    res.status(200).json({
      success: true,
      data: challenge
    });
  } catch (error) {
    console.error('Error in getChallenge:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create challenge
exports.createChallenge = async (req, res) => {
  try {
    const challengeData = {
      ...req.body,
      created_by: {
        user_id: req.user.id,
        username: req.user.username
      }
    };

    const challenge = await Challenge.create(challengeData);

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: challenge
    });
  } catch (error) {
    console.error('Error in createChallenge:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Join challenge
exports.joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if user already joined
    const alreadyJoined = challenge.participants.some(
      p => p.user_id === req.user.id
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this challenge'
      });
    }

    // Add user to participants
    challenge.participants.push({
      user_id: req.user.id,
      username: req.user.username,
      progress: {
        current: 0,
        total: challenge.requirements.visit_count || 1
      },
      visited_locations: [],
      completed: false
    });

    challenge.community_stats.total_participants += 1;
    await challenge.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined challenge',
      data: challenge
    });
  } catch (error) {
    console.error('Error in joinChallenge:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update challenge progress
exports.updateProgress = async (req, res) => {
  try {
    const { restaurant_id, restaurant_name } = req.body;
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Find user's participation
    const participation = challenge.participants.find(
      p => p.user_id === req.user.id
    );

    if (!participation) {
      return res.status(400).json({
        success: false,
        message: 'You have not joined this challenge'
      });
    }

    if (participation.completed) {
      return res.status(400).json({
        success: false,
        message: 'Challenge already completed'
      });
    }

    // Add visited location
    participation.visited_locations.push({
      restaurant_id,
      restaurant_name,
      visited_at: new Date()
    });

    participation.progress.current += 1;

    // Check if completed
    if (participation.progress.current >= participation.progress.total) {
      participation.completed = true;
      participation.completed_at = new Date();
      
      // Update community stats
      challenge.community_stats.total_completed += 1;
      challenge.community_stats.completion_rate = 
        (challenge.community_stats.total_completed / challenge.community_stats.total_participants) * 100;

      // Award XP
      await User.updateXP(req.user.id, challenge.rewards.xp);
    }

    await challenge.save();

    res.status(200).json({
      success: true,
      message: participation.completed 
        ? `Challenge completed! +${challenge.rewards.xp} XP` 
        : 'Progress updated',
      data: {
        challenge,
        completed: participation.completed,
        xp_earned: participation.completed ? challenge.rewards.xp : 0
      }
    });
  } catch (error) {
    console.error('Error in updateProgress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's challenges
exports.getUserChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({
      'participants.user_id': req.user.id
    });

    const userChallenges = challenges.map(challenge => {
      const participation = challenge.participants.find(
        p => p.user_id === req.user.id
      );
      return {
        ...challenge.toObject(),
        user_participation: participation
      };
    });

    res.status(200).json({
      success: true,
      count: userChallenges.length,
      data: userChallenges
    });
  } catch (error) {
    console.error('Error in getUserChallenges:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};