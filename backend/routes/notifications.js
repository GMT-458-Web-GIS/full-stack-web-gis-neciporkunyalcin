const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getNotifications, markAsRead, respondToInvite } = require('../controllers/notificationController');

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/respond', respondToInvite);

module.exports = router;
