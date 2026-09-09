const bcrypt = require("bcryptjs");
const User = require("../models/User");

const signupUser = async (name, email, password) => {
    const existingUser = await User.findOne({ email }).select("_id").lean();

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return User.create({
        name,
        email,
        password: hashedPassword
    });
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ email })
        .select("_id password")
        .lean();

        console.log("Login email:", email);
        console.log("User found:", !! user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error("Invalid email or password");
    }

    return user;
};

module.exports = { signupUser, loginUser };