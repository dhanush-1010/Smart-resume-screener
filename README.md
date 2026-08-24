# AI Resume Evaluation Platform

## Overview

AI Resume Evaluation Platform is a full-stack recruitment assistance system designed to reduce the time required for initial resume screening.

Recruiters provide two inputs:

1. A candidate resume in PDF format
2. A job description

The platform processes the resume, extracts candidate information, and uses Google's Gemini AI to determine how closely the candidate's profile aligns with the role.

Instead of presenting only a numerical result, the system provides an explainable evaluation containing matched skills, missing skills, candidate experience, education, and a short AI-generated assessment.

## Why This Project?

Traditional resume screening can become repetitive when recruiters need to evaluate a large number of applicants.

This project demonstrates how AI can assist with the initial screening stage by converting an unstructured resume into useful hiring information.

The platform is intended to help answer questions such as:

* Who is the candidate?
* What technologies does the candidate know?
* What is the candidate's educational background?
* What professional experience do they have?
* Which job requirements are already satisfied?
* Which requirements are missing?
* How strong is the overall match?

## Main Features

### 1. PDF Resume Upload

Recruiters can upload a candidate's resume as a PDF.

The backend receives the file through Multer and extracts readable text using pdf-parse.

The original PDF does not need to be manually converted into text by the recruiter.

### 2. Candidate Information Extraction

After obtaining the resume text, the AI identifies relevant candidate information.

The extracted information includes:

Candidate

* Name
* Email
* Phone

Skills

* Technical skills
* Professional skills

Education

* Degree
* Institution
* Duration
* Details

Experience

* Job role
* Company
* Duration
* Summary

### 3. Job Matching

The application combines the resume and job description and sends them to Gemini AI.

Gemini evaluates the candidate according to the requirements mentioned in the job description.

The comparison considers relevant skills and experience rather than relying only on exact keyword matches.

### 4. Explainable Match Score

The system generates a score between 1 and 10.

For example:

8 / 10

The score is accompanied by supporting information such as matched skills, missing skills, and an explanation.

Example:

Matched Skills

* React
* Node.js
* MongoDB
* REST APIs

Missing Skills

* Docker
* AWS

Reason

The candidate matches most of the development requirements but does not demonstrate the requested cloud and container deployment experience.

This makes the evaluation easier to interpret than a score alone.

### 5. Screening History

Once an analysis is completed, the result is stored in MongoDB.

Recruiters can subsequently access previous screening results from the dashboard.

The stored information includes the candidate profile, evaluation score, skills, job description, and analysis date.

## Application Architecture

The application consists of a React frontend, an Express and Node.js backend, PDF processing, Gemini AI integration, and MongoDB persistence.

The React client communicates with the Express REST API using Axios.

The backend receives the resume through Multer, extracts text using pdf-parse, sends the resume and job description to Gemini, processes the resulting analysis, and stores it in MongoDB through Mongoose.

The frontend then displays the analysis and candidate history.

## Technology Stack

User Interface: React, Vite

HTTP Communication: Axios

Server: Node.js, Express.js

File Upload: Multer

PDF Processing: pdf-parse

AI Engine: Google Gemini

Database: MongoDB Atlas

ODM: Mongoose

Styling: HTML and CSS

## Processing Pipeline

The application follows a sequential processing pipeline.

### Step 1: Upload

The recruiter selects a PDF resume.

### Step 2: Job Input

The recruiter provides the job description against which the candidate should be evaluated.

### Step 3: Backend Validation

The Express API verifies:

* A resume was provided
* The uploaded file is a PDF
* The file size is acceptable
* A job description was provided

### Step 4: Text Extraction

pdf-parse extracts the readable content from the PDF.

### Step 5: AI Evaluation

The extracted resume text and job description are provided to Gemini.

### Step 6: Structured Response

Gemini returns candidate information and matching results in JSON format.

### Step 7: Data Normalization

The backend normalizes fields such as education and experience to maintain a consistent database structure.

### Step 8: Persistence

The completed analysis is stored in MongoDB.

### Step 9: Frontend Presentation

The React application displays the candidate evaluation and makes the result available through the candidate history section.

## Gemini Integration

Google Gemini acts as the intelligence layer of the application.

The configured model is:

gemini-3.5-flash-lite

The AI performs two major tasks.

### Information Extraction

It extracts structured data from the resume:

* Candidate details
* Skills
* Education
* Experience

### Job Compatibility Analysis

It compares that information with the job description and produces:

* Match score
* Matched skills
* Missing skills
* Explanation

## Expected AI Schema

The backend expects Gemini to produce an object containing:

* Candidate name, email, and phone
* Skills
* Education details
* Experience details
* Match score
* Matched skills
* Missing skills
* Justification

The backend processes this response before saving it.

## AI Prompt Guidelines

The screening prompt is designed to make the model behave consistently.

The model is instructed to:

* Return JSON only
* Use a score from 1 to 10
* Avoid unsupported assumptions
* Extract only information present in the resume
* Compare the candidate against the supplied job description
* Identify meaningful skill matches
* Identify relevant missing requirements
* Provide a concise explanation

The backend also performs response normalization because AI-generated field names may occasionally vary even when they represent the same information.

## Data Persistence

MongoDB Atlas is used to maintain the screening history.

A simplified document contains:

* fileName
* jobDescription
* resumeText
* candidate
* skills
* education
* experience
* matchScore
* matchedSkills
* missingSkills
* justification
* createdAt

The candidate object contains name, email, and phone.

Education records contain degree, institution, duration, and details.

Experience records contain role, company, duration, and summary.

## API Reference

### GET /api/health

Checks whether the server is operational.

Response:

```json
{
  "ok": true,
  "service": "smart-resume-screener"
}
```

### POST /api/analyze

Performs a complete resume screening operation.

The endpoint accepts multipart form data containing:

* resume
* jobDescription

Processing flow:

PDF to text extraction to resume and job description to Gemini to structured candidate analysis to MongoDB to API response.

### GET /api/candidates

Retrieves previously analyzed candidates.

This endpoint is used by the frontend dashboard to populate the candidate history section.

## Directory Structure

```text
smart-resume-screener/
|
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
|
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   |
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
|
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Make sure the following are installed or available:

* Node.js
* npm
* MongoDB Atlas
* Gemini API key

### Backend Installation

Clone the repository:

```bash
git clone https://github.com/Shareef-16/smart-resume-screener.git
```

Enter the project:

```bash
cd smart-resume-screener
```

Install backend dependencies:

```bash
cd backend
npm install
```

### Backend Environment

Create:

```text
backend/.env
```

Add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
CLIENT_URL=http://localhost:5173
```

Run:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

### Frontend Installation

Open another terminal:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Configuration Reference

PORT: Backend server port

MONGO_URI: MongoDB database connection

GEMINI_API_KEY: Gemini authentication

GEMINI_MODEL: AI model selected for screening

CLIENT_URL: Frontend origin for CORS

For security, actual credentials should remain inside .env.

The repository should contain only .env.example.

## Error Management

The server is designed to reject invalid requests and common processing failures.

Supported checks include:

* Missing resume
* Invalid file type
* Oversized PDF
* Missing job description
* No extractable PDF content
* Missing Gemini configuration
* Empty AI response
* Malformed AI JSON
* Database failure

This prevents the application from silently storing incomplete or invalid screening results.

## Example Evaluation

For a software engineering vacancy, the platform could generate:

Candidate Match: 7/10

Matched Requirements:

* React
* Node.js
* MongoDB
* SQL
* Git

Unmatched Requirements:

* Spring Boot
* Docker

AI Assessment:

The candidate demonstrates relevant full-stack development experience and satisfies several important technical requirements. The main gaps are Spring Boot and Docker, which are specifically requested for the position.

## Security

The application keeps credentials outside the source code.

The following should remain excluded from Git:

```text
.env
.env.*
node_modules/
dist/
```

Never expose:

* MongoDB connection strings
* Gemini API keys
* Other private environment variables

## Possible Extensions

The current implementation focuses on single-resume screening. It can be expanded into a more complete recruitment platform.

### Candidate Management

* Candidate search
* Filters by score
* Sorting by match percentage
* Candidate ranking

### Recruiter Features

* Recruiter authentication
* Multiple recruiter accounts
* Saved job descriptions
* Screening history

### AI Improvements

* Separate technical and soft-skill scores
* Experience relevance scoring
* Education relevance scoring
* Candidate recommendations
* Resume comparison
* More detailed explanations

### Reporting

* PDF screening reports
* CSV or Excel export
* Candidate ranking reports

### Scalability

* Multiple resume uploads
* Queue-based processing
* Cloud deployment
* Production database configuration

## Demonstration Scenario

A simple demonstration can be performed using the following workflow:

Launch the web application

Select a candidate PDF

Paste a job description

Submit for screening

Wait for Gemini analysis

Review candidate details

Review match score

Inspect matched skills

Inspect missing skills

Read AI justification

Open candidate history

Verify persisted record

## Project Purpose

This project demonstrates the practical integration of:

* Modern React development
* REST API design
* PDF document processing
* Generative AI
* Structured LLM output
* MongoDB persistence
* Full-stack application development

It is intended primarily as an academic, learning, and portfolio project demonstrating how generative AI can be incorporated into a recruitment workflow.

## License

This project is intended for educational and project demonstration purposes.
