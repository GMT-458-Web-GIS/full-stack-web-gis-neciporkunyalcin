const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: 'backend/.env' });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const users = await User.find({ username: 'picen' });
        console.log('Users with username "picen":', users.length);
        users.forEach(u => console.log(`- ID: ${u._id}, Email: ${u.email}, Created: ${u.createdAt}`));

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
