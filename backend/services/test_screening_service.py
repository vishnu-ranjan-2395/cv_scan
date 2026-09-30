from pathlib import Path

from backend.services.screening_service import (
    ScreeningService
)


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


service = ScreeningService()

result = service.screen_resume(
    resume_file,
    job_text
)


print("\n========== CV SCAN SCREENING ==========\n")

print("CANDIDATE:")
print(result["candidate"]["name"])

print("\nEMAIL:")
print(result["candidate"]["email"])

print("\nSKILLS:")
for skill in result["candidate"]["skills"]:
    print("-", skill)

print("\nJOB:")
print(result["job"]["job_title"])

print("\nSCORES:")

print(
    "Semantic:",
    result["score"]["semantic_score"]
)

print(
    "Skills:",
    result["score"]["skill_score"]
)

print(
    "Experience:",
    result["score"]["experience_score"]
)

print(
    "Education:",
    result["score"]["education_score"]
)

print(
    "Projects:",
    result["score"]["project_score"]
)

print(
    "FINAL SCORE:",
    result["score"]["final_score"]
)

print("\n========================================")