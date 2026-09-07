const express = require("express");

const router = express.Router();

const resumeController = require("../controllers/resumeController");


router.get("/", resumeController.showResume);


// Edit Resume

router.get(
    "/edit",
    resumeController.showEditResume
);


// Save Resume

router.post(
    "/edit",
    resumeController.saveResume
);


// Preview Resume

router.get(
    "/preview",
    resumeController.previewResume
);

//Download resume
router.get("/download", resumeController.downloadResume);


module.exports = router;