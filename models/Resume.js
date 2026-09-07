const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        title: {
            type: String,
            default: ""
        },

        phone: {
            type: String,
            default: ""
        },

        location: {
            type: String,
            default: ""
        },

        summary: {
            type: String,
            default: ""
        },

        experienceTitle: {
            type: String,
            default: ""
        },

        company: {
            type: String,
            default: ""
        },

        experienceDescription: {
            type: String,
            default: ""
        },

        degree: {
            type: String,
            default: ""
        },

        college: {
            type: String,
            default: ""
        },

        graduationYear: {
            type: String,
            default: ""
        },

        additionalSkills: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Resume", resumeSchema);