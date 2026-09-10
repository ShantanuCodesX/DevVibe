const Resume = require("../models/Resume");
const User = require("../models/User");
const Project = require("../models/Project");
const puppeteer = require("puppeteer");

exports.showEditResume = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect("/auth/login");

        const [user, resume] = await Promise.all([
            User.findById(req.session.userId).lean(),
            Resume.findOne({ user: req.session.userId }).lean()
        ]);

        if (!user) return res.redirect("/auth/login");

        res.render("edit-resume", { user, resume });
    } catch {
        res.status(500).send("Something went wrong");
    }
};

exports.saveResume = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect("/auth/login");

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
            { user: req.session.userId },
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
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        res.redirect("/resume/preview");
    } catch {
        res.status(500).send("Unable to save resume");
    }
};

exports.previewResume = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect("/auth/login");

        const [user, resume, projects] = await Promise.all([
            User.findById(req.session.userId).lean(),
            Resume.findOne({ user: req.session.userId }).lean(),
            Project.find({ user: req.session.userId })
                .sort({ createdAt: -1 })
                .lean()
        ]);

        if (!user) return res.redirect("/auth/login");

        res.render("preview-resume", {
            user,
            resume,
            projects,
            pdfMode: false
        });
    } catch {
        res.status(500).send("Unable to load resume");
    }
};

exports.showResume = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect("/auth/login");

        const [user, resume] = await Promise.all([
            User.findById(req.session.userId).lean(),
            Resume.findOne({ user: req.session.userId }).lean()
        ]);

        if (!user) return res.redirect("/auth/login");

        res.render("resume", {
            user,
            resume
        });
    } catch {
        res.status(500).send("Unable to load resume");
    }
};

exports.downloadResume = async (req, res) => {
    let browser;

    try {
        if (!req.session.userId) {
            return res.redirect("/auth/login");
        }

        const [user, resume, projects] = await Promise.all([
            User.findById(req.session.userId)
                .select("_id name email headline bio github linkedin skills")
                .lean(),

            Resume.findOne({
                user: req.session.userId
            }).lean(),

            Project.find({
                user: req.session.userId
            })
                .select("name description techStack liveLink sourceCode")
                .sort({ createdAt: -1 })
                .lean()
        ]);

        if (!user) {
            return res.redirect("/auth/login");
        }

        const html = await new Promise((resolve, reject) => {
            res.app.render(
                "preview-resume",
                {
                    user,
                    resume,
                    projects,
                    pdfMode: true
                },
                (error, html) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(html);
                    }
                }
            );
        });

        const launchOptions = {
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ]
        };

        if (process.platform === "win32") {
            launchOptions.executablePath =
                "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
        }

        browser = await puppeteer.launch(launchOptions);

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: "networkidle0"
        });

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

        const safeName = user.name.replace(/[^a-zA-Z0-9]/g, "_");

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${safeName}_Resume.pdf"`,
            "Content-Length": pdf.length,
            "Cache-Control": "no-store"
        });

        res.end(pdf);
    } catch (error) {
        if (browser) {
            await browser.close();
        }

        console.error("Resume PDF Error:", error.message);

        if (!res.headersSent) {
            res.status(500).send("Unable to generate resume PDF");
        }
    }
};