import re


# Skills that CV Scan can recognize in job descriptions
SKILLS = [
    "python",
    "java",
    "c",
    "c++",
    "javascript",
    "html",
    "css",
    "sql",
    "mysql",
    "mongodb",
    "pandas",
    "numpy",
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "natural language processing",
    "computer vision",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "fastapi",
    "flask",
    "django",
    "react",
    "node.js",
    "git",
    "github",
    "docker",
    "aws",
    "azure",
    "rag",
    "generative ai",
    "llm",
    "large language models",
    "nlp",
    "opencv",
    "faiss",
]


def extract_skills(text):
    text_lower = text.lower()

    found_skills = []

    for skill in SKILLS:
        # Escape special characters such as + and .
        pattern = r"(?<!\w)" + re.escape(skill.lower()) + r"(?!\w)"

        if re.search(pattern, text_lower):
            found_skills.append(skill)

    return sorted(set(found_skills))


def extract_section(text, section_names):
    lines = text.splitlines()

    start_index = -1

    for index, line in enumerate(lines):
        clean_line = line.strip().lower()

        if clean_line in section_names:
            start_index = index
            break

    if start_index == -1:
        return ""

    section_content = []

    possible_sections = [
        "requirements",
        "required skills",
        "technical skills",
        "skills",
        "qualifications",
        "education",
        "experience",
        "responsibilities",
        "job responsibilities",
        "preferred skills",
        "preferred qualifications",
        "about the role",
        "job description",
    ]

    for line in lines[start_index + 1:]:

        clean_line = line.strip().lower()

        if clean_line in possible_sections:
            break

        if line.strip():
            section_content.append(line.strip())

    return "\n".join(section_content)


def extract_job_title(text):
    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    title_keywords = [
        "software engineer",
        "software developer",
        "python developer",
        "java developer",
        "machine learning engineer",
        "ai engineer",
        "data scientist",
        "data analyst",
        "full stack developer",
        "backend developer",
        "frontend developer",
        "ml engineer",
        "ai/ml engineer",
    ]

    for line in lines[:15]:
        line_lower = line.lower()

        for keyword in title_keywords:
            if keyword in line_lower:
                return line

    return lines[0] if lines else None


def extract_experience_requirement(text):
    pattern = r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)"

    matches = re.findall(
        pattern,
        text.lower()
    )

    if matches:
        return matches[0] + " years"

    return None


def extract_job_information(text):

    information = {
        "job_title": extract_job_title(text),

        "required_skills": extract_skills(text),

        "education": extract_section(
            text,
            [
                "education",
                "educational qualifications",
                "qualifications",
            ],
        ),

        "requirements": extract_section(
            text,
            [
                "requirements",
                "required skills",
                "required qualifications",
            ],
        ),

        "responsibilities": extract_section(
            text,
            [
                "responsibilities",
                "job responsibilities",
                "roles and responsibilities",
            ],
        ),

        "preferred_skills": extract_section(
            text,
            [
                "preferred skills",
                "preferred qualifications",
            ],
        ),

        "experience_required": extract_experience_requirement(text),

        "raw_text": text,
    }

    return information