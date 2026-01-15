const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Squad = require('./models/Squad');
const User = require('./models/User');

dotenv.config();

const createDemoSquad = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB');

        // Find our users
        const usernames = ['ali_yilmaz', 'ayse_demir', 'mehmet_gurme', 'zeynep_admin'];
        const users = await User.find({ username: { $in: usernames } });

        if (users.length < 4) {
            console.log('❌ Could not find all users. Did you run seed_users.js?');
            process.exit(1);
        }

        const creator = users.find(u => u.username === 'zeynep_admin');
        const others = users.filter(u => u.username !== 'zeynep_admin');

        // Create Squad
        const squad = await Squad.create({
            name: 'Ankara Gurmeleri 🥙',
            squad_type: 'casual',
            creator_id: creator._id,
            members: users.map(u => ({
                user_id: u._id,
                username: u.username,
                current_location: {
                    type: 'Point',
                    coordinates: u.location.coordinates
                }
            }))
        });

        console.log(`✅ Squad Created: "${squad.name}"`);
        console.log(`👑 Creator: ${creator.username}`);
        console.log(`👥 Members: ${others.map(u => u.username).join(', ')}`);
        console.log(`🆔 Squad ID: ${squad._id}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createDemoSquad();
