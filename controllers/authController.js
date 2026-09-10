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
        const user = await authService.signupUser(name, email, password);

        req.session.userId = user._id;

        req.session.save((error) => {
            if (error) return res.status(500).send("Session error");
            res.redirect("/dashboard");
        });
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await authService.loginUser(email, password);

        req.session.userId = user._id;

        req.session.save((error) => {
            if (error) return res.status(500).send("Session error");
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

module.exports = {
    showSignup,
    showLogin,
    signup,
    login,
    logout
};