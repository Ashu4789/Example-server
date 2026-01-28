const User = require('../models/user');

const userDao = {
    findByEmail: async (email) => {
        const user = await User.findOne({ email });
        return user;
    },
    create : async (userData) => {
        const newUser = new User(userData);
        return await newUser.save();
    }
};

module.exports = userDao;






















