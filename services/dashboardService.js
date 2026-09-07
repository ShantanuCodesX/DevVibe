const User = require("../models/User");
const Project = require("../models/Project");

const getDashboardData = async (userId) => {
    const [user, projects] = await Promise.all([
        User.findById(userId).select("_id name profileImage").lean(),
        Project.find()
            .select("name description techStack screenshots liveLink sourceCode user createdAt")
            .populate({
                path: "user",
                select: "_id name profileImage"
            })
            .sort({ createdAt: -1 })
            .lean()
    ]);

    if (!user) {
        throw new Error("User not found");
    }

    return { user, projects };
};

module.exports = { getDashboardData };