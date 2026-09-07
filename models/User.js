const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        profileImage: {
            type: String,
            default: ""
        },

        headline: {
            type: String,
            default: ""
        },

        bio: {
            type: String,
            default: ""
        },

        github: {
            type: String,
            default: ""
        },

        instagram: {
            type: String,
            default: ""
        },

        skills: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);