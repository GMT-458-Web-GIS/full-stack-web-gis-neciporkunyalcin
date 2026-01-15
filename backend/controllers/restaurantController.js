const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Review = require('../models/Review');

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ rating: -1 }).limit(100);

    // Transform data to match previous interface if needed, or leave as is
    // The previous one returned specific fields.
    const data = restaurants.map(r => ({
      id: r._id,
      name: r.name,
      cuisine_type: r.cuisine_type,
      price_range: r.price_range,
      rating: r.rating,
      longitude: r.location.coordinates[0],
      latitude: r.location.coordinates[1]
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('Error in getAllRestaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get nearby restaurants
exports.getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lon, radius = 2000, cuisine_type, price_range, min_rating } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lon), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    };

    if (cuisine_type) query.cuisine_type = cuisine_type;
    if (price_range) query.price_range = price_range;
    if (min_rating) query.rating = { $gte: parseFloat(min_rating) };

    const restaurants = await Restaurant.find(query);

    const data = restaurants.map(r => ({
      id: r._id,
      name: r.name,
      cuisine_type: r.cuisine_type,
      price_range: r.price_range,
      rating: r.rating,
      total_reviews: r.total_reviews,
      longitude: r.location.coordinates[0],
      latitude: r.location.coordinates[1],
      address: r.address,
      phone: r.phone
      // Mongoose $near sorts by distance by default
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('Error in getNearbyRestaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single restaurant
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...restaurant.toObject(),
        id: restaurant._id,
        longitude: restaurant.location.coordinates[0],
        latitude: restaurant.location.coordinates[1]
      }
    });
  } catch (error) {
    console.error('Error in getRestaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const { name, cuisine_type, cuisineTypes, price_range, lat, lon, address, phone } = req.body;

    // Validation
    if (!name || !lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Name, latitude, and longitude are required'
      });
    }

    const restaurant = await Restaurant.create({
      name,
      cuisine_type,
      cuisineTypes: cuisineTypes || [],
      price_range,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lon), parseFloat(lat)]
      },
      address,
      phone,
      owner: req.user.id
    });

    // Award XP to user for adding restaurant
    const user = await User.findById(req.user.id);
    if (user) {
      user.total_xp += 100;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully! +100 XP',
      data: restaurant
    });
  } catch (error) {
    console.error('Error in createRestaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Search restaurants
exports.searchRestaurants = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Simple regex search for name or cuisine
    const restaurants = await Restaurant.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { cuisine_type: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);

    const data = restaurants.map(r => ({
      id: r._id,
      name: r.name,
      cuisine_type: r.cuisine_type,
      price_range: r.price_range,
      rating: r.rating,
      longitude: r.location.coordinates[0],
      latitude: r.location.coordinates[1],
      address: r.address
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('Error in searchRestaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const { name, cuisine_type, price_range, address, phone } = req.body;

    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Make sure user is restaurant owner
    if (restaurant.owner.toString() !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this restaurant'
      });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('Error in updateRestaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Make sure user is restaurant owner
    if (restaurant.owner.toString() !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this restaurant'
      });
    }

    await restaurant.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Restaurant removed'
    });
  } catch (error) {
    console.error('Error in deleteRestaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Check-in to restaurant (award XP)
exports.checkIn = async (req, res) => {
  try {
    const { restaurant_id } = req.body;

    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required'
      });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Award XP for check-in
    const user = await User.findById(req.user.id);
    if (user) {
      user.total_xp += 10;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Check-in successful! +10 XP',
      data: {
        restaurant: restaurant.name,
        user: {
          id: user._id,
          username: user.username,
          total_xp: user.total_xp,
          level: user.level
        }
      }
    });
  } catch (error) {
    console.error('Error in checkIn:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add review
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const restaurantId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    // Log attempt
    const fs = require('fs');
    fs.appendFileSync('c:\\Users\\Necip Orkun Yalçın\\Desktop\\nerede-yesek\\debug_output.txt', `[Review Attempt] User: ${req.user.id}, Rest: ${restaurantId}, Rating: ${rating}\n`);

    // Create Review
    await Review.create({
      restaurant_id: restaurantId,
      user_id: req.user.id,
      username: req.user.username,
      rating,
      comment: comment || ''
    });

    // Update Restaurant Stats
    const reviews = await Review.find({ restaurant_id: restaurantId });
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    restaurant.rating = parseFloat(avg.toFixed(1));
    restaurant.total_reviews = reviews.length;
    await restaurant.save();

    res.status(201).json({ success: true, message: 'Review added', data: restaurant });

  } catch (error) {
    const fs = require('fs');
    fs.appendFileSync('c:\\Users\\Necip Orkun Yalçın\\Desktop\\nerede-yesek\\debug_output.txt', `[Review Error] ${error.message}\n`);
    console.error('Error in addReview:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant_id: req.params.id }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};