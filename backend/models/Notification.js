const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['squad_invite', 'poll_started', 'system'],
        required: true
    },
    data: {
        squadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Squad' },
        squadName: String,
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        senderName: String
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // Auto delete after 7 days
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
