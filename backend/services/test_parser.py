from backend.services.resume_parser import extract_text

file_path = r"C:\Users\kalir\cv_scan\data\resumes\resume.jpg"

text = extract_text(file_path)

print("\n========== EXTRACTED RESUME TEXT ==========\n")
print(text)
print("\n============================================")