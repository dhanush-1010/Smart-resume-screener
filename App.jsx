import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {

    const [resume, setResume] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [result, setResult] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const getCandidates = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/candidates`);
            setCandidates(response.data);
        } catch (error) {
            console.log("Could not load previous candidates");
        }
    };


    useEffect(() => {
        getCandidates();
    }, []);


    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (selectedFile) {
            setResume(selectedFile);
            setError("");
        }
    };


    const analyzeResume = async (event) => {

        event.preventDefault();

        setError("");
        setResult(null);

        if (!resume) {
            setError("Please select a PDF resume.");
            return;
        }

        if (!jobDescription.trim()) {
            setError("Please enter a job description.");
            return;
        }

        const formData = new FormData();

        formData.append("resume", resume);
        formData.append("jobDescription", jobDescription);


        try {

            setLoading(true);

            const response = await axios.post(
                `${API_URL}/api/analyze`,
                formData
            );

            setResult(response.data);

            getCandidates();

        } catch (error) {

            const message =
                error.response?.data?.message ||
                "Resume analysis failed.";

            setError(message);

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="app">

            <header>
                <div>
                    <span className="eyebrow">
                        AI RECRUITMENT TOOL
                    </span>

                    <h1>
                        Smart Resume Screener
                    </h1>

                    <p>
                        Analyze resumes against job descriptions
                        and get an explainable match score.
                    </p>
                </div>
            </header>


            <main>

                <section className="grid">

                    <form
                        className="panel"
                        onSubmit={analyzeResume}
                    >

                        <h2>
                            Screen a Resume
                        </h2>


                        <label>
                            Resume PDF
                        </label>

                        <label className="dropzone">

                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                            />

                            <strong>
                                {resume
                                    ? resume.name
                                    : "Choose a PDF resume"}
                            </strong>

                            <span>
                                Maximum file size: 8 MB
                            </span>

                        </label>


                        <label>
                            Job Description
                        </label>

                        <textarea
                            value={jobDescription}
                            onChange={(event) =>
                                setJobDescription(event.target.value)
                            }
                            placeholder="Paste the job description here..."
                            rows="12"
                        />


                        {error && (
                            <div className="error">
                                {error}
                            </div>
                        )}


                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Analyzing..."
                                : "Analyze Resume"}
                        </button>

                    </form>


                    <section className="panel result">

                        <h2>
                            Screening Result
                        </h2>


                        {!result && !loading && (
                            <div className="empty">
                                Upload a resume and job description
                                to see the analysis.
                            </div>
                        )}


                        {loading && (
                            <div className="empty">
                                Extracting resume information
                                and generating match analysis...
                            </div>
                        )}


                        {result && (
                            <>

                                <div className="score">

                                    <div className="scoreNumber">
                                        {result.matchScore}
                                        <small>/10</small>
                                    </div>

                                    <div>

                                        <h3>
                                            {result.candidate?.name ||
                                                "Candidate"}
                                        </h3>

                                        <p>
                                            {result.candidate?.email ||
                                                "Email not available"}
                                        </p>

                                    </div>

                                </div>


                                <h3>
                                    Justification
                                </h3>

                                <p className="justification">
                                    {result.justification}
                                </p>


                                <div className="two">

                                    <div>

                                        <h3>
                                            Matched Skills
                                        </h3>

                                        <div className="chips">

                                            {(result.matchedSkills || [])
                                                .map((skill, index) => (
                                                    <span
                                                        className="chip good"
                                                        key={index}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}

                                        </div>

                                    </div>


                                    <div>

                                        <h3>
                                            Missing Skills
                                        </h3>

                                        <div className="chips">

                                            {(result.missingSkills || [])
                                                .map((skill, index) => (
                                                    <span
                                                        className="chip bad"
                                                        key={index}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}

                                        </div>

                                    </div>

                                </div>


                                <h3>
                                    Extracted Skills
                                </h3>

                                <div className="chips">

                                    {(result.skills || [])
                                        .map((skill, index) => (
                                            <span
                                                className="chip"
                                                key={index}
                                            >
                                                {skill}
                                            </span>
                                        ))}

                                </div>


                                <h3>
                                    Experience
                                </h3>

                                {result.experience?.length === 0 ? (

                                    <p>
                                        No experience information extracted.
                                    </p>

                                ) : (

                                    result.experience?.map((item, index) => (

                                        <div
                                            className="experience"
                                            key={index}
                                        >

                                            <strong>
                                                {item.role || "Role"}

                                                {item.company &&
                                                    ` · ${item.company}`}
                                            </strong>

                                            <small>
                                                {item.duration}
                                            </small>

                                            <p>
                                                {item.summary}
                                            </p>

                                        </div>

                                    ))

                                )}

                            </>
                        )}

                    </section>

                </section>


                <section className="panel">

                    <div className="sectionHead">

                        <div>

                            <h2>
                                Previous Candidates
                            </h2>

                            <p>
                                Recently analyzed resumes stored
                                in MongoDB.
                            </p>

                        </div>


                        <button
                            className="secondary"
                            type="button"
                            onClick={getCandidates}
                        >
                            Refresh
                        </button>

                    </div>


                    {candidates.length === 0 ? (

                        <div className="empty">
                            No candidates analyzed yet.
                        </div>

                    ) : (

                        <div className="tableWrap">

                            <table>

                                <thead>

                                    <tr>
                                        <th>Candidate</th>
                                        <th>Score</th>
                                        <th>Skills</th>
                                        <th>Analyzed</th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {candidates.map((candidate) => (

                                        <tr key={candidate._id}>

                                            <td>
                                                <strong>
                                                    {candidate.candidate?.name ||
                                                        "Unknown"}
                                                </strong>

                                                <br />

                                                <small>
                                                    {candidate.fileName}
                                                </small>
                                            </td>


                                            <td>
                                                <b>
                                                    {candidate.matchScore}/10
                                                </b>
                                            </td>


                                            <td>
                                                {(candidate.skills || [])
                                                    .slice(0, 5)
                                                    .join(", ")}
                                            </td>


                                            <td>
                                                {new Date(
                                                    candidate.createdAt
                                                ).toLocaleString()}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default App;