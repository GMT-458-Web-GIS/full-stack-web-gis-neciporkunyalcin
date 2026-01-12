const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.getAll();
    
    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
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

    const filters = {};
    if (cuisine_type) filters.cuisine_type = cuisine_type;
    if (price_range) filters.price_range = price_range;
    if (min_rating) filters.min_rating = parseFloat(min_rating);

    const restaurants = await Restaurant.findNearby(
      parseFloat(lat),
      parseFloat(lon),
      parseInt(radius),
      filters
    );

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
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
      data: restaurant
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
    const { name, cuisine_type, price_range, lat, lon, address, phone } = req.body;

    // Validation
    if (!name || !lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Name, latitude, and longitude are required'
      });
    }

    const restaurantData = {
      name,
      cuisine_type,
      price_range,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      address,
      phone,
      owner_id: req.user.id // from auth middleware
    };

    const restaurant = await Restaurant.create(restaurantData);

    // Award XP to user for adding restaurant
    await User.updateXP(req.user.id, 100);

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

    const restaurants = await Restaurant.search(q);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
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
    const updatedUser = await User.updateXP(req.user.id, 10);

    res.status(200).json({
      success: true,
      message: 'Check-in successful! +10 XP',
      data: {
        restaurant: restaurant.name,
        user: updatedUser
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