from pathlib import Path

from backend.services.semantic_matcher import SemanticMatcher


resume_file = Path(
    r"C:\Users\kalir\cv_scan\data\job_descriptions\test_resume.txt"
)

job_file = Path(
    r"C:\Users\kalir\cv_scan\data\job_descriptions\ai_ml_engineer.txt"
)


resume_text = resume_file.read_text(
    encoding="utf-8"
)

job_text = job_file.read_text(
    encoding="utf-8"
)


matcher = SemanticMatcher()


similarity = matcher.calculate_similarity(
    resume_text,
    job_text
)


match_percentage = matcher.calculate_match_percentage(
    resume_text,
    job_text
)


print("\n========== SEMANTIC MATCH RESULT ==========\n")

print(
    f"Cosine Similarity: {similarity:.4f}"
)

print(
    f"Semantic Match Score: {match_percentage}%"
)

print("\n===========================================")