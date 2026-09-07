const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const authMiddleware = require("../middleware/authMiddleware");
const {
    showProfile,
    showEditProfile,
    updateProfile,
    showUserProfile,
    searchUsers,
    showUserResume
} = require("../controllers/profileController");

const router = express.Router();

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "devhub/profiles",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 500, height: 500, crop: "fill" }]
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.get("/", authMiddleware, showProfile);
router.get("/edit", authMiddleware, showEditProfile);
router.post("/edit", authMiddleware, upload.single("profileImage"), updateProfile);
router.get("/user/:id", showUserProfile);
router.get("/search", authMiddleware, searchUsers);
router.get("/user/:id/resume", showUserResume);

module.exports = router;