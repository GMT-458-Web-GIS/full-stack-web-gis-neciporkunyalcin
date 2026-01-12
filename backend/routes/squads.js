const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Squad = require('../models/Squad');

// Create squad
router.post('/', auth, async (req, res) => {
  const squad = await Squad.create({
    name: req.body.name,
    squad_type: req.body.squad_type,
    creator_id: req.user.id,
    members: [{
      user_id: req.user.id,
      username: req.user.username,
      current_location: {
        coordinates: req.body.coordinates
      }
    }]
  });

  res.status(201).json({
    success: true,
    data: squad
  });
});

// My squads
router.get('/my', auth, async (req, res) => {
  const squads = await Squad.find({
    'members.user_id': req.user.id
  });

  res.json({
    success: true,
    data: squads
  });
});

module.exports = router;
