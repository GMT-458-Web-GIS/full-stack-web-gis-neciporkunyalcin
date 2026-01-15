const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllRestaurants,
  getNearbyRestaurants,
  getRestaurant,
  createRestaurant,
  searchRestaurants,
  checkIn,
  updateRestaurant,
  deleteRestaurant
} = require('../controllers/restaurantController');

router.get('/', getAllRestaurants);
router.get('/nearby', getNearbyRestaurants);
router.get('/search', searchRestaurants);
router.get('/:id', getRestaurant);
router.put('/:id', auth, updateRestaurant);
router.delete('/:id', auth, deleteRestaurant);

router.post('/', auth, createRestaurant);
router.post('/checkin', auth, checkIn);

module.exports = router;
