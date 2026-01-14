const mongoose = require('mongoose');

const squadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  squad_type: {
    type: String,
    enum: ['casual', 'special_occasion', 'business', 'family'],
    default: 'casual'
  },
  creator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: String,
    preferences: {
      budget_min: Number,
      budget_max: Number,
      cuisine_preferences: [String],
      dietary_restrictions: [String],
      max_distance: Number,
      atmosphere: String
    },
    current_location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    joined_at: {
      type: Date,
      default: Date.now
    }
  }],
  current_session: {
    is_active: {
      type: Boolean,
      default: false
    },
    started_at: Date,
    decision_deadline: Date,
    suggested_restaurants: [{
      restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
      restaurant_name: String,
      location: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: [Number]
      },
      votes: {
        upvotes: [{
          user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          timestamp: Date
        }],
        downvotes: [{
          user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          timestamp: Date
        }],
        super_likes: [{
          user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          timestamp: Date
        }]
      },
      total_score: {
        type: Number,
        default: 0
      },
      avg_distance_to_members: Number
    }],
    final_decision: {
      restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
      restaurant_name: String,
      decided_at: Date,
      decision_method: {
        type: String,
        enum: ['voting', 'roulette', 'admin_choice']
      }
    }
  },
  squad_stats: {
    total_meetings: {
      type: Number,
      default: 0
    },
    favorite_restaurant: {
      restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
      restaurant_name: String,
      visit_count: Number
    },
    avg_spending_per_person: Number,
    favorite_cuisine: String,
    longest_decision_time: Number, // minutes
    fastest_decision_time: Number
  },
  meeting_history: [{
    restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    restaurant_name: String,
    date: Date,
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // user IDs
    decision_time: Number, // minutes
    total_spent: Number
  }]
}, {
  timestamps: true
});

// Indexes
squadSchema.index({ creator_id: 1 });
squadSchema.index({ 'members.user_id': 1 });
squadSchema.index({ 'current_session.is_active': 1 });

const Squad = mongoose.model('Squad', squadSchema);

module.exports = Squad;