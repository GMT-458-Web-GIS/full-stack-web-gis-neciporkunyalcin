const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const connectMongoDB = require('./config/mongodb');
// const pool = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const userRoutes = require('./routes/users');
const challengeRoutes = require('./routes/challenges');
const squadRoutes = require('./routes/squads');

// Models
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// DB init
connectMongoDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/squads', squadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Nerede Yesek API running 🚀' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
