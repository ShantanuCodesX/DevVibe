const express = require("express");
const {
    showSignup,
    showLogin,
    signup,
    login,
    logout
} = require("../controllers/authController");

const router = express.Router();

router.get("/signup", showSignup);
router.post("/signup", signup);
router.get("/login", showLogin);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;