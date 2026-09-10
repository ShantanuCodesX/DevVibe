const Resume = require("../models/Resume");
const User = require("../models/User");
const Project = require("../models/Project");
const PDFDocument = require("pdfkit");

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

        const doc = new PDFDocument({
            size: "A4",
            margin: 45,
            info: {
                Title: `${user.name} Resume`,
                Author: user.name
            }
        });

        const safeName = user.name
            .replace(/[^a-zA-Z0-9]/g, "_")
            .replace(/^_+|_+$/g, "") || "Resume";

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${safeName}_Resume.pdf"`,
            "Cache-Control": "no-store"
        });

        doc.pipe(res);

        const pageWidth = 595.28;
        const left = 45;
        const right = 45;
        const contentWidth = pageWidth - left - right;

        const addPageIfNeeded = (height = 80) => {
            if (doc.y + height > 770) {
                doc.addPage();
                doc.y = 45;
            }
        };

        const sectionTitle = (title) => {
            addPageIfNeeded(45);

            doc.moveDown(0.7);

            doc
                .font("Helvetica-Bold")
                .fontSize(11)
                .fillColor("#111827")
                .text(title.toUpperCase(), left, doc.y, {
                    width: contentWidth
                });

            doc
                .moveTo(left, doc.y + 4)
                .lineTo(pageWidth - right, doc.y + 4)
                .strokeColor("#d1d5db")
                .lineWidth(0.7)
                .stroke();

            doc.y += 12;
        };

        const paragraph = (text, size = 9.5) => {
            if (!text) return;

            addPageIfNeeded(50);

            doc
                .font("Helvetica")
                .fontSize(size)
                .fillColor("#374151")
                .text(String(text), left, doc.y, {
                    width: contentWidth,
                    align: "left",
                    lineGap: 2
                });

            doc.moveDown(0.35);
        };

        doc
            .font("Helvetica-Bold")
            .fontSize(24)
            .fillColor("#111827")
            .text(user.name || "Your Name", left, 45, {
                width: contentWidth,
                align: "center"
            });

        const resumeTitle =
            resume?.title ||
            user.headline ||
            "Full Stack Developer";

        doc
            .moveDown(0.25)
            .font("Helvetica")
            .fontSize(11)
            .fillColor("#2563eb")
            .text(resumeTitle, {
                width: contentWidth,
                align: "center"
            });

        const contact = [];

        if (user.email) contact.push(user.email);
        if (resume?.phone) contact.push(resume.phone);
        if (resume?.location) contact.push(resume.location);

        if (contact.length) {
            doc
                .moveDown(0.5)
                .font("Helvetica")
                .fontSize(8.5)
                .fillColor("#4b5563")
                .text(contact.join("  •  "), {
                    width: contentWidth,
                    align: "center"
                });
        }

        const links = [];

        if (user.github) links.push(`GitHub: ${user.github}`);
        if (user.linkedin) links.push(`LinkedIn: ${user.linkedin}`);

        if (links.length) {
            doc
                .moveDown(0.3)
                .font("Helvetica")
                .fontSize(8)
                .fillColor("#2563eb")
                .text(links.join("  •  "), {
                    width: contentWidth,
                    align: "center"
                });
        }

        doc
            .moveDown(0.8)
            .moveTo(left, doc.y)
            .lineTo(pageWidth - right, doc.y)
            .strokeColor("#111827")
            .lineWidth(1)
            .stroke();

        if (resume?.summary || user.bio) {
            sectionTitle("Professional Summary");
            paragraph(resume?.summary || user.bio);
        }

        const skills = [];

        if (Array.isArray(user.skills)) {
            skills.push(...user.skills.filter(Boolean));
        }

        if (resume?.additionalSkills) {
            skills.push(
                ...String(resume.additionalSkills)
                    .split(",")
                    .map(skill => skill.trim())
                    .filter(Boolean)
            );
        }

        if (skills.length) {
            sectionTitle("Technical Skills");
            paragraph([...new Set(skills)].join(" • "));
        }

        if (projects?.length) {
            sectionTitle("Projects");

            projects.forEach(project => {
                addPageIfNeeded(85);

                doc
                    .font("Helvetica-Bold")
                    .fontSize(10.5)
                    .fillColor("#111827")
                    .text(project.name || "Project", left, doc.y, {
                        width: contentWidth
                    });

                if (project.description) {
                    doc
                        .moveDown(0.2)
                        .font("Helvetica")
                        .fontSize(9)
                        .fillColor("#374151")
                        .text(project.description, {
                            width: contentWidth,
                            lineGap: 2
                        });
                }

                if (
                    Array.isArray(project.techStack) &&
                    project.techStack.length
                ) {
                    doc
                        .moveDown(0.2)
                        .font("Helvetica")
                        .fontSize(8.5)
                        .fillColor("#4b5563")
                        .text(
                            `Technologies: ${project.techStack.join(", ")}`,
                            {
                                width: contentWidth
                            }
                        );
                }

                const projectLinks = [];

                if (project.liveLink) {
                    projectLinks.push(`Live Demo: ${project.liveLink}`);
                }

                if (project.sourceCode) {
                    projectLinks.push(`Source: ${project.sourceCode}`);
                }

                if (projectLinks.length) {
                    doc
                        .moveDown(0.2)
                        .font("Helvetica")
                        .fontSize(8)
                        .fillColor("#2563eb")
                        .text(projectLinks.join("  •  "), {
                            width: contentWidth
                        });
                }

                doc.moveDown(0.65);
            });
        }

        if (
            resume?.experienceTitle ||
            resume?.company ||
            resume?.experienceDescription
        ) {
            sectionTitle("Experience");

            addPageIfNeeded(70);

            const experienceHeading = [
                resume?.experienceTitle,
                resume?.company
            ]
                .filter(Boolean)
                .join(" — ");

            if (experienceHeading) {
                doc
                    .font("Helvetica-Bold")
                    .fontSize(10)
                    .fillColor("#111827")
                    .text(experienceHeading, {
                        width: contentWidth
                    });
            }

            if (resume?.experienceDescription) {
                doc.moveDown(0.25);
                paragraph(resume.experienceDescription);
            }
        }

        if (
            resume?.degree ||
            resume?.college ||
            resume?.graduationYear
        ) {
            sectionTitle("Education");

            const education = [
                resume?.degree,
                resume?.college,
                resume?.graduationYear
            ]
                .filter(Boolean)
                .join(" — ");

            paragraph(education);
        }

        doc.end();
    } catch (error) {
        console.error("Resume PDF Error:", error.message);

        if (!res.headersSent) {
            res.status(500).send("Unable to generate resume PDF");
        }
    }
};