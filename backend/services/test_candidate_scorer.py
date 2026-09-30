from backend.services.candidate_scorer import CandidateScorer


candidate = {
    "name": "Test Candidate",

    "skills": [
        "python",
        "machine learning",
        "deep learning",
        "pandas",
        "numpy",
        "scikit-learn",
    ],

    "education": (
        "Bachelor's degree in Computer Science"
    ),

    "experience": (
        "Worked on machine learning projects"
    ),

    "projects": (
        "AI Resume Screening System"
    ),

    "certifications": (
        "Machine Learning Certification"
    ),
}


job = {
    "job_title": "AI/ML Engineer",

    "required_skills": [
        "python",
        "machine learning",
        "deep learning",
        "pandas",
        "numpy",
        "scikit-learn",
        "tensorflow",
        "pytorch",
    ],

    "education": (
        "Bachelor's degree in Computer Science "
        "or Artificial Intelligence"
    ),

    "experience_required": "1 years",
}


semantic_score = 82.50


scorer = CandidateScorer()


result = scorer.score_candidate(
    candidate,
    job,
    semantic_score
)


print("\n========== CANDIDATE SCORE ==========\n")

print(
    "Semantic Score:",
    result["semantic_score"]
)

print(
    "Skill Score:",
    result["skill_score"]
)

print(
    "Experience Score:",
    result["experience_score"]
)

print(
    "Education Score:",
    result["education_score"]
)

print(
    "Project Score:",
    result["project_score"]
)

print(
    "Final Score:",
    result["final_score"]
)

print("\n====================================")
