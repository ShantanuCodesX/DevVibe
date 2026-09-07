const express = require("express");

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    showSettings
} = require("../controllers/settingsController");


const router = express.Router();


router.get(
    "/",
    authMiddleware,
    showSettings
);


module.exports = router;