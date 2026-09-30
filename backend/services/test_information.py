from backend.services.resume_parser import extract_text
from backend.services.resume_information import extract_resume_information


file_path = r"C:\Users\kalir\cv_scan\data\resumes\resume.jpg"


text = extract_text(file_path)

information = extract_resume_information(text)


print("\n========== STRUCTURED RESUME INFORMATION ==========\n")

print("NAME:")
print(information["name"])

print("\nEMAIL:")
print(information["email"])

print("\nPHONE:")
print(information["phone"])

print("\nSKILLS:")
for skill in information["skills"]:
    print("-", skill)

print("\nEDUCATION:")
print(information["education"])

print("\nEXPERIENCE:")
print(information["experience"])

print("\nPROJECTS:")
print(information["projects"])

print("\nCERTIFICATIONS:")
print(information["certifications"])

print("\n====================================================")