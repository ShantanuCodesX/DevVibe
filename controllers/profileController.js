const Project = require("../models/Project");
const User = require("../models/User");
const Resume = require("../models/Resume");
const profileService = require("../services/profileService");

const showProfile = async (req, res) => {
    try {
        const { user, projects } = await profileService.getProfile(req.session.userId);
        res.render("profile", { user, projects });
    } catch (error) {
        res.status(404).send(error.message);
    }
};

const showEditProfile = async (req, res) => {
    try {
        const { user } = await profileService.getProfile(req.session.userId);
        res.render("edit-profile", { user });
    } catch (error) {
        res.status(404).send(error.message);
    }
};

const updateProfile = async (req, res) => {
    try {
        const { headline, bio, github, linkedin, instagram, skills } = req.body;
        const profileData = {
            headline,
            bio,
            github,
            linkedin,
            instagram,
            skills: skills
                ? skills.split(",").map(skill => skill.trim()).filter(Boolean)
                : []
        };

        if (req.file) {
            profileData.profileImage = `/uploads/profiles/${req.file.filename}`;
        }

        await profileService.updateProfile(req.session.userId, profileData);
        res.redirect("/profile");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const showUserProfile = async (req, res) => {
    try {
        const data = await profileService.getUserProfile(req.params.id);

        if (!data) {
            return res.status(404).send("Profile not found");
        }

        res.render("userprofile", {
            user: data.user,
            projects: data.projects
        });
    } catch (error) {
        res.status(500).send("Unable to load profile");
    }
};

const showUserResume = async (req, res) => {
    try {
        const userId = req.params.id;

        const [user, projects, resume] = await Promise.all([
            User.findById(userId)
                .select("_id name email headline bio github linkedin instagram skills")
                .lean(),
            Project.find({ user: userId })
                .select("name description techStack liveLink sourceCode screenshots createdAt")
                .sort({ createdAt: -1 })
                .lean(),
            Resume.findOne({ user: userId }).lean()
        ]);

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.render("public-resume", { user, resume, projects });
    } catch (error) {
        res.status(500).send("Unable to load resume");
    }
};

const searchUsers = async (req, res) => {
    try {
        const query = req.query.q?.trim() || "";
        const users = await profileService.searchUsers(query);
        res.render("search-results", { users, query });
    } catch (error) {
        res.status(500).send("Unable to search users");
    }
};

module.exports = {
    showProfile,
    showEditProfile,
    updateProfile,
    showUserProfile,
    searchUsers,
    showUserResume
};