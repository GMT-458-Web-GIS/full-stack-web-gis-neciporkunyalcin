const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const users = [
    {
        username: 'ali_yilmaz',
        email: 'ali@example.com',
        password: 'password123',
        user_type: 'free',
        total_xp: 150,
        // Ankara coordinates
        location: { type: 'Point', coordinates: [32.8597, 39.9334] }
    },
    {
        username: 'ayse_demir',
        email: 'ayse@example.com',
        password: 'password123',
        user_type: 'premium',
        total_xp: 2500,
        location: { type: 'Point', coordinates: [32.8081, 39.9035] }
    },
    {
        username: 'mehmet_gurme',
        email: 'mehmet@example.com',
        password: 'password123',
        user_type: 'restaurant_owner',
        total_xp: 500,
        location: { type: 'Point', coordinates: [32.8369, 39.9208] }
    },
    {
        username: 'zeynep_admin',
        email: 'zeynep@example.com',
        password: 'password123',
        user_type: 'admin',
        total_xp: 10000,
        location: { type: 'Point', coordinates: [32.8543, 39.9255] }
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB');

        for (const user of users) {
            // Check if exists
            const exists = await User.findOne({ email: user.email });
            if (exists) {
                console.log(`⚠️ User ${user.username} already exists`);
                continue;
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);

            await User.create(user);
            console.log(`✅ Created user: ${user.username} (${user.user_type})`);
        }

        console.log('🎉 Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedUsers();
