const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
require('dotenv').config({ path: 'backend/.env' });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const notifs = await Notification.find({});
        console.log('Total Notifications:', notifs.length);
        console.log(JSON.stringify(notifs, null, 2));

        const users = await User.find({}, 'username _id');
        console.log('Users:', users);

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
