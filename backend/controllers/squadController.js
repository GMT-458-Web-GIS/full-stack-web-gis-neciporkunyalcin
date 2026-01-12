const Squad = require('../models/Squad');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// Create squad
exports.createSquad = async (req, res) => {
  try {
    const { name, squad_type, members } = req.body;

    if (!name || !members || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Squad name and members are required'
      });
    }

    const squadData = {
      name,
      squad_type: squad_type || 'casual',
      creator_id: req.user.id,
      members: members.map(member => ({
        user_id: member.user_id,
        username: member.username,
        preferences: member.preferences || {},
        current_location: member.current_location
      }))
    };

    const squad = await Squad.create(squadData);

    res.status(201).json({
      success: true,
      message: 'Squad created successfully',
      data: squad
    });
  } catch (error) {
    console.error('Error in createSquad:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's squads
exports.getUserSquads = async (req, res) => {
  try {
    const squads = await Squad.find({
      $or: [
        { creator_id: req.user.id },
        { 'members.user_id': req.user.id }
      ]
    }).sort({ updated_at: -1 });

    res.status(200).json({
      success: true,
      count: squads.length,
      data: squads
    });
  } catch (error) {
    console.error('Error in getUserSquads:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get squad by ID
exports.getSquad = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id);

    if (!squad) {
      return res.status(404).json({
        success: false,
        message: 'Squad not found'
      });
    }

    res.status(200).json({
      success: true,
      data: squad
    });
  } catch (error) {
    console.error('Error in getSquad:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Start decision session
exports.startSession = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id);

    if (!squad) {
      return res.status(404).json({
        success: false,
        message: 'Squad not found'
      });
    }

    // Calculate common filters from all members' preferences
    const preferences = squad.members.map(m => m.preferences);
    
    let minBudget = Math.min(...preferences.map(p => p.budget_min || 0));
    let maxBudget = Math.max(...preferences.map(p => p.budget_max || 1000));
    
    // Find centroid of all member locations
    const lons = squad.members.map(m => m.current_location.coordinates[0]);
    const lats = squad.members.map(m => m.current_location.coordinates[1]);
    const centroidLon = lons.reduce((a, b) => a + b, 0) / lons.length;
    const centroidLat = lats.reduce((a, b) => a + b, 0) / lats.length;

    // Find restaurants near centroid
    const restaurants = await Restaurant.findNearby(
      centroidLat,
      centroidLon,
      5000 // 5km radius
    );

    // Filter based on preferences
    let filteredRestaurants = restaurants.filter(r => {
      // Budget filter
      const priceMap = { 'budget': 100, 'moderate': 200, 'expensive': 400 };
      const restaurantPrice = priceMap[r.price_range] || 200;
      if (restaurantPrice < minBudget || restaurantPrice > maxBudget) return false;

      // Cuisine preferences
      const cuisinePrefs = preferences.flatMap(p => p.cuisine_preferences || []);
      if (cuisinePrefs.length > 0 && !cuisinePrefs.includes(r.cuisine_type)) return false;

      return true;
    });

    // Take top 5 restaurants
    const suggestedRestaurants = filteredRestaurants.slice(0, 5).map(r => ({
      restaurant_id: r.id,
      restaurant_name: r.name,
      location: {
        type: 'Point',
        coordinates: [r.longitude, r.latitude]
      },
      votes: {
        upvotes: [],
        downvotes: [],
        super_likes: []
      },
      total_score: 0,
      avg_distance_to_members: r.distance || 0
    }));

    // Update squad session
    squad.current_session = {
      is_active: true,
      started_at: new Date(),
      decision_deadline: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      suggested_restaurants: suggestedRestaurants,
      final_decision: null
    };

    await squad.save();

    res.status(200).json({
      success: true,
      message: 'Decision session started. Vote now!',
      data: squad
    });
  } catch (error) {
    console.error('Error in startSession:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Vote on restaurant
exports.vote = async (req, res) => {
  try {
    const { restaurant_id, vote_type } = req.body; // vote_type: 'upvote', 'downvote', 'super_like'

    if (!restaurant_id || !vote_type) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID and vote type are required'
      });
    }

    const squad = await Squad.findById(req.params.id);

    if (!squad || !squad.current_session.is_active) {
      return res.status(400).json({
        success: false,
        message: 'No active session'
      });
    }

    // Find the restaurant in suggestions
    const restaurant = squad.current_session.suggested_restaurants.find(
      r => r.restaurant_id === restaurant_id
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not in suggestions'
      });
    }

    // Remove previous votes from this user
    restaurant.votes.upvotes = restaurant.votes.upvotes.filter(v => v.user_id !== req.user.id);
    restaurant.votes.downvotes = restaurant.votes.downvotes.filter(v => v.user_id !== req.user.id);
    restaurant.votes.super_likes = restaurant.votes.super_likes.filter(v => v.user_id !== req.user.id);

    // Add new vote
    const voteData = { user_id: req.user.id, timestamp: new Date() };
    
    if (vote_type === 'upvote') {
      restaurant.votes.upvotes.push(voteData);
      restaurant.total_score = restaurant.votes.upvotes.length * 2 - restaurant.votes.downvotes.length + restaurant.votes.super_likes.length * 3;
    } else if (vote_type === 'downvote') {
      restaurant.votes.downvotes.push(voteData);
      restaurant.total_score = restaurant.votes.upvotes.length * 2 - restaurant.votes.downvotes.length + restaurant.votes.super_likes.length * 3;
    } else if (vote_type === 'super_like') {
      restaurant.votes.super_likes.push(voteData);
      restaurant.total_score = restaurant.votes.upvotes.length * 2 - restaurant.votes.downvotes.length + restaurant.votes.super_likes.length * 3;
    }

    await squad.save();

    res.status(200).json({
      success: true,
      message: 'Vote recorded',
      data: squad.current_session.suggested_restaurants
    });
  } catch (error) {
    console.error('Error in vote:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Finalize decision
exports.finalizeDecision = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id);

    if (!squad || !squad.current_session.is_active) {
      return res.status(400).json({
        success: false,
        message: 'No active session'
      });
    }

    // Find restaurant with highest score
    const sortedRestaurants = squad.current_session.suggested_restaurants.sort(
      (a, b) => b.total_score - a.total_score
    );

    const winner = sortedRestaurants[0];

    // Update session
    squad.current_session.final_decision = {
      restaurant_id: winner.restaurant_id,
      restaurant_name: winner.restaurant_name,
      decided_at: new Date(),
      decision_method: 'voting'
    };
    squad.current_session.is_active = false;

    // Update stats
    squad.squad_stats.total_meetings += 1;
    
    // Update favorite restaurant
    const existingFav = squad.squad_stats.favorite_restaurant;
    if (!existingFav || existingFav.restaurant_id === winner.restaurant_id) {
      squad.squad_stats.favorite_restaurant = {
        restaurant_id: winner.restaurant_id,
        restaurant_name: winner.restaurant_name,
        visit_count: (existingFav?.visit_count || 0) + 1
      };
    }

    // Add to history
    const decisionTime = Math.floor((new Date() - squad.current_session.started_at) / 60000); // minutes
    squad.meeting_history.push({
      restaurant_id: winner.restaurant_id,
      restaurant_name: winner.restaurant_name,
      date: new Date(),
      attendees: squad.members.map(m => m.user_id),
      decision_time: decisionTime
    });

    // Update decision time stats
    if (!squad.squad_stats.fastest_decision_time || decisionTime < squad.squad_stats.fastest_decision_time) {
      squad.squad_stats.fastest_decision_time = decisionTime;
    }
    if (!squad.squad_stats.longest_decision_time || decisionTime > squad.squad_stats.longest_decision_time) {
      squad.squad_stats.longest_decision_time = decisionTime;
    }

    await squad.save();

    res.status(200).json({
      success: true,
      message: `Decision made! Going to ${winner.restaurant_name}`,
      data: {
        decision: squad.current_session.final_decision,
        stats: squad.squad_stats
      }
    });
  } catch (error) {
    console.error('Error in finalizeDecision:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Food roulette (random decision)
exports.foodRoulette = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id);

    if (!squad || !squad.current_session.is_active) {
      return res.status(400).json({
        success: false,
        message: 'No active session'
      });
    }

    // Pick random restaurant
    const restaurants = squad.current_session.suggested_restaurants;
    const randomIndex = Math.floor(Math.random() * restaurants.length);
    const winner = restaurants[randomIndex];

    // Update session
    squad.current_session.final_decision = {
      restaurant_id: winner.restaurant_id,
      restaurant_name: winner.restaurant_name,
      decided_at: new Date(),
      decision_method: 'roulette'
    };
    squad.current_session.is_active = false;

    squad.squad_stats.total_meetings += 1;

    await squad.save();

    res.status(200).json({
      success: true,
      message: `🎲 Roulette says: ${winner.restaurant_name}!`,
      data: squad.current_session.final_decision
    });
  } catch (error) {
    console.error('Error in foodRoulette:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};