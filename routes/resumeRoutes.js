const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");

router.get("/", resumeController.showResume);
router.get("/edit", resumeController.showEditResume);
router.post("/edit", resumeController.saveResume);
router.get("/preview", resumeController.previewResume);
router.get("/download", resumeController.downloadResume);

module.exports = router;