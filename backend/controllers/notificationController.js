const Notification = require('../models/Notification');
const Squad = require('../models/Squad');
const User = require('../models/User');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.respondToInvite = async (req, res) => {
    try {
        const { notificationId, accept } = req.body;
        const notification = await Notification.findById(notificationId);

        if (!notification) return res.status(404).json({ success: false, message: 'Not found' });
        if (notification.recipient.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Unauthorized' });

        if (accept && notification.type === 'squad_invite') {
            const squad = await Squad.findById(notification.data.squadId);
            if (squad) {
                // Add user to squad
                if (!squad.members.some(m => m.user_id.toString() === req.user.id)) {
                    const user = await User.findById(req.user.id);
                    squad.members.push({
                        user_id: user._id,
                        username: user.username,
                        current_location: {
                            type: 'Point',
                            coordinates: user.location?.coordinates || [32.8597, 39.9334]
                        }
                    });
                    await squad.save();
                }
            }
        }

        // Delete notification after response
        await notification.deleteOne();

        res.status(200).json({ success: true, message: accept ? 'Joined squad' : 'Declined' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
