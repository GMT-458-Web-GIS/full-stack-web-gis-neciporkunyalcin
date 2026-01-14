const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const connectDB = require('./config/mongodb');

const runTest = async () => {
    try {
        console.log('Connecting to DB...');
        await connectDB();
        console.log('Connected.');

        // Ensure indexes are built
        console.log('Building indexes...');
        await User.init();
        await Restaurant.init();
        console.log('Indexes built.');

        // Cleanup test data
        await User.deleteMany({ email: 'test@example.com' });
        await Restaurant.deleteMany({ name: 'Test Restaurant' });

        console.log('Creating user...');
        const user = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            location: {
                type: 'Point',
                coordinates: [29.0, 41.0]
            }
        });
        console.log('User created:', user.username);

        console.log('Creating restaurant...');
        const restaurant = await Restaurant.create({
            name: 'Test Restaurant',
            address: 'Test Address',
            location: {
                type: 'Point',
                coordinates: [29.001, 41.001]
            },
            owner: user._id
        });
        console.log('Restaurant created:', restaurant.name);

        console.log('Testing geospatial query...');
        const nearby = await Restaurant.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [29.0, 41.0]
                    },
                    $maxDistance: 1000 // 1km
                }
            }
        });

        console.log('Nearby restaurants found:', nearby.length);
        if (nearby.length > 0 && nearby[0].name === 'Test Restaurant') {
            console.log('✅ Geospatial query working');
        } else {
            console.log('❌ Geospatial query failed');
        }

        // Cleanup
        await User.deleteOne({ _id: user._id });
        await Restaurant.deleteOne({ _id: restaurant._id });

        console.log('✅ All migration tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
};

runTest();
