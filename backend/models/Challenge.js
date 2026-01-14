const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['solo', 'friend', 'community', 'seasonal'],
    required: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  requirements: {
    visit_count: Number,
    cuisine_types: [String],
    specific_restaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
    time_constraint: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom']
    },
    custom_days: Number,
    tags_required: [String],
    min_rating: Number,
    budget_max: Number
  },
  rewards: {
    xp: {
      type: Number,
      required: true
    },
    badge: {
      name: String,
      icon: String
    },
    special_reward: String
  },
  start_date: {
    type: Date,
    default: Date.now
  },
  end_date: Date,
  is_active: {
    type: Boolean,
    default: true
  },
  participants: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: String,
    progress: {
      current: {
        type: Number,
        default: 0
      },
      total: Number
    },
    visited_locations: [{
      restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
      restaurant_name: String,
      visited_at: Date
    }],
    completed: {
      type: Boolean,
      default: false
    },
    completed_at: Date,
    started_at: {
      type: Date,
      default: Date.now
    }
  }],
  created_by: {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String
  },
  community_stats: {
    total_participants: {
      type: Number,
      default: 0
    },
    total_completed: {
      type: Number,
      default: 0
    },
    completion_rate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
challengeSchema.index({ type: 1, is_active: 1 });
challengeSchema.index({ 'participants.user_id': 1 });
challengeSchema.index({ end_date: 1 });

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;