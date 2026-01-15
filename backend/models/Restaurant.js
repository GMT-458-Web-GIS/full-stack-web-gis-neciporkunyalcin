const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [255, 'Name can not be more than 255 characters']
  },
  cuisine_type: {
    type: String,
    required: false,
    maxlength: 50
  },
  cuisineTypes: {
    type: [String],
    default: [],
    index: true
  },
  price_range: {
    type: String,
    required: false,
    maxlength: 50
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  phone: {
    type: String,
    maxlength: 20
  },
  opening_hours: {
    type: Map,
    of: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
    index: true
  },
  total_reviews: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

RestaurantSchema.statics.findNearby = function (lat, lon, radius) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lon, lat]
        },
        $maxDistance: radius
      }
    }
  });
};

RestaurantSchema.index({ location: '2dsphere' });

// Reverse populate with virtuals if needed for reviews later
// RestaurantSchema.virtual('reviews', {
//   ref: 'Review',
//   localField: '_id',
//   foreignField: 'restaurant',
//   justOne: false
// });

module.exports = mongoose.model('Restaurant', RestaurantSchema);