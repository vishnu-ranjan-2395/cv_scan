const API_URL = "http://127.0.0.1:8000";

let allCandidates = [];
let currentCandidate = null;

let pipelineCandidates = {};
let analyticsData = null;

let pipelineChart = null;
let scoreDistributionChart = null;
let topSkillsChart = null;

let candidateSkillCharts = {};


// ============================================================
// DOM READY
// ============================================================

// ============================================================
// INTRO VIDEO
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("introVideoOverlay");
    const video = document.getElementById("introVideo");

    if (!overlay || !video) return;

    const finishIntro = () => {
        overlay.classList.add("intro-video-hidden");
        setTimeout(() => overlay.remove(), 650);
    };

    video.addEventListener("ended", finishIntro, { once: true });
    video.play().catch(() => {});
});

document.addEventListener("DOMContentLoaded", async () => {

    initializeNavigation();

    initializeSearch();

    initializeStatusFilter();

    initializeUpload();

    initializeProfileClose();

    initializeDropZone();

    await loadChartJS();

    loadCandidates();

});


// ============================================================
// NAVIGATION
// ============================================================

function initializeNavigation() {

    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach((item) => {

        item.addEventListener("click", () => {

            navItems.forEach((nav) => {
                nav.classList.remove("active");
            });

            item.classList.add("active");

            const section = item.dataset.section;

            if (section === "candidates") {

                showCandidatesSection();

            } else if (section === "pipeline") {

                showPipelineSection();

            } else if (section === "analytics") {

                showAnalyticsSection();

            } else if (section === "jobs") {

                showJobsSection();

            } else if (section === "history") {

                showHistorySection();

            } else if (section === "help") {

                showHelpSection();

            }

        });

    });

}


// ============================================================
// MAIN CONTENT VISIBILITY
// ============================================================

function hideDashboardContent() {

    const jobRecommendationsSection = document.getElementById(
        "jobRecommendationsSection"
    );

    if (jobRecommendationsSection) {
        jobRecommendationsSection.style.display = "none";
    }

    const dashboard = document.getElementById(
        "dashboardContent"
    );

    if (dashboard) {
        dashboard.style.display = "none";
    }

    const pipeline = document.getElementById(
        "pipelineSection"
    );

    if (pipeline) {
        pipeline.style.display = "none";
    }

    const analytics = document.getElementById(
        "analyticsSection"
    );

    if (analytics) {
        analytics.style.display = "none";
    }

    const simple = document.getElementById(
        "simpleSection"
    );

    if (simple) {
        simple.remove();
    }

}


// ============================================================
// HEADER UPDATE
// ============================================================

function updatePageHeader(title, subtitle) {

    const pageTitle = document.getElementById("pageTitle");

    const pageSubtitle =
        document.getElementById("pageSubtitle");

    if (pageTitle) {
        pageTitle.textContent = title;
    }

    if (pageSubtitle) {
        pageSubtitle.textContent = subtitle;
    }

}


// ============================================================
// CANDIDATES SECTION
// ============================================================

function showCandidatesSection() {

    hideDashboardContent();

    const dashboard =
        document.getElementById("dashboardContent");

    if (dashboard) {
        dashboard.style.display = "block";
    }

    updatePageHeader(
        "Candidate Screening",
        "Analyze resumes and identify the best matching candidates."
    );

}


// ============================================================
// PIPELINE SECTION
// ============================================================

function showPipelineSection() {

    hideDashboardContent();

    let pipelineSection =
        document.getElementById("pipelineSection");

    if (!pipelineSection) {

        pipelineSection =
            createPipelineSection();

        const main =
            document.querySelector(".main-content");

        if (main) {
            main.appendChild(pipelineSection);
        } else {
            document.body.appendChild(pipelineSection);
        }

    }

    pipelineSection.style.display = "block";

    updatePageHeader(
        "Candidate Pipeline",
        "Track candidates through the recruitment process."
    );

    loadPipeline();

}


// ============================================================
// ANALYTICS SECTION
// ============================================================

function showAnalyticsSection() {

    hideDashboardContent();

    let analyticsSection =
        document.getElementById("analyticsSection");

    if (!analyticsSection) {

        analyticsSection =
            createAnalyticsSection();

        const main =
            document.querySelector(".main-content");

        if (main) {
            main.appendChild(analyticsSection);
        } else {
            document.body.appendChild(analyticsSection);
        }

    }

    analyticsSection.style.display = "block";

    updatePageHeader(
        "Analytics Dashboard",
        "AI-powered candidate screening insights."
    );

    loadAnalytics();

}


// ============================================================
// SIMPLE SECTIONS
// ============================================================

function createSimpleSection(
    id,
    title,
    description,
    content = ""
) {

    const existing =
        document.getElementById(id);

    if (existing) {
        existing.remove();
    }

    const section =
        document.createElement("section");

    section.id = id;

    section.className =
        "simple-placeholder-section";

    section.innerHTML = `

        <div class="simple-placeholder-card">

            <h2>
                ${escapeHtml(title)}
            </h2>

            <p>
                ${escapeHtml(description)}
            </p>

            ${content}

        </div>

    `;

    const main =
        document.querySelector(".main-content");

    if (main) {
        main.appendChild(section);
    } else {
        document.body.appendChild(section);
    }

    return section;
}


// ============================================================
// JOB RECOMMENDATIONS
// ============================================================

// ============================================================
// JOB RECOMMENDATIONS
// ============================================================

function showJobsSection() {

    hideDashboardContent();

    updatePageHeader(
        "Job Recommendations",
        "AI-powered job recommendations based on candidate profiles."
    );

    const section =
        createJobRecommendationsSection();

    const main =
        document.querySelector(".main-content");

    if (main) {

        main.appendChild(section);

    } else {

        document.body.appendChild(section);

    }

    loadJobRecommendationCandidates();

}


// ============================================================
// CREATE JOB RECOMMENDATION SECTION
// ============================================================

function createJobRecommendationsSection() {

    const existing =
        document.getElementById(
            "simpleSection"
        );

    if (existing) {

        existing.remove();

    }

    const existingJobs =
        document.getElementById(
            "jobRecommendationsSection"
        );

    if (existingJobs) {

        existingJobs.remove();

    }

    const section =
        document.createElement(
            "section"
        );

    section.id =
        "jobRecommendationsSection";

    section.className =
        "job-recommendations-section";

    section.innerHTML = `

        <div class="job-recommendations-header">

            <div>

                <h2>
                    AI Job Role Recommendations
                </h2>

                <p>
                    Discover job roles that match
                    the candidate's resume profile
                    using semantic AI.
                </p>

            </div>

        </div>


        <div class="job-recommendation-selector-card">

            <div class="job-selector-title">

                <h3>
                    Select Candidate
                </h3>

                <p>
                    Choose a screened candidate
                    to generate AI-powered role
                    recommendations.
                </p>

            </div>


            <div class="job-selector-row">

                <select
                    id="jobRecommendationCandidate"
                    class="job-recommendation-select"
                >

                    <option value="">
                        Select a candidate
                    </option>

                </select>


                <button
                    id="generateRoleRecommendations"
                    class="job-recommendation-button"
                    type="button"
                >
                    Generate Recommendations
                </button>

            </div>

        </div>


        <div
            id="jobRecommendationCandidateInfo"
            class="job-recommendation-candidate-info"
            style="display:none;"
        ></div>


        <div
            id="jobRecommendationResults"
            class="job-recommendation-results"
        >

            <div class="job-recommendation-empty">

                <div class="job-recommendation-empty-icon">
                    ✦
                </div>

                <h3>
                    Select a candidate
                </h3>

                <p>
                    Choose a candidate above to
                    discover suitable job roles.
                </p>

            </div>

        </div>

    `;

    const select =
        section.querySelector(
            "#jobRecommendationCandidate"
        );

    const button =
        section.querySelector(
            "#generateRoleRecommendations"
        );

    if (select) {

        select.addEventListener(
            "change",
            () => {

                const candidateId =
                    select.value;

                if (!candidateId) {

                    clearJobRecommendationResults();

                    return;

                }

                const candidate =
                    allCandidates.find(
                        item =>
                            Number(item.id) ===
                            Number(candidateId)
                    );

                if (candidate) {

                    renderJobRecommendationCandidateInfo(
                        candidate
                    );

                }

            }
        );

    }

    if (button) {

        button.addEventListener(
            "click",
            generateJobRecommendations
        );

    }

    return section;

}


// ============================================================
// LOAD CANDIDATES FOR JOB RECOMMENDATION
// ============================================================

function loadJobRecommendationCandidates() {

    const select =
        document.getElementById(
            "jobRecommendationCandidate"
        );

    if (!select) {

        return;

    }

    select.innerHTML = `

        <option value="">
            Select a candidate
        </option>

    `;

    if (!allCandidates.length) {

        select.innerHTML = `

            <option value="">
                No screened candidates available
            </option>

        `;

        return;

    }

    allCandidates.forEach(
        candidate => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                candidate.id;

            option.textContent =
                `${candidate.name || "Unknown Candidate"} — ${
                    candidate.position ||
                    "Position not specified"
                }`;

            select.appendChild(
                option
            );

        }
    );

}


// ============================================================
// CANDIDATE INFORMATION
// ============================================================

function renderJobRecommendationCandidateInfo(
    candidate
) {

    const container =
        document.getElementById(
            "jobRecommendationCandidateInfo"
        );

    if (!container) {

        return;

    }

    const skills =
        Array.isArray(candidate.skills)
            ? candidate.skills
            : String(
                candidate.skills || ""
            )
                .split(",")
                .map(
                    skill =>
                        skill.trim()
                )
                .filter(Boolean);

    const score =
        Number(
            candidate.final_score || 0
        );

    container.style.display =
        "block";

    container.innerHTML = `

        <div class="job-candidate-summary">

            <div class="job-candidate-avatar">

                ${escapeHtml(
                    getInitials(
                        candidate.name
                    )
                )}

            </div>


            <div class="job-candidate-details">

                <h3>

                    ${escapeHtml(
                        candidate.name ||
                        "Unknown Candidate"
                    )}

                </h3>

                <p>

                    ${escapeHtml(
                        candidate.position ||
                        "Position not specified"
                    )}

                </p>

                <div class="job-candidate-skills">

                    ${
                        skills.length
                            ? skills
                                .slice(0, 8)
                                .map(
                                    skill => `
                                        <span>
                                            ${escapeHtml(skill)}
                                        </span>
                                    `
                                )
                                .join("")
                            : `
                                <span>
                                    No skills detected
                                </span>
                            `
                    }

                </div>

            </div>


            <div class="job-candidate-score">

                <span>
                    Screening Match
                </span>

                <strong>
                    ${score.toFixed(2)}%
                </strong>

            </div>

        </div>

    `;

}


// ============================================================
// GENERATE JOB RECOMMENDATIONS
// ============================================================

async function generateJobRecommendations() {

    const select =
        document.getElementById(
            "jobRecommendationCandidate"
        );

    const button =
        document.getElementById(
            "generateRoleRecommendations"
        );

    const results =
        document.getElementById(
            "jobRecommendationResults"
        );

    if (!select || !results) {

        return;

    }

    const candidateId =
        select.value;

    if (!candidateId) {

        showToast(
            "Please select a candidate.",
            "error"
        );

        return;

    }

    if (button) {

        button.disabled =
            true;

        button.textContent =
            "AI Analyzing...";

    }

    results.innerHTML = `

        <div class="job-recommendation-loading">

            <div class="job-loading-spinner"></div>

            <h3>
                Analyzing Candidate Profile
            </h3>

            <p>
                AI is comparing the candidate's
                profile with available job roles.
            </p>

        </div>

    `;

    try {

        const response =
            await fetch(
                `${API_URL}/recommend-roles/${candidateId}`
            );

        let data = {};

        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "Invalid response from recommendation server."
            );

        }

        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to generate job recommendations."
            );

        }

        renderJobRecommendations(
            data
        );

        showToast(
            "AI job recommendations generated.",
            "success"
        );

    } catch (error) {

        console.error(
            "Job recommendation error:",
            error
        );

        results.innerHTML = `

            <div class="job-recommendation-error">

                <h3>
                    Recommendation Failed
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Unable to generate recommendations."
                    )}
                </p>

            </div>

        `;

        showToast(
            error.message ||
            "Unable to generate job recommendations.",
            "error"
        );

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Generate Recommendations";

        }

    }

}


// ============================================================
// RENDER JOB RECOMMENDATIONS
// ============================================================

function renderJobRecommendations(
    data
) {

    const results =
        document.getElementById(
            "jobRecommendationResults"
        );

    if (!results) {

        return;

    }

    const recommendations =
        Array.isArray(
            data.recommendations
        )
            ? data.recommendations
            : [];

    if (!recommendations.length) {

        results.innerHTML = `

            <div class="job-recommendation-empty">

                <div class="job-recommendation-empty-icon">
                    !
                </div>

                <h3>
                    No Recommendations Available
                </h3>

                <p>
                    The candidate profile does not
                    contain enough information for
                    role recommendation.
                </p>

            </div>

        `;

        return;

    }

    const candidateName =
        data.candidate &&
        data.candidate.name
            ? data.candidate.name
            : "Candidate";

    results.innerHTML = `

        <div class="job-recommendations-title">

            <div>

                <h2>
                    Recommended Job Roles
                </h2>

                <p>
                    AI-generated role matches for
                    ${escapeHtml(candidateName)}.
                </p>

            </div>

            <div class="job-recommendation-count">

                ${recommendations.length}
                roles analyzed

            </div>

        </div>


        <div class="job-recommendation-list">

            ${recommendations
                .map(
                    recommendation =>
                        createJobRecommendationCard(
                            recommendation
                        )
                )
                .join("")
            }

        </div>

    `;

}


// ============================================================
// JOB RECOMMENDATION CARD
// ============================================================

function createJobRecommendationCard(
    recommendation
) {

    const rank =
        Number(
            recommendation.rank || 0
        );

    const role =
        recommendation.role ||
        "Unknown Role";

    const matchPercentage =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    recommendation.match_percentage ||
                    0
                )
            )
        );

    let rankClass =
        "job-rank-default";

    if (rank === 1) {

        rankClass =
            "job-rank-first";

    } else if (rank === 2) {

        rankClass =
            "job-rank-second";

    } else if (rank === 3) {

        rankClass =
            "job-rank-third";

    }

    return `

        <div class="job-recommendation-card">

            <div class="job-recommendation-rank ${rankClass}">

                #${rank}

            </div>


            <div class="job-recommendation-main">

                <div class="job-recommendation-role">

                    <h3>
                        ${escapeHtml(role)}
                    </h3>

                    <span>
                        AI Role Match
                    </span>

                </div>


                <div class="job-recommendation-progress-container">

                    <div class="job-recommendation-progress-top">

                        <span>
                            Semantic AI Match
                        </span>

                        <strong>
                            ${matchPercentage.toFixed(2)}%
                        </strong>

                    </div>


                    <div class="job-recommendation-progress">

                        <div
                            class="job-recommendation-progress-fill"
                            style="
                                width:${matchPercentage}%;
                            "
                        ></div>

                    </div>

                </div>

            </div>


            <div class="job-recommendation-score">

                <strong>
                    ${matchPercentage.toFixed(1)}%
                </strong>

                <span>
                    Match
                </span>

            </div>

        </div>

    `;

}


// ============================================================
// CLEAR JOB RECOMMENDATIONS
// ============================================================

function clearJobRecommendationResults() {

    const candidateInfo =
        document.getElementById(
            "jobRecommendationCandidateInfo"
        );

    const results =
        document.getElementById(
            "jobRecommendationResults"
        );

    if (candidateInfo) {

        candidateInfo.style.display =
            "none";

        candidateInfo.innerHTML =
            "";

    }

    if (results) {

        results.innerHTML = `

            <div class="job-recommendation-empty">

                <div class="job-recommendation-empty-icon">
                    ✦
                </div>

                <h3>
                    Select a candidate
                </h3>

                <p>
                    Choose a candidate above to
                    discover suitable job roles.
                </p>

            </div>

        `;

    }

}


// ============================================================
// HISTORY
// ============================================================

function showHistorySection() {

    hideDashboardContent();

    updatePageHeader(
        "Screening History",
        "View previous resume screening activity."
    );

    const section =
        createSimpleSection(
            "simpleSection",
            "Screening History",
            "Previous resume screening activity."
        );

    const card =
        section.querySelector(
            ".simple-placeholder-card"
        );

    if (!card) {
        return;
    }

    if (!allCandidates.length) {

        card.innerHTML += `

            <div class="history-empty">

                <p>
                    No screening history available yet.
                </p>

            </div>

        `;

        return;
    }

    const historyContainer =
        document.createElement("div");

    historyContainer.className =
        "history-container";

    historyContainer.innerHTML = `

        <div class="history-table-wrapper">

            <table class="history-table">

                <thead>

                    <tr>

                        <th>Candidate</th>

                        <th>Position</th>

                        <th>AI Match</th>

                        <th>Status</th>

                        <th>Pipeline</th>

                        <th>Screened On</th>

                    </tr>

                </thead>

                <tbody id="historyTableBody"></tbody>

            </table>

        </div>

    `;

    card.appendChild(historyContainer);

    const tbody =
        document.getElementById(
            "historyTableBody"
        );

    allCandidates.forEach((candidate) => {

        const row =
            document.createElement("tr");

        const score =
            Number(
                candidate.final_score || 0
            );

        row.innerHTML = `

            <td>

                <strong>
                    ${escapeHtml(
                        candidate.name ||
                        "Unknown Candidate"
                    )}
                </strong>

                <small style="display:block;color:#6b7280;">
                    ${escapeHtml(
                        candidate.email ||
                        "No email"
                    )}
                </small>

            </td>

            <td>
                ${escapeHtml(
                    candidate.position ||
                    "Unknown Position"
                )}
            </td>

            <td>
                <strong>
                    ${score.toFixed(2)}%
                </strong>
            </td>

            <td>

                <span class="${getStatusClass(
                    candidate.status
                )}">
                    ${escapeHtml(
                        candidate.status ||
                        "Screened"
                    )}
                </span>

            </td>

            <td>
                ${escapeHtml(
                    candidate.pipeline_stage ||
                    "Screening"
                )}
            </td>

            <td>
                ${formatDate(
                    candidate.created_at
                )}
            </td>

        `;

        row.style.cursor = "pointer";

        row.addEventListener("click", () => {

            showCandidatesSection();

            setActiveNavigation("candidates");

            openCandidateProfile(
                candidate.id
            );

        });

        tbody.appendChild(row);

    });

}


// ============================================================
// HELP
// ============================================================

function showHelpSection() {

    hideDashboardContent();

    updatePageHeader(
        "Help & Support",
        "Information about using the CV Scan AI recruiting system."
    );

    const section =
        createSimpleSection(
            "simpleSection",
            "Help & Support",
            "CV Scan helps recruiters screen resumes using OCR, NLP and semantic AI."
        );

    const card =
        section.querySelector(
            ".simple-placeholder-card"
        );

    if (!card) {
        return;
    }

    card.innerHTML += `

        <div style="
            margin-top:24px;
            display:grid;
            gap:14px;
        ">

            <div>
                <strong>1. Add Resume</strong>
                <p>
                    Upload a PDF, DOC, DOCX or image resume.
                </p>
            </div>

            <div>
                <strong>2. Enter Job Description</strong>
                <p>
                    Paste the target job description.
                </p>
            </div>

            <div>
                <strong>3. Analyze</strong>
                <p>
                    CV Scan extracts resume information
                    and calculates the candidate match score.
                </p>
            </div>

            <div>
                <strong>4. Review Candidate</strong>
                <p>
                    Click a candidate to view detailed
                    screening information.
                </p>
            </div>

        </div>

    `;

}


// ============================================================
// SET ACTIVE NAVIGATION
// ============================================================

function setActiveNavigation(sectionName) {

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach((item) => {

        item.classList.toggle(
            "active",
            item.dataset.section === sectionName
        );

    });

}


// ============================================================
// LOAD CANDIDATES
// ============================================================

async function loadCandidates() {

    try {

        const response =
            await fetch(
                `${API_URL}/candidates`
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load candidates."
            );

        }

        const data =
            await response.json();

        allCandidates =
            data.candidates || [];

        renderCandidates(
            allCandidates
        );

        updateDashboardStats(
            allCandidates
        );

    } catch (error) {

        console.error(
            "Candidate loading error:",
            error
        );

        showToast(
            "Unable to load candidates.",
            "error"
        );

    }

}


// ============================================================
// RENDER CANDIDATES
// ============================================================

function renderCandidates(candidates) {

    const tableBody =
        document.getElementById(
            "candidateTableBody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    if (!candidates.length) {

        tableBody.innerHTML = `

            <tr class="empty-row">

                <td
                    colspan="4"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#6b7280;
                    "
                >
                    No candidates screened yet.
                </td>

            </tr>

        `;

        return;
    }

    candidates.forEach((candidate) => {

        const row =
            document.createElement("tr");

        row.className =
            "candidate-row";

        row.dataset.id =
            candidate.id;

        const score =
            Number(
                candidate.final_score || 0
            );

        const status =
            candidate.status ||
            "Screened";

        row.innerHTML = `

            <td class="select-cell">

                <input
                type="checkbox"
                    class="candidate-checkbox"
                    data-candidate-id="${candidate.id}"
                    title="Select candidate"
                >

            </td>

            <td>

                <div class="candidate-name-cell">

                    <div class="candidate-avatar">
                        ${getInitials(candidate.name)}
                    </div>

                    <div>

                        <strong>
                            ${escapeHtml(
                                candidate.name ||
                                "Unknown Candidate"
                            )}
                        </strong>

                        <small>
                            ${escapeHtml(
                                candidate.email ||
                                "No email"
                            )}
                        </small>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHtml(
                    candidate.position ||
                    "Unknown Position"
                )}
            </td>


            <td>

                <strong>
                    ${score.toFixed(2)}%
                </strong>

            </td>


            <td>

                <span class="${getStatusClass(status)}">
                    ${escapeHtml(status)}
                </span>

            </td>

        `;

        row.addEventListener(
            "click",
            (event) => {

                if (
                    event.target.classList.contains(
                        "candidate-checkbox"
                    )
                ) {
                    return;
                }

                openCandidateProfile(
                candidate.id
                );

            }
        );

        tableBody.appendChild(row);

    });

}
// ============================================================
// COMPARE CANDIDATES
// ============================================================

let selectedCandidateIds = [];


// ------------------------------------------------------------
// INITIALIZE COMPARE FEATURE
// ------------------------------------------------------------

function initializeCandidateComparison() {

    const compareButton =
        document.getElementById(
            "compareCandidatesButton"
        );

    const closeButton =
        document.getElementById(
            "closeCompareButton"
        );

    if (compareButton) {

        compareButton.addEventListener(
            "click",
            openCandidateComparison
        );

    }

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeCandidateComparison
        );

    }


    document.addEventListener(
        "change",
        function(event) {

            if (
                event.target.classList.contains(
                    "candidate-checkbox"
                )
            ) {

                updateSelectedCandidates(
                    event.target
                );

            }

        }
    );

}


// ------------------------------------------------------------
// UPDATE SELECTED CANDIDATES
// ------------------------------------------------------------

function updateSelectedCandidates(checkbox) {

    const candidateId =
        Number(
            checkbox.dataset.candidateId
        );


    if (checkbox.checked) {

        if (
            selectedCandidateIds.length >= 5
        ) {

            checkbox.checked = false;

            showToast(
                "You can compare a maximum of 5 candidates.",
                "error"
            );

            return;

        }

        selectedCandidateIds.push(
            candidateId
        );

    } else {

        selectedCandidateIds =
            selectedCandidateIds.filter(
                id =>
                    id !== candidateId
            );

    }


    updateCompareButton();
}


// ------------------------------------------------------------
// UPDATE BUTTON
// ------------------------------------------------------------

function updateCompareButton() {

    const button =
        document.getElementById(
            "compareCandidatesButton"
        );

    if (!button) {
        return;
    }


    if (
        selectedCandidateIds.length === 0
    ) {

        button.textContent =
            "⇄ Compare Candidates";

    } else {

        button.textContent =
            `⇄ Compare (${selectedCandidateIds.length})`;

    }

}


// ------------------------------------------------------------
// OPEN COMPARISON
// ------------------------------------------------------------

function openCandidateComparison() {

    if (
        selectedCandidateIds.length < 2
    ) {

        showToast(
            "Please select at least 2 candidates.",
            "error"
        );

        return;

    }


    const selectedCandidates =
        allCandidates.filter(
            candidate =>
                selectedCandidateIds.includes(
                    Number(candidate.id)
                )
        );


    if (
        selectedCandidates.length < 2
    ) {

        showToast(
            "Unable to find selected candidates.",
            "error"
        );

        return;

    }


    const comparisonSection =
        document.getElementById(
            "compareCandidates"
        );

    const profile =
        document.getElementById(
            "screeningResult"
        );


    if (profile) {

        profile.classList.add(
            "hidden"
        );

        profile.style.display =
            "none";

    }


    if (comparisonSection) {

        comparisonSection.classList.remove(
            "hidden"
        );

        comparisonSection.style.display =
            "block";

        comparisonSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    renderCandidateComparison(
        selectedCandidates
    );

}


// ------------------------------------------------------------
// RENDER COMPARISON
// ------------------------------------------------------------

function renderCandidateComparison(
    candidates
) {

    const tableHead =
        document.getElementById(
            "compareTableHead"
        );

    const tableBody =
        document.getElementById(
            "compareTableBody"
        );

    const message =
        document.getElementById(
            "compareMessage"
        );


    if (
        !tableHead ||
        !tableBody
    ) {
        return;
    }


    message.textContent =
        `${candidates.length} candidates selected for comparison.`;


    // TABLE HEADER

    tableHead.innerHTML = `

        <tr>

            <th>
                Category
            </th>

            ${candidates.map(
                candidate => `

                    <th>

                        <div class="compare-candidate-name">

                            <div class="compare-avatar">
                                ${getInitials(
                                    candidate.name
                                )}
                            </div>

                            <span>
                                ${escapeHtml(
                                    candidate.name ||
                                    "Unknown Candidate"
                                )}
                            </span>

                        </div>

                    </th>

                `
            ).join("")}

        </tr>

    `;


    // TABLE BODY

    const comparisonRows = [

        {
            label: "Position",
            key: "position",
            format: value =>
                value || "Not specified"
        },

        {
            label: "AI Match",
            key: "final_score",
            format: value =>
                `${Number(value || 0).toFixed(2)}%`
        },

        {
            label: "Semantic Match",
            key: "semantic_score",
            format: value =>
                `${Number(value || 0).toFixed(2)}%`
        },

        {
            label: "Skills Match",
            key: "skill_score",
            format: value =>
                `${Number(value || 0).toFixed(2)}%`
        },

        {
            label: "Experience",
            key: "experience_score",
            format: value =>
                `${Number(value || 0).toFixed(2)}%`
        },

        {
            label: "Education",
            key: "education_score",
            format: value =>
                `${Number(value || 0).toFixed(2)}%`
        },

        {
            label: "Projects",
            key: "project_score",
            format: value =>
                `${Number(value || 0).toFixed(2)}%`
        },

        {
            label: "Status",
            key: "status",
            format: value =>
                value || "Screened"
        }

    ];


    tableBody.innerHTML =
        comparisonRows.map(
            row => `

                <tr>

                    <td class="comparison-label">
                        ${row.label}
                    </td>

                    ${candidates.map(
                        candidate => `

                            <td>
                                ${escapeHtml(
                                    String(
                                        row.format(
                                            candidate[
                                                row.key
                                            ]
                                        )
                                    )
                                )}
                            </td>

                        `
                    ).join("")}

                </tr>

            `
        ).join("");


    renderComparisonInsights(
        candidates
    );

}


// ------------------------------------------------------------
// COMPARISON INSIGHTS
// ------------------------------------------------------------

function renderComparisonInsights(
    candidates
) {

    const container =
        document.getElementById(
            "comparisonInsights"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        candidates.map(
            candidate => {

                const score =
                    Number(
                        candidate.final_score || 0
                    );

                const skills =
                    candidate.skills ||
                    "No skills detected";


                return `

                    <div class="comparison-insight-card">

                        <div class="comparison-insight-header">

                            <div class="compare-avatar small">
                                ${getInitials(
                                    candidate.name
                                )}
                            </div>

                            <div>

                                <strong>
                                    ${escapeHtml(
                                        candidate.name ||
                                        "Unknown Candidate"
                                    )}
                                </strong>

                                <span>
                                    AI Match:
                                    ${score.toFixed(2)}%
                                </span>

                            </div>

                        </div>


                        <div class="insight-item">

                            <span>
                                Position
                            </span>

                            <strong>
                                ${escapeHtml(
                                    candidate.position ||
                                    "Not specified"
                                )}
                            </strong>

                        </div>


                        <div class="insight-item">

                            <span>
                                Detected Skills
                            </span>

                            <strong>
                                ${escapeHtml(
                                    String(skills)
                                )}
                            </strong>

                        </div>


                        <div class="insight-item">

                            <span>
                                Status
                            </span>

                            <strong>
                                ${escapeHtml(
                                    candidate.status ||
                                    "Screened"
                                )}
                            </strong>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// ------------------------------------------------------------
// CLOSE COMPARISON
// ------------------------------------------------------------

function closeCandidateComparison() {

    const comparisonSection =
        document.getElementById(
            "compareCandidates"
        );


    if (comparisonSection) {

        comparisonSection.classList.add(
            "hidden"
        );

        comparisonSection.style.display =
            "none";

    }

}

// ============================================================
// DASHBOARD STATS
// ============================================================

function updateDashboardStats(candidates) {

    const total =
        candidates.length;

    const scores =
        candidates
            .map(
                candidate =>
                    Number(
                        candidate.final_score || 0
                    )
            )
            .filter(
                score =>
                    !Number.isNaN(score)
            );

    const average =
        scores.length
            ? scores.reduce(
                (sum, score) =>
                    sum + score,
                0
            ) / scores.length
            : 0;

    const highMatch =
        candidates.filter(
            candidate =>
                candidate.status ===
                "High Match"
        ).length;

    const screened =
        candidates.filter(
            candidate =>
                candidate.status ===
                "Screened"
        ).length;

    updateElementText(
        "totalCandidates",
        total
    );

    updateElementText(
        "screenedCandidates",
        screened
    );

    updateElementText(
        "highMatchCandidates",
        highMatch
    );

    updateElementText(
        "averageMatch",
        `${average.toFixed(2)}%`
    );

}


// ============================================================
// SEARCH
// ============================================================

function initializeSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener(
        "input",
        applyCandidateFilters
    );

}


// ============================================================
// STATUS FILTER
// ============================================================

function initializeStatusFilter() {

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    if (!statusFilter) {
        return;
    }

    statusFilter.addEventListener(
        "change",
        applyCandidateFilters
    );

}


// ============================================================
// APPLY FILTERS
// ============================================================

function applyCandidateFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const searchTerm =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";

    const filtered =
        allCandidates.filter(
            (candidate) => {

                const skills =
                    Array.isArray(
                        candidate.skills
                    )
                        ? candidate.skills
                        : String(
                            candidate.skills ||
                            ""
                        ).split(",");

                const searchableText = [

                    candidate.name,

                    candidate.email,

                    candidate.phone,

                    candidate.position,

                    candidate.status,

                    candidate.pipeline_stage,

                    candidate.projects,

                    candidate.certifications,

                    ...skills

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    !searchTerm ||
                    searchableText.includes(
                        searchTerm
                    );

                const matchesStatus =
                    selectedStatus === "all" ||
                    candidate.status ===
                    selectedStatus;

                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );

    renderCandidates(
        filtered
    );

}


// ============================================================
// CANDIDATE PROFILE
// ============================================================

function openCandidateProfile(candidateId) {

    const candidate =
        allCandidates.find(
            item =>
                Number(item.id) ===
                Number(candidateId)
        );

    if (!candidate) {

        showToast(
            "Candidate not found.",
            "error"
        );

        return;
    }

    currentCandidate =
        candidate;

    const profile =
        document.getElementById(
            "screeningResult"
        );

    if (!profile) {

        showToast(
            "Candidate profile section not found.",
            "error"
        );

        return;
    }

    const name =
        document.getElementById(
            "resultCandidateName"
        );

    const email =
        document.getElementById(
            "resultCandidateEmail"
        );

    const phone =
        document.getElementById(
            "resultCandidatePhone"
        );

    const position =
        document.getElementById(
            "resultJobTitle"
        );

    const matchScore =
        document.getElementById(
            "resultFinalScore"
        );

    if (name) {

        name.textContent =
            candidate.name ||
            "Unknown Candidate";

    }

    if (email) {

        email.textContent =
            candidate.email ||
            "No email available";

    }

    if (phone) {

        phone.textContent =
            candidate.phone ||
            "No phone available";

    }

    if (position) {

        position.textContent =
            candidate.position ||
            "Unknown Position";

    }

    if (matchScore) {

        matchScore.textContent =
            `${Number(
                candidate.final_score || 0
            ).toFixed(2)}%`;

    }

    setProfileScore(
        "semanticScore",
        "semanticBar",
        candidate.semantic_score
    );

    setProfileScore(
        "skillScore",
        "skillBar",
        candidate.skill_score
    );

    setProfileScore(
        "experienceScore",
        "experienceBar",
        candidate.experience_score
    );

    setProfileScore(
        "educationScore",
        "educationBar",
        candidate.education_score
    );

    setProfileScore(
        "projectScore",
        "projectBar",
        candidate.project_score
    );

    renderProfileSkills(
        candidate.skills || []
    );

    renderProfileAdditionalInformation(
        candidate
    );

    profile.classList.remove("hidden");

    profile.style.display =
        "block";

    profile.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ============================================================
// PROFILE SCORE
// ============================================================

function setProfileScore(
    scoreId,
    barId,
    value
) {

    const scoreElement =
        document.getElementById(
            scoreId
        );

    const barElement =
        document.getElementById(
            barId
        );

    const numericValue =
        Math.max(
            0,
            Math.min(
                100,
                Number(value || 0)
            )
        );

    if (scoreElement) {

        scoreElement.textContent =
            `${numericValue.toFixed(2)}%`;

    }

    if (barElement) {

        barElement.style.width =
            `${numericValue}%`;

    }

}


// ============================================================
// PROFILE SKILLS
// ============================================================

function renderProfileSkills(skills) {

    const container =
        document.getElementById(
            "detectedSkills"
        );

    if (!container) {
        return;
    }

    let normalizedSkills = [];

    if (Array.isArray(skills)) {

        normalizedSkills =
            skills.filter(Boolean);

    } else if (skills) {

        normalizedSkills =
            String(skills)
                .split(",")
                .map(skill => skill.trim())
                .filter(Boolean);

    }

    if (!normalizedSkills.length) {

        container.innerHTML =
            "<span>No skills detected.</span>";

        return;
    }

    container.innerHTML =
        normalizedSkills
            .map(
                skill => `

                    <span class="skill-tag">

                        ${escapeHtml(skill)}

                    </span>

                `
            )
            .join("");

}


// ============================================================
// PROFILE ADDITIONAL INFORMATION
// ============================================================

function renderProfileAdditionalInformation(
    candidate
) {

    let extra =
        document.getElementById(
            "profileAdditionalInformation"
        );

    if (!extra) {

        extra =
            document.createElement(
                "div"
            );

        extra.id =
            "profileAdditionalInformation";

        extra.className =
            "profile-additional-information";

        const profile =
            document.getElementById(
                "screeningResult"
            );

        if (profile) {
            profile.appendChild(extra);
        }

    }

    extra.innerHTML = `

        <div style="
            margin-top:24px;
            display:grid;
            grid-template-columns:
                repeat(2,minmax(0,1fr));
            gap:16px;
        ">

            <div style="
                padding:18px;
                border:1px solid #e5e7eb;
                border-radius:12px;
                background:#ffffff;
            ">

                <h3 style="
                    margin:0 0 10px;
                ">
                    Projects
                </h3>

                <p style="
                    margin:0;
                    white-space:pre-wrap;
                    color:#6b7280;
                    line-height:1.6;
                ">
                    ${escapeHtml(
                        candidate.projects ||
                        "No projects detected."
                    )}
                </p>

            </div>

            <div style="
                padding:18px;
                border:1px solid #e5e7eb;
                border-radius:12px;
                background:#ffffff;
            ">

                <h3 style="
                    margin:0 0 10px;
                ">
                    Certifications
                </h3>

                <p style="
                    margin:0;
                    white-space:pre-wrap;
                    color:#6b7280;
                    line-height:1.6;
                ">
                    ${escapeHtml(
                        candidate.certifications ||
                        "No certifications detected."
                    )}
                </p>

            </div>

        </div>

        <div style="
            margin-top:16px;
            padding:16px;
            border:1px solid #e5e7eb;
            border-radius:12px;
            background:#ffffff;
        ">

            <div style="
                display:grid;
                grid-template-columns:
                    repeat(2,minmax(0,1fr));
                gap:16px;
            ">

                <div>

                    <span style="
                        display:block;
                        font-size:12px;
                        color:#6b7280;
                        margin-bottom:5px;
                    ">
                        Screening Status
                    </span>

                    <strong>
                        ${escapeHtml(
                            candidate.status ||
                            "Screened"
                        )}
                    </strong>

                </div>

                <div>

                    <span style="
                        display:block;
                        font-size:12px;
                        color:#6b7280;
                        margin-bottom:5px;
                    ">
                        Screened On
                    </span>

                    <strong>
                        ${escapeHtml(
                            formatDate(
                                candidate.created_at
                            )
                        )}
                    </strong>

                </div>

            </div>

        </div>

    `;

}


// ============================================================
// CLOSE PROFILE
// ============================================================

function initializeProfileClose() {

    const closeButton =
        document.getElementById(
            "closeCandidateProfile"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeCandidateProfile
        );

    }

}


function closeCandidateProfile() {

    const profile =
        document.getElementById(
            "screeningResult"
        );

    if (profile) {

        profile.classList.add("hidden");

        profile.style.display =
            "none";

    }

    currentCandidate =
        null;

}


// ============================================================
// UPLOAD INITIALIZATION
// ============================================================

function initializeUpload() {

    const uploadButtons =
        document.querySelectorAll(
            "#addResumeButton, #openUploadButton"
        );

    uploadButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                openUploadModal
            );

        }
    );

    const analyzeButton =
        document.getElementById(
            "analyzeButton"
        );

    if (analyzeButton) {

        analyzeButton.addEventListener(
            "click",
            analyzeResume
        );

    }

    const modal =
        document.getElementById(
            "uploadModal"
        );

    if (modal) {

        modal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    modal
                ) {

                    closeUploadModal();

                }

            }
        );

    }

}


// ============================================================
// DROP ZONE
// ============================================================

function initializeDropZone() {

    const dropZone =
        document.getElementById(
            "dropZone"
        );

    const fileInput =
        document.getElementById(
            "resumeInput"
        );

    if (!dropZone || !fileInput) {
        return;
    }

    dropZone.addEventListener(
        "click",
        () => {
            fileInput.click();
        }
    );

    fileInput.addEventListener(
        "change",
        () => {

            updateSelectedFileName(
                fileInput
            );

        }
    );

    dropZone.addEventListener(
        "dragover",
        (event) => {

            event.preventDefault();

            dropZone.style.borderColor =
                "#7c3aed";

            dropZone.style.background =
                "#f5f3ff";

        }
    );

    dropZone.addEventListener(
        "dragleave",
        () => {

            resetDropZoneStyle(
                dropZone
            );

        }
    );

    dropZone.addEventListener(
        "drop",
        (event) => {

            event.preventDefault();

            resetDropZoneStyle(
                dropZone
            );

            const files =
                event.dataTransfer.files;

            if (!files.length) {
                return;
            }

            const file =
                files[0];

            const dataTransfer =
                new DataTransfer();

            dataTransfer.items.add(file);

            fileInput.files =
                dataTransfer.files;

            updateSelectedFileName(
                fileInput
            );

        }
    );

}


function updateSelectedFileName(
    fileInput
) {

    if (
        !fileInput ||
        !fileInput.files ||
        !fileInput.files.length
    ) {
        return;
    }

    const file =
        fileInput.files[0];

    const dropZone =
        document.getElementById(
            "dropZone"
        );

    if (!dropZone) {
        return;
    }

    const heading =
        dropZone.querySelector("h3");

    const paragraph =
        dropZone.querySelector("p");

    if (heading) {

        heading.textContent =
            file.name;

    }

    if (paragraph) {

        paragraph.textContent =
            `${(
                file.size /
                1024 /
                1024
            ).toFixed(2)} MB`;

    }

}


function resetDropZoneStyle(
    dropZone
) {

    dropZone.style.borderColor = "";

    dropZone.style.background = "";

}


// ============================================================
// OPEN UPLOAD MODAL
// ============================================================

function openUploadModal() {

    const modal =
        document.getElementById(
            "uploadModal"
        );

    if (!modal) {

        showToast(
            "Upload window not found.",
            "error"
        );

        return;
    }

    modal.style.display =
        "flex";

}


// ============================================================
// CLOSE UPLOAD MODAL
// ============================================================

function closeUploadModal() {

    const modal =
        document.getElementById(
            "uploadModal"
        );

    if (modal) {

        modal.style.display =
            "none";

    }

}


// ============================================================
// ANALYZE RESUME
// ============================================================

async function analyzeResume() {

    const fileInput =
        document.getElementById(
            "resumeInput"
        );

    const jobDescription =
        document.getElementById(
            "jobDescription"
        );

    if (
        !fileInput ||
        !fileInput.files ||
        !fileInput.files.length
    ) {

        showToast(
            "Please select a resume.",
            "error"
        );

        return;

    }

    if (
        !jobDescription ||
        !jobDescription.value.trim()
    ) {

        showToast(
            "Please enter a job description.",
            "error"
        );

        return;

    }

    const button =
        document.getElementById(
            "analyzeButton"
        );

    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Analyzing...";

    }

    try {

        const formData =
            new FormData();

        formData.append(
            "file",
            fileInput.files[0]
        );

        formData.append(
            "job_description",
            jobDescription.value
        );

        const response =
            await fetch(
                `${API_URL}/screen-resume`,
                {
                    method: "POST",
                    body: formData
                }
            );

        let data = {};

        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "The server returned an invalid response."
            );

        }

        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Resume screening failed."
            );

        }

        showToast(
            "Resume screened successfully.",
            "success"
        );

        closeUploadModal();

        resetUploadForm();

        await loadCandidates();

        if (data.database_id) {

            setActiveNavigation(
                "candidates"
            );

            showCandidatesSection();

            openCandidateProfile(
                data.database_id
            );

        }

    } catch (error) {

        console.error(
            "Screening error:",
            error
        );

        showToast(
            error.message ||
            "Resume screening failed.",
            "error"
        );

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Analyze Resume →";

        }

    }

}


// ============================================================
// RESET UPLOAD FORM
// ============================================================

function resetUploadForm() {

    const fileInput =
        document.getElementById(
            "resumeInput"
        );

    const jobDescription =
        document.getElementById(
            "jobDescription"
        );

    if (fileInput) {

        fileInput.value = "";

    }

    if (jobDescription) {

        jobDescription.value = "";

    }

    const dropZone =
        document.getElementById(
            "dropZone"
        );

    if (dropZone) {

        const heading =
            dropZone.querySelector("h3");

        const paragraph =
            dropZone.querySelector("p");

        if (heading) {

            heading.textContent =
                "Drop your resume here";

        }

        if (paragraph) {

            paragraph.textContent =
                "or click to browse files";

        }

        resetDropZoneStyle(
            dropZone
        );

    }

}


// ============================================================
// PIPELINE PAGE
// ============================================================

function createPipelineSection() {

    const section =
        document.createElement(
            "section"
        );

    section.id =
        "pipelineSection";

    section.className =
        "pipeline-section";

    section.innerHTML = `

        <div class="pipeline-header">

            <div>

                <h2>
                    Candidate Pipeline
                </h2>

                <p>
                    Track candidates through
                    the recruitment process.
                </p>

            </div>

        </div>

        <div
            id="pipelineBoard"
            class="pipeline-board"
        ></div>

    `;

    return section;

}


// ============================================================
// LOAD PIPELINE
// ============================================================

async function loadPipeline() {

    try {

        const response =
            await fetch(
                `${API_URL}/pipeline`
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load pipeline."
            );

        }

        const data =
            await response.json();

        pipelineCandidates =
            data.pipeline || {};

        renderPipeline(
            pipelineCandidates
        );

    } catch (error) {

        console.error(
            "Pipeline error:",
            error
        );

        showToast(
            "Unable to load pipeline.",
            "error"
        );

    }

}


// ============================================================
// RENDER PIPELINE
// ============================================================

function renderPipeline(pipeline) {

    const board =
        document.getElementById(
            "pipelineBoard"
        );

    if (!board) {
        return;
    }

    board.innerHTML = "";

    const stages = [

        "Applied",

        "Screening",

        "Reviewed",

        "Shortlisted",

        "Rejected"

    ];

    stages.forEach(
        stage => {

            const candidates =
                pipeline[stage] || [];

            const column =
                document.createElement(
                    "div"
                );

            column.className =
                "pipeline-column";

            column.dataset.stage =
                stage;

            column.innerHTML = `

                <div class="pipeline-column-header">

                    <div>

                        <h3>
                            ${escapeHtml(stage)}
                        </h3>

                        <span>
                            ${candidates.length}
                        </span>

                    </div>

                </div>

                <div
                    class="pipeline-cards"
                    data-stage="${escapeHtml(stage)}"
                ></div>

            `;

            const cards =
                column.querySelector(
                    ".pipeline-cards"
                );

            candidates.forEach(
                candidate => {

                    cards.appendChild(
                        createPipelineCard(
                            candidate
                        )
                    );

                }
            );

            board.appendChild(
                column
            );

        }
    );

}


// ============================================================
// PIPELINE CARD
// ============================================================

function createPipelineCard(candidate) {

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "pipeline-card";

    card.draggable =
        true;

    card.dataset.id =
        candidate.id;

    const stages = [

        "Applied",

        "Screening",

        "Reviewed",

        "Shortlisted",

        "Rejected"

    ];

    card.innerHTML = `

        <div class="pipeline-card-top">

            <div class="pipeline-avatar">

                ${getInitials(
                    candidate.name
                )}

            </div>

            <div>

                <strong>

                    ${escapeHtml(
                        candidate.name ||
                        "Unknown Candidate"
                    )}

                </strong>

                <small>

                    ${escapeHtml(
                        candidate.position ||
                        "Unknown Position"
                    )}

                </small>

            </div>

        </div>

        <div class="pipeline-card-score">

            <span>
                AI Match
            </span>

            <strong>

                ${Number(
                    candidate.final_score || 0
                ).toFixed(2)}%

            </strong>

        </div>

        <select class="pipeline-stage-select">

            ${stages.map(
                stage => `

                    <option
                        value="${escapeHtml(stage)}"
                        ${
                            candidate.pipeline_stage ===
                            stage
                                ? "selected"
                                : ""
                        }
                    >

                        ${escapeHtml(stage)}

                    </option>

                `
            ).join("")}

        </select>

    `;

    card.addEventListener(
        "click",
        event => {

            if (
                event.target.tagName ===
                "SELECT"
            ) {
                return;
            }

            openCandidateProfile(
                candidate.id
            );

        }
    );

    const select =
        card.querySelector(
            ".pipeline-stage-select"
        );

    if (select) {

        select.addEventListener(
            "change",
            async event => {

                await updatePipelineStage(
                    candidate.id,
                    event.target.value
                );

            }
        );

    }

    card.addEventListener(
        "dragstart",
        event => {

            event.dataTransfer.setData(
                "candidateId",
                candidate.id
            );

        }
    );

    return card;

}


// ============================================================
// UPDATE PIPELINE STAGE
// ============================================================

async function updatePipelineStage(
    candidateId,
    newStage
) {

    try {

        const response =
            await fetch(
                `${API_URL}/candidates/${candidateId}/pipeline-stage`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        pipeline_stage:
                            newStage
                    })

                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to update pipeline."
            );

        }

        const index =
            allCandidates.findIndex(
                candidate =>
                    Number(candidate.id) ===
                    Number(candidateId)
            );

        if (index !== -1) {

            allCandidates[index] =
                data.candidate;

        }

        renderPipeline(
            rebuildPipelineFromCandidates()
        );

        updateDashboardStats(
            allCandidates
        );

        showToast(
            "Pipeline stage updated.",
            "success"
        );

    } catch (error) {

        console.error(
            error
        );

        showToast(
            error.message ||
            "Unable to update pipeline.",
            "error"
        );

    }

}


// ============================================================
// REBUILD PIPELINE
// ============================================================

function rebuildPipelineFromCandidates() {

    const pipeline = {

        Applied: [],

        Screening: [],

        Reviewed: [],

        Shortlisted: [],

        Rejected: []

    };

    allCandidates.forEach(
        candidate => {

            const stage =
                candidate.pipeline_stage ||
                "Screening";

            if (!pipeline[stage]) {

                pipeline[stage] = [];

            }

            pipeline[stage].push(
                candidate
            );

        }
    );

    return pipeline;

}


// ============================================================
// ANALYTICS SECTION CREATION
// ============================================================

function createAnalyticsSection() {

    const section =
        document.createElement(
            "section"
        );

    section.id =
        "analyticsSection";

    section.className =
        "analytics-section";

    section.innerHTML = `

        <div class="analytics-header">

            <div>

                <h2>
                    Analytics Dashboard
                </h2>

                <p>
                    AI-powered candidate
                    screening insights.
                </p>

            </div>

            <button
                id="refreshAnalyticsBtn"
                class="analytics-refresh-btn"
            >
                ↻ Refresh
            </button>

        </div>

        <div class="analytics-stats-grid">

            <div class="analytics-stat-card">

                <span>
                    Total Candidates
                </span>

                <strong id="analyticsTotal">
                    0
                </strong>

            </div>

            <div class="analytics-stat-card">

                <span>
                    Average Match
                </span>

                <strong id="analyticsAverage">
                    0%
                </strong>

            </div>

            <div class="analytics-stat-card">

                <span>
                    Highest Match
                </span>

                <strong id="analyticsHighest">
                    0%
                </strong>

            </div>

            <div class="analytics-stat-card">

                <span>
                    Lowest Match
                </span>

                <strong id="analyticsLowest">
                    0%
                </strong>

            </div>

        </div>

        <div class="analytics-chart-grid">

            <div class="analytics-chart-card">

                <div class="analytics-chart-title">

                    <h3>
                        Pipeline Distribution
                    </h3>

                </div>

                <div class="analytics-chart-wrapper">

                    <canvas
                        id="pipelineChart"
                    ></canvas>

                </div>

            </div>

            <div class="analytics-chart-card">

                <div class="analytics-chart-title">

                    <h3>
                        Match Score Distribution
                    </h3>

                </div>

                <div class="analytics-chart-wrapper">

                    <canvas
                        id="scoreDistributionChart"
                    ></canvas>

                </div>

            </div>

            <div class="analytics-chart-card">

                <div class="analytics-chart-title">

                    <h3>
                        Top Candidate Skills
                    </h3>

                </div>

                <div class="analytics-chart-wrapper">

                    <canvas
                        id="topSkillsChart"
                    ></canvas>

                </div>

            </div>

        </div>

        <div class="candidate-performance-section">

            <div class="candidate-performance-header">

                <h2>
                    Individual Candidate Performance
                </h2>

                <p>
                    Skill-level evidence from
                    resumes, projects and
                    certifications.
                </p>

            </div>

            <div
                id="candidatePerformanceGrid"
                class="candidate-performance-grid"
            ></div>

        </div>

    `;

    const refreshButton =
        section.querySelector(
            "#refreshAnalyticsBtn"
        );

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadAnalytics
        );

    }

    return section;

}


// ============================================================
// LOAD CHART.JS
// ============================================================

function loadChartJS() {

    return new Promise((resolve) => {

        if (
            typeof Chart !==
            "undefined"
        ) {

            resolve();

            return;

        }

        const existing =
            document.querySelector(
                'script[data-cvscan-chartjs="true"]'
            );

        if (existing) {

            existing.addEventListener(
                "load",
                resolve
            );

            return;

        }

        const script =
            document.createElement(
                "script"
            );

        script.src =
            "https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js";

        script.dataset.cvscanChartjs =
            "true";

        script.onload =
            () => resolve();

        script.onerror =
            () => {

                console.error(
                    "Unable to load Chart.js."
                );

                resolve();

            };

        document.head.appendChild(
            script
        );

    });

}


// ============================================================
// LOAD ANALYTICS
// ============================================================

async function loadAnalytics() {

    try {

        const response =
            await fetch(
                `${API_URL}/analytics`
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load analytics."
            );

        }

        analyticsData =
            await response.json();

        renderAnalyticsStats(
            analyticsData
        );

        renderPipelineChart(
            analyticsData
        );

        renderScoreDistributionChart(
            analyticsData
        );

        renderTopSkillsChart(
            analyticsData
        );

        renderCandidatePerformance(
            analyticsData
        );

    } catch (error) {

        console.error(
            "Analytics error:",
            error
        );

        showToast(
            "Unable to load analytics.",
            "error"
        );

    }

}


// ============================================================
// ANALYTICS STATS
// ============================================================

function renderAnalyticsStats(data) {

    updateElementText(
        "analyticsTotal",
        data.total_candidates || 0
    );

    updateElementText(
        "analyticsAverage",
        `${Number(
            data.average_score || 0
        ).toFixed(2)}%`
    );

    updateElementText(
        "analyticsHighest",
        `${Number(
            data.highest_score || 0
        ).toFixed(2)}%`
    );

    updateElementText(
        "analyticsLowest",
        `${Number(
            data.lowest_score || 0
        ).toFixed(2)}%`
    );

}


// ============================================================
// PIPELINE CHART
// ============================================================

function renderPipelineChart(data) {

    if (
        typeof Chart ===
        "undefined"
    ) {
        return;
    }

    const canvas =
        document.getElementById(
            "pipelineChart"
        );

    if (!canvas) {
        return;
    }

    if (pipelineChart) {
        pipelineChart.destroy();
    }

    const distribution =
        data.pipeline_distribution ||
        {};

    pipelineChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        Object.keys(
                            distribution
                        ),

                    datasets: [

                        {

                            label:
                                "Candidates",

                            data:
                                Object.values(
                                    distribution
                                ),

                            borderRadius: 8,

                            borderWidth: 1

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            }

                        }

                    }

                }

            }
        );

}


// ============================================================
// SCORE DISTRIBUTION CHART
// ============================================================

function renderScoreDistributionChart(data) {

    if (
        typeof Chart ===
        "undefined"
    ) {
        return;
    }

    const canvas =
        document.getElementById(
            "scoreDistributionChart"
        );

    if (!canvas) {
        return;
    }

    if (scoreDistributionChart) {
        scoreDistributionChart.destroy();
    }

    const distribution =
        data.score_distribution ||
        {};

    scoreDistributionChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        Object.keys(
                            distribution
                        ),

                    datasets: [

                        {

                            label:
                                "Candidates",

                            data:
                                Object.values(
                                    distribution
                                ),

                            borderRadius: 8,

                            borderWidth: 1

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {

                            title: {

                                display: true,

                                text:
                                    "Match Score Range"

                            }

                        },

                        y: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            }

                        }

                    }

                }

            }
        );

}


// ============================================================
// TOP SKILLS CHART
// ============================================================

function renderTopSkillsChart(data) {

    if (
        typeof Chart ===
        "undefined"
    ) {
        return;
    }

    const canvas =
        document.getElementById(
            "topSkillsChart"
        );

    if (!canvas) {
        return;
    }

    if (topSkillsChart) {
        topSkillsChart.destroy();
    }

    const skills =
        data.top_skills ||
        [];

    topSkillsChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        skills.map(
                            item =>
                                item.skill
                        ),

                    datasets: [

                        {

                            label:
                                "Candidates",

                            data:
                                skills.map(
                                    item =>
                                        item.count
                                ),

                            borderRadius: 8,

                            borderWidth: 1

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {

                            title: {

                                display: true,

                                text:
                                    "Skills"

                            }

                        },

                        y: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            },

                            title: {

                                display: true,

                                text:
                                    "Candidates"

                            }

                        }

                    }

                }

            }
        );

}


// ============================================================
// CANDIDATE PERFORMANCE
// ============================================================

function renderCandidatePerformance(data) {

    const grid =
        document.getElementById(
            "candidatePerformanceGrid"
        );

    if (!grid) {
        return;
    }

    Object.keys(
        candidateSkillCharts
    ).forEach(
        key => {

            if (
                candidateSkillCharts[key]
            ) {

                candidateSkillCharts[key]
                    .destroy();

            }

        }
    );

    candidateSkillCharts = {};

    grid.innerHTML = "";

    const candidates =
        data.candidate_performance ||
        [];

    if (!candidates.length) {

        grid.innerHTML = `

            <div class="empty-analytics-message">

                No candidate performance
                data available.

            </div>

        `;

        return;

    }

    candidates.forEach(
        candidate => {

            grid.appendChild(
                createCandidatePerformanceCard(
                    candidate
                )
            );

        }
    );

}


// ============================================================
// PERFORMANCE CARD
// ============================================================

function createCandidatePerformanceCard(candidate, index) {

    const score = candidate.final_score ?? 0;
    const semanticScore = candidate.semantic_score ?? 0;
    const skillScore = candidate.skill_score ?? 0;
    const experienceScore = candidate.experience_score ?? 0;
    const educationScore = candidate.education_score ?? 0;
    const projectScore = candidate.project_score ?? 0;

    const name = candidate.name || "Unknown Candidate";
    const position = candidate.position || "Position not specified";
    const email = candidate.email || "Not provided";

    const skills = Array.isArray(candidate.skills)
        ? candidate.skills
        : [];

    const projects = candidate.projects || "";
    const certifications = candidate.certifications || "";

    const status = candidate.status || "Screened";

    /* ---------------------------------------------------------
       INITIALS
    --------------------------------------------------------- */

    const initials = name
        .replace(/\n/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("") || "NA";


    /* ---------------------------------------------------------
       DATE
    --------------------------------------------------------- */

    let createdDate = "Date not available";

    if (candidate.created_at) {

        const date = new Date(candidate.created_at);

        if (!isNaN(date.getTime())) {

            createdDate = date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });

        }
    }


    /* ---------------------------------------------------------
       STATUS
    --------------------------------------------------------- */

    let statusClass = "screened";
    let statusIcon = "◉";

    const normalizedStatus = status.toLowerCase();

    if (
        normalizedStatus.includes("high") ||
        normalizedStatus.includes("shortlisted")
    ) {

        statusClass = "high-match";
        statusIcon = "★";

    } else if (
        normalizedStatus.includes("review")
    ) {

        statusClass = "reviewed";
        statusIcon = "✓";

    } else if (
        normalizedStatus.includes("reject")
    ) {

        statusClass = "rejected";
        statusIcon = "×";

    }


    /* ---------------------------------------------------------
       SKILL PERFORMANCE
    --------------------------------------------------------- */

    let skillPerformance = Array.isArray(candidate.skill_performance)
        ? candidate.skill_performance
        : [];


    /*
       If backend has not returned skill_performance,
       create a fallback from detected skills.
    */

    if (skillPerformance.length === 0 && skills.length > 0) {

        skillPerformance = skills.map(skill => ({
            skill: skill,
            score: 40,
            resume_evidence: true,
            project_evidence: false,
            certification_evidence: false
        }));

    }


    /* ---------------------------------------------------------
       DETECTED SKILLS
    --------------------------------------------------------- */

    let skillsHTML = "";

    if (skills.length > 0) {

        skillsHTML = skills
            .map(skill => `
                <span class="performance-skill-chip">
                    ${escapeHtml(skill)}
                </span>
            `)
            .join("");

    } else {

        skillsHTML = `
            <span class="performance-empty">
                No skills detected
            </span>
        `;

    }


    /* ---------------------------------------------------------
       PROJECTS
    --------------------------------------------------------- */

    const projectText = projects.trim()
        ? escapeHtml(projects.substring(0, 120))
        : "None detected";


    /* ---------------------------------------------------------
       CERTIFICATIONS
    --------------------------------------------------------- */

    const certificationText = certifications.trim()
        ? escapeHtml(certifications.substring(0, 120))
        : "None detected";


    /* ---------------------------------------------------------
       SKILL PERFORMANCE METRICS
    --------------------------------------------------------- */

    const metricData = [
        {
            name: "Semantic Match",
            value: semanticScore
        },
        {
            name: "Skills Match",
            value: skillScore
        },
        {
            name: "Experience",
            value: experienceScore
        },
        {
            name: "Education",
            value: educationScore
        },
        {
            name: "Projects",
            value: projectScore
        }
    ];


    const metricsHTML = metricData.map((metric, metricIndex) => {

        let barClass = "";

        if (metricIndex === 1) {
            barClass = "purple";
        } else if (metricIndex === 2) {
            barClass = "green";
        } else if (metricIndex === 3) {
            barClass = "cyan";
        }

        return `
            <div class="performance-metric">

                <div class="performance-metric-top">

                    <span class="performance-metric-name">
                        ${metric.name}
                    </span>

                    <span class="performance-metric-value">
                        ${Number(metric.value).toFixed(2)}%
                    </span>

                </div>

                <div class="performance-progress">

                    <div
                        class="performance-progress-fill ${barClass}"
                        style="--progress:${Math.max(
                            0,
                            Math.min(100, Number(metric.value))
                        )}%"
                    ></div>

                </div>

            </div>
        `;

    }).join("");


    /* ---------------------------------------------------------
       SCORE COLOR
    --------------------------------------------------------- */

    let scoreColor = "green";

    if (score < 40) {

        scoreColor = "blue";

    } else if (score < 70) {

        scoreColor = "green";

    } else {

        scoreColor = "green";

    }


    /* ---------------------------------------------------------
       CARD
    --------------------------------------------------------- */

    const card = document.createElement("div");

    card.className = `
        candidate-performance-card
        performance-card-${index}
    `;

    card.innerHTML = `

        <!-- =====================================================
             CANDIDATE INFORMATION
        ====================================================== -->

        <div class="performance-candidate-info">

            <div class="performance-candidate-header">

                <div class="performance-avatar">
                    ${escapeHtml(initials)}
                </div>

                <div class="performance-candidate-text">

                    <div class="performance-candidate-name">
                        ${escapeHtml(name).replace(/\n/g, "<br>")}
                    </div>

                    <div class="performance-candidate-position">
                        <span class="performance-position-icon">▣</span>
                        ${escapeHtml(position)}
                    </div>

                </div>

            </div>


            <div class="performance-contact-details">

                <div class="performance-detail">

                    <span class="performance-detail-icon">
                        ✉
                    </span>

                    <span>
                        Email: ${escapeHtml(email)}
                    </span>

                </div>


                <div class="performance-detail">

                    <span class="performance-detail-icon">
                        ♧
                    </span>

                    <span>
                        Created: ${escapeHtml(createdDate)}
                    </span>

                </div>

            </div>

        </div>


        <!-- =====================================================
             OVERALL SCORE
        ====================================================== -->

        <div class="performance-score-panel">

            <div
                class="
                    performance-score-circle
                    ${scoreColor}
                "
                style="--score:${Math.max(
                    0,
                    Math.min(100, Number(score))
                )}%"
            >

                <div class="performance-score-content">

                    <div class="performance-score-value">
                        ${Number(score).toFixed(2)}%
                    </div>

                    <span class="performance-score-label">
                        Overall Match
                    </span>

                </div>

            </div>


            <div class="
                performance-score-status
                ${statusClass}
            ">

                <span>
                    ${statusIcon}
                </span>

                ${escapeHtml(status)}

            </div>

        </div>


        <!-- =====================================================
             SKILL PERFORMANCE
        ====================================================== -->

        <div class="performance-metrics">

            <div class="performance-metrics-title">

                <span class="performance-target-icon">
                    ◎
                </span>

                <span>
                    Skill Performance
                </span>

            </div>


            <div class="performance-metrics-subtitle">
                Resume + Project + Certification Evidence
            </div>


            <div class="performance-metric-list">

                ${metricsHTML}

            </div>

        </div>


        <!-- =====================================================
             EVIDENCE
        ====================================================== -->

        <div class="performance-evidence">

            <!-- Detected Skills -->

            <div class="performance-evidence-section">

                <div class="performance-evidence-title">

                    <span class="performance-evidence-icon">
                        ♧
                    </span>

                    <span>
                        Detected Skills
                    </span>

                </div>


                <div class="performance-skills">

                    ${skillsHTML}

                </div>

            </div>


            <!-- Projects -->

            <div class="performance-evidence-section">

                <div class="performance-evidence-title">

                    <span class="performance-evidence-icon">
                        ▱
                    </span>

                    <span>
                        Projects
                    </span>

                </div>


                <div class="performance-evidence-text">

                    ${projectText}

                </div>

            </div>


            <!-- Certifications -->

            <div class="performance-evidence-section">

                <div class="performance-evidence-title">

                    <span class="performance-evidence-icon">
                        ♙
                    </span>

                    <span>
                        Certifications
                    </span>

                </div>


                <div class="performance-evidence-text">

                    ${certificationText}

                </div>

            </div>

        </div>
    `;


    return card;
}


// ============================================================
// SKILL CHART
// ============================================================

function createSkillChart(
    canvas,
    skills,
    scores,
    skillPerformance
) {

    const barColors = [

        "#7c3aed",

        "#2563eb",

        "#0891b2",

        "#059669",

        "#16a34a",

        "#ca8a04",

        "#ea580c",

        "#dc2626",

        "#db2777",

        "#9333ea"

    ];

    return new Chart(
        canvas,
        {

            type: "bar",

            data: {

                labels: skills,

                datasets: [

                    {

                        label:
                            "Skill Evidence Score",

                        data: scores,

                        backgroundColor:
                            skills.map(
                                (_, index) =>
                                    barColors[
                                        index %
                                        barColors.length
                                    ]
                            ),

                        borderColor:
                            skills.map(
                                (_, index) =>
                                    barColors[
                                        index %
                                        barColors.length
                                    ]
                            ),

                        borderWidth: 1,

                        borderRadius: 8,

                        maxBarThickness: 60

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                animation: {

                    duration: 700

                },

                plugins: {

                    legend: {

                        display: false

                    },

                    tooltip: {

                        callbacks: {

                            label:
                                function(context) {

                                    const index =
                                        context.dataIndex;

                                    const evidence =
                                        skillPerformance[
                                            index
                                        ];

                                    let label =
                                        ` Score: ${
                                            Number(
                                                context.raw
                                            ).toFixed(0)
                                        }/100`;

                                    if (
                                        evidence &&
                                        evidence.project_evidence
                                    ) {

                                        label +=
                                            " • Project evidence";

                                    }

                                    if (
                                        evidence &&
                                        evidence.certification_evidence
                                    ) {

                                        label +=
                                            " • Certification evidence";

                                    }

                                    return label;

                                }

                        }

                    }

                },

                scales: {

                    x: {

                        grid: {

                            display: false

                        },

                        ticks: {

                            autoSkip: false,

                            maxRotation: 45,

                            minRotation: 0,

                            font: {

                                size: 12

                            }

                        },

                        title: {

                            display: true,

                            text:
                                "Skills"

                        }

                    },

                    y: {

                        beginAtZero: true,

                        max: 100,

                        ticks: {

                            stepSize: 10

                        },

                        title: {

                            display: true,

                            text:
                                "Performance / Evidence Score"

                        }

                    }

                }

            }

        }
    );

}


// ============================================================
// SKILL EVIDENCE LEGEND
// ============================================================

function createSkillEvidenceLegend(
    skillPerformance
) {

    const projectCount =
        skillPerformance.filter(
            item =>
                item.project_evidence
        ).length;

    const certificationCount =
        skillPerformance.filter(
            item =>
                item.certification_evidence
        ).length;

    return `

        <div class="skill-evidence-legend">

            <div class="evidence-item">

                <span class="evidence-dot resume"></span>

                <span>
                    Resume skill detected
                </span>

            </div>

            <div class="evidence-item">

                <span class="evidence-dot project"></span>

                <span>
                    Project evidence:
                    ${projectCount}
                </span>

            </div>

            <div class="evidence-item">

                <span class="evidence-dot certification"></span>

                <span>
                    Certification evidence:
                    ${certificationCount}
                </span>

            </div>

        </div>

    `;

}


// ============================================================
// TOAST
// ============================================================

function showToast(
    message,
    type = "info"
) {

    let container =
        document.getElementById(
            "cvScanToastContainer"
        );

    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.id =
            "cvScanToastContainer";

        container.style.position =
            "fixed";

        container.style.right =
            "24px";

        container.style.bottom =
            "24px";

        container.style.zIndex =
            "99999";

        container.style.display =
            "flex";

        container.style.flexDirection =
            "column";

        container.style.gap =
            "10px";

        document.body.appendChild(
            container
        );

    }

    const toast =
        document.createElement(
            "div"
        );

    toast.style.padding =
        "13px 17px";

    toast.style.borderRadius =
        "10px";

    toast.style.background =
        type === "error"
            ? "#dc2626"
            : type === "success"
                ? "#059669"
                : "#374151";

    toast.style.color =
        "white";

    toast.style.fontSize =
        "13px";

    toast.style.boxShadow =
        "0 8px 20px rgba(0,0,0,0.15)";

    toast.textContent =
        message;

    container.appendChild(
        toast
    );

    setTimeout(
        () => {

            toast.remove();

        },
        3000
    );

}


// ============================================================
// HELPERS
// ============================================================

function updateElementText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


function getInitials(name) {

    if (!name) {
        return "CV";
    }

    const parts =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) {
        return "CV";
    }

    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


function getStatusClass(status) {

    if (status === "High Match") {

        return "status-high-match";

    }

    if (status === "Reviewed") {

        return "status-reviewed";

    }

    return "status-screened";

}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date =
        new Date(dateString);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// WINDOW GLOBALS
// ============================================================

window.closeCandidateProfile =
    closeCandidateProfile;

window.openUploadModal =
    openUploadModal;

window.closeUploadModal =
    closeUploadModal;

window.loadCandidates =
    loadCandidates;

window.loadAnalytics =
    loadAnalytics;

window.loadPipeline =
    loadPipeline;


/* ============================================================
   CV SCAN
   ADD-ON FEATURES
   1. COMPARE CANDIDATES
   2. DELETE ANALYSIS
   ============================================================ */


/* ============================================================
   COMPARE CANDIDATES - GLOBAL STATE
   ============================================================ */

let cvScanSelectedCandidateIds = [];


/* ============================================================
   SAFE HTML ESCAPE
   ============================================================ */

function cvScanEscapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ============================================================
   GET CANDIDATE ID
   ============================================================ */

function cvScanGetCandidateId(candidate) {

    if (!candidate) {
        return null;
    }

    return Number(
        candidate.id ??
        candidate.candidate_id
    );

}


/* ============================================================
   ADD CHECKBOXES TO EXISTING CANDIDATE ROWS
   ============================================================ */

function cvScanAddCandidateCheckboxes() {

    const rows =
        document.querySelectorAll(
            "#candidateTableBody tr"
        );


    rows.forEach(row => {

        /*
         * Do not add the checkbox twice.
         */

        if (
            row.querySelector(
                ".candidate-checkbox"
            )
        ) {
            return;
        }


        /*
         * Try to identify candidate ID
         * from existing row attributes.
         */

        let candidateId =
            row.dataset.id ||
            row.dataset.candidateId;


        /*
         * If no ID is available from the row,
         * try matching the candidate by name.
         */

        if (!candidateId) {

            const nameElement =
                row.querySelector(
                    ".candidate-name"
                ) ||
                row.querySelector(
                    ".candidate-name-cell strong"
                ) ||
                row.querySelector(
                    "strong"
                );


            if (nameElement) {

                const candidateName =
                    nameElement.textContent.trim();


                const candidate =
                    allCandidates.find(
                        item =>
                            String(
                                item.name || ""
                            ).trim() ===
                            candidateName
                    );


                if (candidate) {

                    candidateId =
                        candidate.id;

                }

            }

        }


        if (!candidateId) {
            return;
        }


        /*
         * Create selection cell.
         */

        let selectionCell =
            row.querySelector(
                ".select-cell"
            );


        if (!selectionCell) {

            selectionCell =
                document.createElement(
                    "td"
                );

            selectionCell.className =
                "select-cell";


            row.insertBefore(
                selectionCell,
                row.firstElementChild
            );

        }


        const checkbox =
            document.createElement(
                "input"
            );


        checkbox.type =
            "checkbox";


        checkbox.className =
            "candidate-checkbox";


        checkbox.dataset.candidateId =
            candidateId;


        checkbox.checked =
            cvScanSelectedCandidateIds.includes(
                Number(candidateId)
            );


        checkbox.title =
            "Select candidate for comparison";


        selectionCell.appendChild(
            checkbox
        );

    });


    cvScanUpdateCompareButton();

}


/* ============================================================
   SELECT / DESELECT CANDIDATE
   ============================================================ */

document.addEventListener(
    "change",
    function(event) {

        const checkbox =
            event.target.closest(
                ".candidate-checkbox"
            );


        if (!checkbox) {
            return;
        }


        const candidateId =
            Number(
                checkbox.dataset.candidateId
            );


        if (!candidateId) {
            return;
        }


        /*
         * STOP ROW CLICK
         */

        event.stopPropagation();


        if (checkbox.checked) {

            /*
             * Maximum 5 candidates.
             */

            if (
                cvScanSelectedCandidateIds.length >= 5
            ) {

                checkbox.checked =
                    false;


                alert(
                    "You can compare a maximum of 5 candidates."
                );


                return;

            }


            if (
                !cvScanSelectedCandidateIds.includes(
                    candidateId
                )
            ) {

                cvScanSelectedCandidateIds.push(
                    candidateId
                );

            }

        }
        else {

            cvScanSelectedCandidateIds =
                cvScanSelectedCandidateIds.filter(
                    id =>
                        Number(id) !==
                        candidateId
                );

        }


        cvScanUpdateCompareButton();

    },
    true
);


/* ============================================================
   UPDATE COMPARE BUTTON
   ============================================================ */

function cvScanUpdateCompareButton() {

    const button =
        document.getElementById(
            "compareCandidatesButton"
        );


    if (!button) {
        return;
    }


    const count =
        cvScanSelectedCandidateIds.length;


    if (count === 0) {

        button.textContent =
            "⇄ Compare Candidates";


        button.disabled =
            true;

    }
    else {

        button.textContent =
            `⇄ Compare (${count})`;


        button.disabled =
            count < 2;

    }

}


/* ============================================================
   COMPARE BUTTON CLICK
   ============================================================ */

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "#compareCandidatesButton"
            );


        if (!button) {
            return;
        }


        event.preventDefault();
        event.stopPropagation();


        cvScanOpenComparison();

    },
    true
);


/* ============================================================
   GET SELECTED CANDIDATES
   ============================================================ */

function cvScanGetSelectedCandidates() {

    if (
        !Array.isArray(
            allCandidates
        )
    ) {

        return [];

    }


    return allCandidates.filter(
        candidate => {

            const id =
                cvScanGetCandidateId(
                    candidate
                );


            return cvScanSelectedCandidateIds.includes(
                id
            );

        }
    );

}


/* ============================================================
   OPEN COMPARISON
   ============================================================ */

function cvScanOpenComparison() {

    const count =
        cvScanSelectedCandidateIds.length;


    if (count < 2) {

        alert(
            "Please select at least 2 candidates to compare."
        );


        return;

    }


    if (count > 5) {

        alert(
            "You can compare a maximum of 5 candidates."
        );


        return;

    }


    const candidates =
        cvScanGetSelectedCandidates();


    if (candidates.length < 2) {

        alert(
            "The selected candidates could not be found."
        );


        return;

    }


    let comparisonSection =
        document.getElementById(
            "compareCandidates"
        );


    /*
     * If the comparison section does not
     * exist in HTML, create it automatically.
     */

    if (!comparisonSection) {

        comparisonSection =
            cvScanCreateComparisonSection();

    }


    /*
     * Hide normal candidate profile.
     */

    const profile =
        document.getElementById(
            "screeningResult"
        );


    if (profile) {

        profile.classList.add(
            "hidden"
        );

    }


    comparisonSection.classList.remove(
        "hidden"
    );


    comparisonSection.style.display =
        "block";


    cvScanRenderComparison(
        candidates
    );


    cvScanRenderComparisonInsights(
        candidates
    );


    comparisonSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* ============================================================
   CREATE COMPARISON SECTION IF MISSING
   ============================================================ */

function cvScanCreateComparisonSection() {

    const section =
        document.createElement(
            "section"
        );


    section.id =
        "compareCandidates";


    section.className =
        "compare-section";


    section.innerHTML = `

        <div class="compare-header">

            <div>

                <span class="result-label">
                    AI CANDIDATE COMPARISON
                </span>

                <h2>
                    Compare Candidates
                </h2>

                <p>
                    Compare candidate information
                    and AI screening results.
                </p>

            </div>


            <button
                id="closeCompareButton"
                class="close-profile-btn"
                type="button"
            >
                ✕ Close
            </button>

        </div>


        <div
            id="compareMessage"
            class="compare-message"
        >
            Candidates selected for comparison.
        </div>


        <div class="compare-table-container">

            <table class="compare-table">

                <thead
                    id="compareTableHead"
                ></thead>


                <tbody
                    id="compareTableBody"
                ></tbody>

            </table>

        </div>


        <div class="comparison-insights">

            <h3>
                Candidate Comparison Insights
            </h3>


            <div
                id="comparisonInsights"
                class="comparison-insights-content"
            >
            </div>

        </div>

    `;


    /*
     * Put comparison section after
     * candidate card/profile area.
     */

    const candidateTable =
        document.getElementById(
            "candidateTableBody"
        );


    if (
        candidateTable &&
        candidateTable.closest(
            ".card"
        )
    ) {

        const parentCard =
            candidateTable.closest(
                ".card"
            );


        parentCard.parentNode.insertBefore(
            section,
            parentCard.nextSibling
        );

    }
    else if (
        dashboardContent
    ) {

        dashboardContent.appendChild(
            section
        );

    }
    else {

        document.body.appendChild(
            section
        );

    }


    return section;

}


/* ============================================================
   RENDER COMPARISON TABLE
   ============================================================ */

function cvScanRenderComparison(
    candidates
) {

    const tableHead =
        document.getElementById(
            "compareTableHead"
        );


    const tableBody =
        document.getElementById(
            "compareTableBody"
        );


    const message =
        document.getElementById(
            "compareMessage"
        );


    if (
        !tableHead ||
        !tableBody
    ) {

        console.error(
            "Comparison table elements were not found."
        );


        return;

    }


    if (message) {

        message.textContent =
            `${candidates.length} candidates selected for comparison.`;

    }


    /*
     * TABLE HEADER
     */

    tableHead.innerHTML = `

        <tr>

            <th>
                Category
            </th>

            ${candidates.map(
                candidate => `

                    <th>

                        <div class="compare-candidate-name">

                            <div class="compare-avatar">

                                ${cvScanGetInitials(
                                    candidate.name
                                )}

                            </div>

                            <span>

                                ${cvScanEscapeHTML(
                                    candidate.name ||
                                    "Unknown Candidate"
                                )}

                            </span>

                        </div>

                    </th>

                `
            ).join("")}

        </tr>

    `;


    /*
     * TABLE ROWS
     */

    const rows = [

        {
            label: "Position",
            key: "position",
            score: false
        },

        {
            label: "AI Match",
            key: "final_score",
            score: true
        },

        {
            label: "Semantic Match",
            key: "semantic_score",
            score: true
        },

        {
            label: "Skills Match",
            key: "skill_score",
            score: true
        },

        {
            label: "Experience",
            key: "experience_score",
            score: true
        },

        {
            label: "Education",
            key: "education_score",
            score: true
        },

        {
            label: "Projects",
            key: "project_score",
            score: true
        },

        {
            label: "Status",
            key: "status",
            score: false
        },

        {
            label: "Pipeline",
            key: "pipeline_stage",
            score: false
        }

    ];


    tableBody.innerHTML =
        rows.map(
            row => {

                return `

                    <tr>

                        <td class="comparison-label">

                            ${row.label}

                        </td>


                        ${candidates.map(
                            candidate => {

                                let value =
                                    candidate[
                                        row.key
                                    ];


                                if (
                                    row.score
                                ) {

                                    value =
                                        Number(
                                            value || 0
                                        ).toFixed(2)
                                        + "%";

                                }


                                if (
                                    value === null ||
                                    value === undefined ||
                                    value === ""
                                ) {

                                    value =
                                        "Not available";

                                }


                                return `

                                    <td>

                                        ${cvScanEscapeHTML(
                                            String(value)
                                        )}

                                    </td>

                                `;

                            }
                        ).join("")}

                    </tr>

                `;

            }
        ).join("");

}


/* ============================================================
   COMPARISON INITIALS
   ============================================================ */

function cvScanGetInitials(
    name
) {

    if (!name) {
        return "??";
    }


    const words =
        String(name)
            .trim()
            .split(/\s+/);


    if (
        words.length === 1
    ) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[
            words.length - 1
        ][0]
    ).toUpperCase();

}


/* ============================================================
   COMPARISON INSIGHTS
   ============================================================ */

function cvScanRenderComparisonInsights(
    candidates
) {

    const container =
        document.getElementById(
            "comparisonInsights"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    candidates.forEach(
        candidate => {

            const finalScore =
                Number(
                    candidate.final_score || 0
                );


            const semanticScore =
                Number(
                    candidate.semantic_score || 0
                );


            const skillScore =
                Number(
                    candidate.skill_score || 0
                );


            const experienceScore =
                Number(
                    candidate.experience_score || 0
                );


            const educationScore =
                Number(
                    candidate.education_score || 0
                );


            const projectScore =
                Number(
                    candidate.project_score || 0
                );


            const weakest =
                cvScanFindWeakestScore({

                    Semantic:
                        semanticScore,

                    Skills:
                        skillScore,

                    Experience:
                        experienceScore,

                    Education:
                        educationScore,

                    Projects:
                        projectScore

                });


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "comparison-insight-card";


            card.innerHTML = `

                <div class="comparison-insight-header">

                    <strong>

                        ${cvScanEscapeHTML(
                            candidate.name ||
                            "Unknown Candidate"
                        )}

                    </strong>


                    <span>

                        AI Match:
                        ${finalScore.toFixed(2)}%

                    </span>

                </div>


                <div class="insight-item">

                    <span>
                        Semantic Match
                    </span>

                    <strong>
                        ${semanticScore.toFixed(2)}%
                    </strong>

                </div>


                <div class="insight-item">

                    <span>
                        Skills Match
                    </span>

                    <strong>
                        ${skillScore.toFixed(2)}%
                    </strong>

                </div>


                <div class="insight-item">

                    <span>
                        Experience
                    </span>

                    <strong>
                        ${experienceScore.toFixed(2)}%
                    </strong>

                </div>


                <div class="insight-item">

                    <span>
                        Education
                    </span>

                    <strong>
                        ${educationScore.toFixed(2)}%
                    </strong>

                </div>


                <div class="insight-item">

                    <span>
                        Projects
                    </span>

                    <strong>
                        ${projectScore.toFixed(2)}%
                    </strong>

                </div>


                <div class="insight-item">

                    <span>
                        Lowest Score
                    </span>

                    <strong>
                        ${weakest}
                    </strong>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* ============================================================
   FIND WEAKEST SCORE
   ============================================================ */

function cvScanFindWeakestScore(
    scores
) {

    const entries =
        Object.entries(
            scores
        );


    if (!entries.length) {

        return "Not available";

    }


    entries.sort(
        (a, b) =>
            Number(a[1]) -
            Number(b[1])
    );


    return entries[0][0];

}


/* ============================================================
   CLOSE COMPARISON
   ============================================================ */

document.addEventListener(
    "click",
    function(event) {

        const closeButton =
            event.target.closest(
                "#closeCompareButton"
            );


        if (!closeButton) {
            return;
        }


        event.preventDefault();


        const section =
            document.getElementById(
                "compareCandidates"
            );


        if (section) {

            section.classList.add(
                "hidden"
            );


            section.style.display =
                "none";

        }

    }
);


/* ============================================================
   DELETE ANALYSIS BUTTON
   ============================================================ */

function cvScanCreateDeleteButton(
    candidateId
) {

    let button =
        document.getElementById(
            "deleteAnalysisButton"
        );


    if (button) {

        button.dataset.candidateId =
            candidateId;

        return button;

    }


    /*
     * Try to place it in profile header.
     */

    const profile =
        document.getElementById(
            "screeningResult"
        );


    if (!profile) {
        return null;
    }


    const header =
        profile.querySelector(
            ".card-header"
        ) ||
        profile.querySelector(
            ".result-header"
        ) ||
        profile.firstElementChild;


    button =
        document.createElement(
            "button"
        );


    button.id =
        "deleteAnalysisButton";


    button.type =
        "button";


    button.className =
        "delete-analysis-btn";


    button.dataset.candidateId =
        candidateId;


    button.innerHTML =
        "🗑 Delete Analysis";


    if (header) {

        header.appendChild(
            button
        );

    }
    else {

        profile.insertBefore(
            button,
            profile.firstChild
        );

    }


    return button;

}


/* ============================================================
   DELETE ANALYSIS CLICK
   ============================================================ */

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "#deleteAnalysisButton"
            );


        if (!button) {
            return;
        }


        event.preventDefault();
        event.stopPropagation();


        const candidateId =
            Number(
                button.dataset.candidateId
            );


        if (!candidateId) {

            alert(
                "Candidate ID not found."
            );


            return;

        }


        cvScanDeleteAnalysis(
            candidateId
        );

    }
);


/* ============================================================
   DELETE ANALYSIS
   ============================================================ */

async function cvScanDeleteAnalysis(
    candidateId
) {

    const candidate =
        allCandidates.find(
            item =>
                cvScanGetCandidateId(
                    item
                ) ===
                Number(candidateId)
        );


    const candidateName =
        candidate?.name ||
        "this candidate";


    const confirmed =
        window.confirm(

            `Delete analysis for ${candidateName}?\n\n` +

            "This will permanently remove the " +
            "candidate analysis from CV Scan."

        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/candidates/${candidateId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        }
        catch {

            data = null;

        }


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                data?.message ||
                "Unable to delete analysis."
            );

        }


        /*
         * Remove candidate locally.
         */

        allCandidates =
            allCandidates.filter(
                item =>
                    cvScanGetCandidateId(
                        item
                    ) !==
                    Number(candidateId)
            );


        /*
         * Remove from comparison.
         */

        cvScanSelectedCandidateIds =
            cvScanSelectedCandidateIds.filter(
                id =>
                    Number(id) !==
                    Number(candidateId)
            );


        /*
         * Hide candidate profile.
         */

        const profile =
            document.getElementById(
                "screeningResult"
            );


        if (profile) {

            profile.classList.add(
                "hidden"
            );

        }


        /*
         * Refresh candidate table.
         *
         * Use the existing renderer if it exists.
         */

        if (
            typeof renderCandidates ===
            "function"
        ) {

            renderCandidates(
                allCandidates
            );

        }
        else if (
            typeof loadCandidates ===
            "function"
        ) {

            await loadCandidates();

        }


        /*
         * Refresh statistics.
         */

        if (
            typeof updateDashboardStatistics ===
            "function"
        ) {

            updateDashboardStatistics(
                allCandidates
            );

        }


        cvScanUpdateCompareButton();


        alert(
            "Analysis deleted successfully."
        );


    }
    catch (error) {

        console.error(
            "Delete analysis error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete analysis."
        );

    }

}


/* ============================================================
   HOOK INTO EXISTING PROFILE DISPLAY
   ============================================================ */

function cvScanAttachDeleteButtonToProfile(
    candidateId
) {

    if (!candidateId) {
        return;
    }


    cvScanCreateDeleteButton(
        candidateId
    );

}


/* ============================================================
   MONITOR PROFILE FOR EXISTING CANDIDATE
   ============================================================ */

const cvScanProfileObserver =
    new MutationObserver(
        function() {

            const profile =
                document.getElementById(
                    "screeningResult"
                );


            if (!profile) {
                return;
            }


            /*
             * Try to identify the candidate
             * currently displayed.
             */

            let candidateId =
                profile.dataset.candidateId;


            if (!candidateId) {

                const nameElement =
                    document.getElementById(
                        "resultCandidateName"
                    );


                if (nameElement) {

                    const name =
                        nameElement.textContent
                            .trim();


                    const candidate =
                        allCandidates.find(
                            item =>
                                String(
                                    item.name || ""
                                ).trim() ===
                                name
                        );


                    if (candidate) {

                        candidateId =
                            candidate.id;

                    }

                }

            }


            if (candidateId) {

                cvScanAttachDeleteButtonToProfile(
                    candidateId
                );

            }

        }
    );


/* ============================================================
   START PROFILE OBSERVER
   ============================================================ */

if (document.body) {

    cvScanProfileObserver.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );

}


/* ============================================================
   PATCH EXISTING CANDIDATE RENDERER
   ============================================================ */

function cvScanRefreshSelectionUI() {

    /*
     * Add checkboxes after the existing
     * candidate rendering has completed.
     */

    setTimeout(
        function() {

            cvScanAddCandidateCheckboxes();

        },
        100
    );

}


/* ============================================================
   OBSERVE CANDIDATE TABLE
   ============================================================ */

const cvScanCandidateTable =
    document.getElementById(
        "candidateTableBody"
    );


if (cvScanCandidateTable) {

    const cvScanCandidateObserver =
        new MutationObserver(
            function() {

                cvScanRefreshSelectionUI();

            }
        );


    cvScanCandidateObserver.observe(
        cvScanCandidateTable,
        {
            childList: true,
            subtree: true
        }
    );


    /*
     * Initial attempt.
     */

    cvScanRefreshSelectionUI();

}


/* ============================================================
   PATCH LOAD CANDIDATES
   ============================================================ */

const cvScanOriginalLoadCandidates =
    typeof loadCandidates ===
    "function"
        ? loadCandidates
        : null;


/*
 * Do not replace the existing
 * loadCandidates function.
 *
 * The MutationObserver above will
 * automatically add the checkboxes
 * after it renders candidates.
 */


/* ============================================================
   KEEP SELECTION WHEN TABLE RE-RENDERS
   ============================================================ */

document.addEventListener(
    "click",
    function(event) {

        const row =
            event.target.closest(
                "#candidateTableBody tr"
            );


        if (!row) {
            return;
        }


        if (
            event.target.closest(
                ".candidate-checkbox"
            )
        ) {

            event.stopPropagation();

            return;

        }

    },
    true
);


/* ============================================================
   RESET SELECTION AFTER DELETION
   ============================================================ */

function cvScanClearCandidateSelection() {

    cvScanSelectedCandidateIds =
        [];


    document
        .querySelectorAll(
            ".candidate-checkbox"
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    false;

            }
        );


    cvScanUpdateCompareButton();

}


/* ============================================================
   GLOBAL ACCESS
   ============================================================ */

window.cvScanOpenComparison =
    cvScanOpenComparison;


window.cvScanDeleteAnalysis =
    cvScanDeleteAnalysis;


window.cvScanClearCandidateSelection =
    cvScanClearCandidateSelection;


window.cvScanAddCandidateCheckboxes =
    cvScanAddCandidateCheckboxes;


/* ============================================================
   INITIALIZE NEW FEATURES
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setTimeout(
            function() {

                cvScanAddCandidateCheckboxes();

                cvScanUpdateCompareButton();

            },
            500
        );

    }
);


/* ============================================================
   END OF CV SCAN ADD-ON
   ============================================================ */