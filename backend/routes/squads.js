const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createSquad,
  getUserSquads,
  getSquad,
  addMember,
  startSession,
  vote,
  finalizeDecision,
  foodRoulette,
  inviteMember
} = require('../controllers/squadController');

router.post('/', auth, createSquad);
router.get('/my', auth, getUserSquads);
router.get('/:id', auth, getSquad);
router.post('/:id/members', auth, addMember);
router.post('/:id/invite', auth, inviteMember);
router.post('/:id/session/start', auth, startSession);
router.post('/:id/vote', auth, vote);
router.post('/:id/decision/finalize', auth, finalizeDecision);
router.post('/:id/roulette', auth, foodRoulette);

module.exports = router;
