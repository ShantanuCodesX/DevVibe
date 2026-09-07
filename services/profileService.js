const User = require("../models/User");
const Project = require("../models/Project");

const getProfile = async (userId) => {
    const [user, projects] = await Promise.all([
        User.findById(userId)
            .select("_id name email profileImage headline bio github linkedin instagram skills")
            .lean(),
        Project.find({ user: userId })
            .select("name description techStack screenshots liveLink sourceCode createdAt")
            .sort({ createdAt: -1 })
            .lean()
    ]);

    if (!user) {
        throw new Error("User not found");
    }

    return { user, projects };
};

const updateProfile = async (userId, profileData) => {
    const user = await User.findByIdAndUpdate(
        userId,
        profileData,
        { new: true, runValidators: true }
    )
    .select("_id name email profileImage headline bio github linkedin instagram skills")
    .lean();

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

const getUserProfile = async (userId) => {
    const [user, projects] = await Promise.all([
        User.findById(userId)
            .select("_id name profileImage headline bio github linkedin instagram skills")
            .lean(),
        Project.find({ user: userId })
            .select("name description techStack screenshots liveLink sourceCode createdAt")
            .sort({ createdAt: -1 })
            .lean()
    ]);

    if (!user) {
        return null;
    }

    return { user, projects };
};

const searchUsers = async (query) => {
    if (!query) {
        return [];
    }

    return User.find({
        $or: [
            { name: { $regex: query, $options: "i" } },
            { headline: { $regex: query, $options: "i" } },
            { skills: { $regex: query, $options: "i" } }
        ]
    })
    .select("_id name profileImage headline skills")
    .limit(20)
    .lean();
};

module.exports = {
    getProfile,
    updateProfile,
    getUserProfile,
    searchUsers
};  