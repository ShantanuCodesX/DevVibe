const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        techStack: {
            type: [String],
            default: []
        },

        liveLink: {
            type: String,
            default: ""
        },

        sourceCode: {
            type: String,
            default: ""
        },

        screenshots: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Project", projectSchema);