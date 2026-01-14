const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  photos: [{
    type: String // URL to photo
  }],
  tags: [{
    type: String,
    enum: ['spicy', 'vegan', 'halal', 'cozy', 'romantic', 'family-friendly',
      'quiet', 'lively', 'authentic', 'fast-service', 'budget-friendly']
  }],
  likes: {
    type: Number,
    default: 0
  },
  liked_by: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    text: String,
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  visit_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ restaurant_id: 1, created_at: -1 });
reviewSchema.index({ user_id: 1, created_at: -1 });
reviewSchema.index({ rating: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;