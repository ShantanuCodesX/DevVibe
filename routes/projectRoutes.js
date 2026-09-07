const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const authMiddleware = require("../middleware/authMiddleware");
const {
    showProjects,
    showAddProject,
    createProject,
    showEditProject,
    updateProject,
    deleteProject
} = require("../controllers/projectController");

const router = express.Router();

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "devhub/projects",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [
            {
                width: 1600,
                height: 1000,
                crop: "limit",
                quality: "auto",
                fetch_format: "auto"
            }
        ]
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 2
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPG, PNG and WEBP images are allowed"));
        }

        cb(null, true);
    }
});

router.get("/", authMiddleware, showProjects);
router.get("/add", authMiddleware, showAddProject);
router.post("/add", authMiddleware, upload.array("screenshots", 2), createProject);
router.get("/edit/:id", authMiddleware, showEditProject);
router.post("/edit/:id", authMiddleware, upload.array("screenshots", 2), updateProject);
router.post("/delete/:id", authMiddleware, deleteProject);

module.exports = router;