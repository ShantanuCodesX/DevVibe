const dashboardService = require("../services/dashboardService");

const showDashboard = async (req, res) => {
    try {
        const { user, projects } = await dashboardService.getDashboardData(req.session.userId);
        res.render("dashboard", { user, projects });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = { showDashboard };