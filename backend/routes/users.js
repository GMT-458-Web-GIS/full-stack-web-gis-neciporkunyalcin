const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { updateLocation } = require('../controllers/userController');

router.get('/me', auth, async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

router.put('/location', auth, updateLocation);

router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.getLeaderboard(50);
    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
