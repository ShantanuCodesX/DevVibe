const authMiddleware = (req, res, next) => {
    if (!req.session.userId) {
        console.log("Dashboard session:", req.sessionId, req.session.userId);
        return res.redirect("/auth/login");
    }

    next();
};

module.exports = authMiddleware;