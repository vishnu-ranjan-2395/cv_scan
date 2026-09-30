from backend.services.candidate_ranker import CandidateRanker


candidates = [

    {
        "name": "Candidate A",
        "email": "candidatea@example.com",
        "phone": "9876543210",

        "skills": [
            "python",
            "machine learning",
            "deep learning",
            "pandas",
            "numpy",
            "scikit-learn",
            "tensorflow",
        ],

        "education": (
            "Bachelor's degree in Computer Science"
        ),

        "experience": (
            "1 year experience in machine learning"
        ),

        "projects": (
            "AI and Machine Learning projects"
        ),

        "certifications": (
            "Machine Learning Certification"
        ),
    },

    {
        "name": "Candidate B",
        "email": "candidateb@example.com",
        "phone": "9876543211",

        "skills": [
            "python",
            "html",
            "css",
            "javascript",
            "mysql",
        ],

        "education": (
            "Bachelor's degree in Computer Science"
        ),

        "experience": (
            "Software development experience"
        ),

        "projects": (
            "Web development project"
        ),

        "certifications": "",
    },

    {
        "name": "Candidate C",
        "email": "candidatec@example.com",
        "phone": "9876543212",

        "skills": [
            "python",
            "machine learning",
            "natural language processing",
            "pandas",
            "numpy",
            "pytorch",
        ],

        "education": (
            "Bachelor's degree in Artificial Intelligence"
        ),

        "experience": (
            "Machine learning project experience"
        ),

        "projects": (
            "NLP and AI project"
        ),

        "certifications": (
            "AI Certification"
        ),
    },
]


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


semantic_scores = [
    88.0,
    62.0,
    84.0,
]


ranker = CandidateRanker()

results = ranker.rank_candidates(
    candidates,
    job,
    semantic_scores
)


print("\n========== CV SCAN RANKING ==========\n")

for candidate in results:

    print(
        f"Rank {candidate['rank']}: "
        f"{candidate['name']}"
    )

    print(
        f"Final Score: "
        f"{candidate['score']['final_score']}%"
    )

    print(
        f"Semantic Score: "
        f"{candidate['score']['semantic_score']}%"
    )

    print(
        f"Skill Score: "
        f"{candidate['score']['skill_score']}%"
    )

    print(
        f"Experience Score: "
        f"{candidate['score']['experience_score']}%"
    )

    print(
        f"Education Score: "
        f"{candidate['score']['education_score']}%"
    )

    print(
        f"Project Score: "
        f"{candidate['score']['project_score']}%"
    )

    print("------------------------------------")


print("\n====================================")