const settingsService = require("../services/settingsService");


const showSettings = async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.redirect("/auth/login");
        }


        const user =
            await settingsService.getSettingsUser(
                req.session.userId
            );


        res.render("settings", {
            user
        });


    } catch (error) {

        console.error(
            "Settings Error:",
            error.message
        );

        res.status(500).send(
            "Unable to load settings"
        );

    }
};


module.exports = {
    showSettings
};