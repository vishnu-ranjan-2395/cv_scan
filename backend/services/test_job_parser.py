from pathlib import Path

from backend.services.job_parser import extract_job_information


file_path = Path(
    r"C:\Users\kalir\cv_scan\data\job_descriptions\ai_ml_engineer.txt"
)


text = file_path.read_text(
    encoding="utf-8"
)


information = extract_job_information(text)


print("\n========== JOB INFORMATION ==========\n")

print("JOB TITLE:")
print(information["job_title"])

print("\nREQUIRED SKILLS:")

for skill in information["required_skills"]:
    print("-", skill)

print("\nEDUCATION:")
print(information["education"])

print("\nEXPERIENCE REQUIRED:")
print(information["experience_required"])

print("\nREQUIREMENTS:")
print(information["requirements"])

print("\nRESPONSIBILITIES:")
print(information["responsibilities"])

print("\nPREFERRED SKILLS:")
print(information["preferred_skills"])

print("\n=====================================")