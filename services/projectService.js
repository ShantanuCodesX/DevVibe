const Project = require("../models/Project");


// Get all projects of logged-in user
const getUserProjects = async (userId) => {

    return await Project.find({
        user: userId
    }).sort({
        createdAt: -1
    });

};


// Get single project
const getProjectById = async (projectId, userId) => {

    return await Project.findOne({
        _id: projectId,
        user: userId
    });

};


// Create project
const createProject = async (projectData) => {

    return await Project.create(projectData);

};


// Update project
const updateProject = async (
    projectId,
    userId,
    projectData
) => {

    return await Project.findOneAndUpdate(
        {
            _id: projectId,
            user: userId
        },
        projectData,
        {
            new: true,
            runValidators: true
        }
    );

};


// Delete project
const deleteProject = async (
    projectId,
    userId
) => {

    return await Project.findOneAndDelete({
        _id: projectId,
        user: userId
    });

};


module.exports = {
    getUserProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
};