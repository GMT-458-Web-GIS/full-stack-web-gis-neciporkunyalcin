const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createPoll,
    votePoll,
    resolvePoll,
    getPoll
} = require('../controllers/pollController');

router.post('/', auth, createPoll);
router.post('/vote', auth, votePoll);
router.post('/:pollId/resolve', auth, resolvePoll);
router.get('/:id', auth, getPoll);

module.exports = router;
