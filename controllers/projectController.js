const projectService = require("../services/projectService");
const User = require("../models/User");

const showProjects = async (req, res) => {
    try {
        const [projects, user] = await Promise.all([
            projectService.getUserProjects(req.session.userId),
            User.findById(req.session.userId)
                .select("_id name profileImage")
                .lean()
        ]);

        if (!user) {
            return res.redirect("/auth/login");
        }

        res.render("projects", { projects, user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const showAddProject = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
            .select("_id name profileImage")
            .lean();

        if (!user) {
            return res.redirect("/auth/login");
        }

        res.render("add-project", { user });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const createProject = async (req, res) => {
    try {
        const { name, description, techStack, liveLink, sourceCode } = req.body;

        const screenshots = req.files?.map(file => file.path) || [];

        await projectService.createProject({
            user: req.session.userId,
            name,
            description,
            techStack: techStack
                ? techStack.split(",").map(skill => skill.trim()).filter(Boolean)
                : [],
            liveLink,
            sourceCode,
            screenshots
        });

        res.redirect("/projects");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const showEditProject = async (req, res) => {
    try {
        const project = await projectService.getProjectById(
            req.params.id,
            req.session.userId
        );

        if (!project) {
            return res.status(404).send("Project not found");
        }

        res.render("edit-project", { project });
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const updateProject = async (req, res) => {
    try {
        const { name, description, techStack, liveLink, sourceCode } = req.body;

        const projectData = {
            name,
            description,
            techStack: techStack
                ? techStack.split(",").map(skill => skill.trim()).filter(Boolean)
                : [],
            liveLink,
            sourceCode
        };

        if (req.files?.length) {
            projectData.screenshots = req.files.map(file => file.path);
        }

        await projectService.updateProject(
            req.params.id,
            req.session.userId,
            projectData
        );

        res.redirect("/projects");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const deleteProject = async (req, res) => {
    try {
        await projectService.deleteProject(
            req.params.id,
            req.session.userId
        );

        res.redirect("/projects");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

module.exports = {
    showProjects,
    showAddProject,
    createProject,
    showEditProject,
    updateProject,
    deleteProject
};