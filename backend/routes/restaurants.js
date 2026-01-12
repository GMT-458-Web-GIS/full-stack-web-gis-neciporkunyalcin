const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllRestaurants,
  getNearbyRestaurants,
  getRestaurant,
  createRestaurant,
  searchRestaurants,
  checkIn
} = require('../controllers/restaurantController');

router.get('/', getAllRestaurants);
router.get('/nearby', getNearbyRestaurants);
router.get('/search', searchRestaurants);
router.get('/:id', getRestaurant);

router.post('/', auth, createRestaurant);
router.post('/checkin', auth, checkIn);

module.exports = router;
