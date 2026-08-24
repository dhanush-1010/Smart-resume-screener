import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import mongoose from "mongoose";
import pdfParse from "pdf-parse";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json({ limit: "2mb" }));

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 8 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF resumes are supported."));
        }
    }
});

const analysisSchema = new mongoose.Schema({
    fileName: String,
    jobDescription: String,
    resumeText: String,

    candidate: {
        name: String,
        email: String,
        phone: String
    },

    skills: [String],

    education: [{
        degree: String,
        institution: String,
        duration: String,
        details: String
    }],

    experience: [{
        role: String,
        company: String,
        duration: String,
        summary: String
    }],

    matchScore: Number,
    matchedSkills: [String],
    missingSkills: [String],
    justification: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Analysis = mongoose.model("Analysis", analysisSchema);

const ai = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    })
    : null;


async function analyzeResume(resumeText, jobDescription) {

    if (!ai) {
        throw new Error("GEMINI_API_KEY is missing in backend/.env");
    }

    const prompt = `
You are a resume screening assistant.

Compare the resume with the given job description and return the result as JSON.

Use exactly this structure:

{
    "candidate": {
        "name": "",
        "email": "",
        "phone": ""
    },
    "skills": [],
    "education": [
        {
            "degree": "",
            "institution": "",
            "duration": "",
            "details": ""
        }
    ],
    "experience": [
        {
            "role": "",
            "company": "",
            "duration": "",
            "summary": ""
        }
    ],
    "matchScore": 0,
    "matchedSkills": [],
    "missingSkills": [],
    "justification": ""
}

Rules:
- matchScore should be an integer between 1 and 10.
- Only use information available in the resume.
- Do not make up education, skills or experience.
- Extract the important technical and professional skills.
- Compare the resume skills and experience with the job description.
- Keep the justification short and clear.
- Return only JSON.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText.slice(0, 30000)}
`;

    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            temperature: 0.1,
            responseMimeType: "application/json"
        }
    });

    const text = response.text?.trim();

    if (!text) {
        throw new Error("No response received from Gemini.");
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        throw new Error("Gemini returned an invalid response.");
    }
}


app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        service: "smart-resume-screener"
    });
});


app.post("/api/analyze", upload.single("resume"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a PDF resume."
            });
        }

        const jobDescription = (req.body.jobDescription || "").trim();

        if (!jobDescription) {
            return res.status(400).json({
                message: "Please provide a job description."
            });
        }

        const pdf = await pdfParse(req.file.buffer);
        const resumeText = (pdf.text || "").trim();

        if (!resumeText) {
            return res.status(400).json({
                message: "Could not extract text from this PDF."
            });
        }

        const result = await analyzeResume(
            resumeText,
            jobDescription
        );

        // Gemini can sometimes return education fields
        // using slightly different names.
        if (Array.isArray(result.education)) {
            result.education = result.education.map(item => ({
                degree: item.degree || item.role || "",
                institution: item.institution || item.company || "",
                duration: item.duration || "",
                details: item.details || item.summary || ""
            }));
        }

        const candidate = await Analysis.create({
            fileName: req.file.originalname,
            jobDescription,
            resumeText,
            ...result
        });

        res.status(201).json(candidate);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message || "Analysis failed."
        });
    }
});


app.get("/api/candidates", async (req, res) => {

    try {

        const candidates = await Analysis.find()
            .select("-resumeText -jobDescription")
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(candidates);

    } catch (error) {

        res.status(500).json({
            message: "Could not load candidates."
        });
    }
});


app.use((error, req, res, next) => {

    res.status(400).json({
        message: error.message || "Request failed."
    });
});


async function startServer() {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Backend running on http://localhost:${PORT}`);
        });

    } catch (error) {

        console.error("Startup failed:", error.message);
        process.exit(1);
    }
}

startServer();