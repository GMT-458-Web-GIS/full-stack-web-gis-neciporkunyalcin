const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Challenge = require('../models/Challenge');

// Active challenges
router.get('/active', async (req, res) => {
  const challenges = await Challenge.find({ is_active: true });
  res.json({ success: true, data: challenges });
});

// Create challenge
router.post('/', auth, async (req, res) => {
  const challenge = await Challenge.create({
    ...req.body,
    created_by: {
      user_id: req.user.id,
      username: req.user.username
    }
  });

  res.status(201).json({
    success: true,
    data: challenge
  });
});

module.exports = router;
