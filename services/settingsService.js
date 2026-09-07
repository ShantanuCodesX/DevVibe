const User = require("../models/User");


const getSettingsUser = async (userId) => {

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};


module.exports = {
    getSettingsUser
};