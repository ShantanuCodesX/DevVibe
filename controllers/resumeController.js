const Resume = require("../models/Resume");
const User = require("../models/User");
const Project = require("../models/Project");
const puppeteer = require("puppeteer");


// ===============================
// EDIT RESUME PAGE
// ===============================

exports.showEditResume = async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.redirect("/auth/login");
        }

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.redirect("/auth/login");
        }

        const resume = await Resume.findOne({
            user: req.session.userId
        });

        res.render("edit-resume", {
            user,
            resume
        });

    } catch (error) {

        console.error("Edit Resume Error:", error);

        res.status(500).send("Something went wrong");

    }
};



// ===============================
// SAVE RESUME
// ===============================

exports.saveResume = async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.redirect("/auth/login");
        }

        const {
            title,
            phone,
            location,
            summary,
            experienceTitle,
            company,
            experienceDescription,
            degree,
            college,
            graduationYear,
            additionalSkills
        } = req.body;


        await Resume.findOneAndUpdate(
            {
                user: req.session.userId
            },
            {
                user: req.session.userId,

                title: title || "",
                phone: phone || "",
                location: location || "",
                summary: summary || "",

                experienceTitle: experienceTitle || "",
                company: company || "",
                experienceDescription: experienceDescription || "",

                degree: degree || "",
                college: college || "",
                graduationYear: graduationYear || "",

                additionalSkills: additionalSkills || ""
            },
            {
                new: true,
                upsert: true
            }
        );


        // Save ke baad preview page

        res.redirect("/resume/preview");

    } catch (error) {

        console.error("Save Resume Error:", error);

        res.status(500).send("Unable to save resume");

    }
};



// ===============================
// PREVIEW RESUME
// ===============================

exports.previewResume = async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.redirect("/auth/login");
        }


        const user = await User.findById(
            req.session.userId
        );


        if (!user) {
            return res.redirect("/auth/login");
        }


        const resume = await Resume.findOne({
            user: req.session.userId
        });


        const projects = await Project.find({
            user: req.session.userId
        }).sort({
            createdAt: -1
        });


        res.render("preview-resume", {
            user,
            resume,
            projects,
            pdfMode: false
        });


    } catch (error) {

        console.error("Preview Resume Error:", error);

        res.status(500).send("Unable to load resume");

    }
};

// ===============================
// RESUME MANAGER PAGE
// ===============================

exports.showResume = async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.redirect("/auth/login");
        }

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.redirect("/auth/login");
        }

        const resume = await Resume.findOne({
            user: req.session.userId
        });

        res.render("resume", {
            user,
            resume
        });

    } catch (error) {

        console.error("Resume Manager Error:", error);

        res.status(500).send("Unable to load resume");

    }
};

// ===============================
// DOWNLOAD RESUME PDF
// ===============================

exports.downloadResume = async (req, res) => {

    let browser;

    try {

        if (!req.session.userId) {
            return res.redirect("/auth/login");
        }

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.redirect("/auth/login");
        }


        browser = await puppeteer.launch({

    headless: true,

    executablePath:
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",

    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox"
    ]

});


        const page = await browser.newPage();


        // Current login session cookie Puppeteer ko dena

        const cookies = req.headers.cookie;

        if (cookies) {

            const parsedCookies = cookies
                .split(";")
                .map(cookie => {

                    const index = cookie.indexOf("=");

                    return {
                        name: cookie
                            .substring(0, index)
                            .trim(),

                        value: cookie
                            .substring(index + 1)
                            .trim(),

                        domain: "localhost"
                    };

                });

            await page.setCookie(...parsedCookies);
        }


        // Resume preview page open karo

        await page.goto(
            "http://localhost:3000/resume/preview",
            {
                waitUntil: "networkidle0"
            }
        );


        // PDF generate

        const pdf = await page.pdf({

            format: "A4",

            printBackground: true,

            preferCSSPageSize: true,

            margin: {
                top: "15mm",
                right: "15mm",
                bottom: "15mm",
                left: "15mm"
            }

        });


        await browser.close();

        browser = null;


        const safeName = user.name
            .replace(/[^a-zA-Z0-9]/g, "_");


        res.setHeader(
            "Content-Type",
            "application/pdf"
        );


        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${safeName}_Resume.pdf"`
        );


        res.end(pdf);


    } catch (error) {

        console.error(
            "Download Resume Error:",
            error
        );


        if (browser) {

            await browser.close();

        }


        res.status(500).send(
            "Unable to generate resume PDF"
        );

    }

};