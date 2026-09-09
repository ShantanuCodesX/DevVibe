const authService = require("../services/authService");

const showSignup = (req, res) => {
    res.render("auth/signup");
};

const showLogin = (req, res) => {
    res.render("auth/login");
};

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = await authService.signupUser(name, email, password);
        req.session.userId = newUser._id;
        res.redirect("/dashboard");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await authService.loginUser(email, password);

        req.session.userId = user._id;

        console.log("Session userId:", req.session.userId);

        req.session.save((error) => {
            if (error) {
                console.error("Session save error:", error);
                return res.status(500).send("Session error");
            }

            console.log("Session saved:", req.sessionID);
            res.redirect("/dashboard");
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
};

const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};

module.exports = { showSignup, showLogin, signup, login, logout };