const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Poll = require('./models/Poll');
const Squad = require('./models/Squad');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');

dotenv.config();

const simulatePoll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB');

        // 1. Get Squad and Users
        const squad = await Squad.findOne({ name: 'Ankara Gurmeleri 🥙' });
        if (!squad) throw new Error('Squad not found. Run seed_squad.js first.');

        // Get Ali and Ayse
        const ali = await User.findOne({ username: 'ali_yilmaz' });
        const ayse = await User.findOne({ username: 'ayse_demir' });

        // 2. Create Poll (as Zeynep/Creator - handled via creator field here for sim)
        console.log('📝 Creating Poll...');
        const poll = await Poll.create({
            squadId: squad._id,
            creator: squad.creator_id,
            question: 'Akşama ne yiyelim?',
            options: [
                { foodType: 'Kebab', votes: 0 },
                { foodType: 'Italian', votes: 0 },
                { foodType: 'Burger', votes: 0 }
            ]
        });
        console.log(`✅ Poll Created: ${poll.question}`);

        // 3. Vote Kebab (as Ali)
        const kebabOption = poll.options.find(o => o.foodType === 'Kebab');
        kebabOption.votes += 1;
        poll.voters.push(ali._id);
        console.log('🗳️ Ali voted for Kebab');

        // 4. Vote Kebab (as Ayse) - Kebab wins
        kebabOption.votes += 1;
        poll.voters.push(ayse._id);
        console.log('🗳️ Ayse voted for Kebab');

        await poll.save();

        // 5. Create a Dummy Kebab Restaurant to ensure recommendation works
        await Restaurant.create({
            name: 'Test Kebab House',
            cuisine_type: 'Kebab',
            cuisineTypes: ['Kebab', 'Turkish'],
            price_range: 'moderate',
            location: { type: 'Point', coordinates: [32.85, 39.93] },
            address: 'Test Cad. No:1',
            owner: squad.creator_id
        });
        console.log('🥙 Created dummy Kebab restaurant for testing');

        // 6. Resolve Poll
        console.log('🏁 Resolving Poll...');
        poll.status = 'completed'; // This triggers the pre-save hook to find winner
        await poll.save();

        console.log(`🏆 Winner: ${poll.winner}`);

        // 7. Check Recommendations Logic (Direct DB query simulation as in controller)
        const recommendations = await Restaurant.find({
            $or: [
                { cuisine_type: poll.winner },
                { cuisineTypes: { $in: [poll.winner] } }
            ]
        })
            .limit(5);

        console.log(`🍽️ Recommendations found: ${recommendations.length}`);
        recommendations.forEach(r => console.log(` - ${r.name} (${r.cuisineTypes.join(', ')})`));

        // Cleanup Poll and Test Restaurant
        await Poll.deleteOne({ _id: poll._id });
        await Restaurant.deleteOne({ name: 'Test Kebab House' });
        console.log('🧹 Cleanup done');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

simulatePoll();
