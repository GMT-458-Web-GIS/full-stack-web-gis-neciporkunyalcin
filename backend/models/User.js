const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    maxlength: [50, 'Username can not be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Don't return password by default
  },
  user_type: {
    type: String,
    enum: ['free', 'premium', 'restaurant_owner', 'admin'],
    default: 'free'
  },
  total_xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

UserSchema.statics.updateXP = async function (userId, xp) {
  const user = await this.findById(userId);
  if (user) {
    user.total_xp += xp;
    return await user.save();
  }
  return null;
};

UserSchema.index({ location: '2dsphere' });

// Calculate level based on XP before saving
UserSchema.pre('save', function (next) {
  if (this.isModified('total_xp')) {
    this.level = Math.floor(this.total_xp / 100) + 1;
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);