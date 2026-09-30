import re
import spacy


# Load spaCy English model
nlp = spacy.load("en_core_web_sm")


# Skills that CV Scan can currently recognize
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
]


def extract_email(text):
    pattern = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"

    match = re.search(pattern, text)

    if match:
        return match.group(0)

    return None


def extract_phone(text):
    pattern = r"(?:\+91[\s-]?)?[6-9]\d{9}"

    match = re.search(pattern, text)

    if match:
        return match.group(0)

    return None


def extract_name(text):
    """
    Extract the applicant's name from the resume.

    The name is searched using:
    1. Explicit labels such as "Name:"
    2. Name-like text near the top of the resume
    3. spaCy PERSON entities

    Resume section headings such as "Educational Background",
    "Skills", "Experience", etc. are never accepted as names.
    """

    if not text:
        return None

    # =========================================================
    # INVALID HEADINGS / TEXT
    # =========================================================

    invalid_names = {
        "resume",
        "cv",
        "curriculum vitae",

        "profile",
        "profile summary",
        "professional summary",
        "summary",

        "objective",
        "career objective",

        "about me",

        "key strengths",
        "key skills",
        "technical skills",
        "soft skills",
        "skills",

        "education",
        "educational qualification",
        "educational qualifications",
        "educational background",
        "academic background",
        "academic qualification",
        "academic qualifications",

        "experience",
        "work experience",
        "professional experience",
        "employment history",

        "projects",
        "academic projects",
        "personal projects",
        "project experience",

        "certification",
        "certifications",
        "certificate",
        "certificates",

        "achievements",
        "accomplishments",

        "contact",
        "contact details",
        "personal details",

        "references",
        "declaration",

        "languages",
        "hobbies",
        "interests",
    }

    invalid_phrases = {
        "educational background",
        "educational qualification",
        "academic background",

        "key strengths",
        "key skills",
        "technical skills",

        "work experience",
        "professional experience",
        "employment history",

        "machine learning",
        "artificial intelligence",
        "computer science",

        "software developer",
        "full stack developer",
        "web developer",
        "data scientist",

        "quick learner",
        "problem solver",
        "team player",
        "hard worker",
    }

    # =========================================================
    # NAME VALIDATION
    # =========================================================

    def is_valid_name(candidate):

        if not candidate:
            return False

        candidate = candidate.strip()
        candidate = re.sub(r"\s+", " ", candidate)

        normalized = candidate.lower().strip()

        # Direct heading rejection
        if normalized in invalid_names:
            return False

        # Phrase rejection
        for phrase in invalid_phrases:
            if phrase in normalized:
                return False

        # Length
        if len(candidate) < 3 or len(candidate) > 60:
            return False

        # Email / URL rejection
        if "@" in candidate:
            return False

        if "http://" in normalized:
            return False

        if "https://" in normalized:
            return False

        if "www." in normalized:
            return False

        if "linkedin" in normalized:
            return False

        if "github" in normalized:
            return False

        # Phone / large number rejection
        if re.search(r"\d{7,}", candidate):
            return False

        # Only letters, spaces, dots, hyphens and apostrophes
        if not re.fullmatch(
            r"[A-Za-z][A-Za-z.\-'\s]{1,59}",
            candidate
        ):
            return False

        words = candidate.split()

        # Normal name length
        if len(words) < 2 or len(words) > 5:
            return False

        # Reject resume section words
        forbidden_words = {
            "education",
            "educational",
            "academic",
            "background",
            "qualification",
            "qualifications",
            "experience",
            "professional",
            "employment",
            "skills",
            "skill",
            "strengths",
            "projects",
            "project",
            "certification",
            "certifications",
            "certificate",
            "certificates",
            "achievement",
            "achievements",
            "objective",
            "summary",
            "profile",
            "contact",
            "details",
            "references",
            "declaration",
            "language",
            "languages",
            "internship",
            "internships",
        }

        for word in words:
            clean_word = word.lower().strip(".-")

            if clean_word in forbidden_words:
                return False

        return True

    # =========================================================
    # CLEAN RESUME LINES
    # =========================================================

    lines = []

    for raw_line in text.splitlines():

        line = raw_line.strip()

        # Remove multiple spaces
        line = re.sub(r"\s+", " ", line)

        # Remove common OCR bullets/symbols
        line = line.strip(
            ":-|•·_+=#*"
        )

        if line:
            lines.append(line)

    if not lines:
        return None

    # =========================================================
    # METHOD 1:
    # EXPLICIT NAME LABEL
    #
    # Name: Mariyamul Asiya S
    # Candidate Name: Mariyamul Asiya S
    # Full Name: Mariyamul Asiya S
    # =========================================================

    name_patterns = [
        r"^name\s*[:\-]\s*(.+)$",
        r"^candidate\s+name\s*[:\-]\s*(.+)$",
        r"^full\s+name\s*[:\-]\s*(.+)$",
        r"^applicant\s+name\s*[:\-]\s*(.+)$",
    ]

    for line in lines[:30]:

        for pattern in name_patterns:

            match = re.match(
                pattern,
                line,
                flags=re.IGNORECASE
            )

            if match:

                candidate = match.group(1).strip()

                if is_valid_name(candidate):
                    return candidate

    # =========================================================
    # METHOD 2:
    # SEARCH TOP OF RESUME
    # =========================================================

    top_lines = lines[:15]

    possible_names = []

    for index, line in enumerate(top_lines):

        candidate = line.strip()

        if not is_valid_name(candidate):
            continue

        words = candidate.split()

        score = 0

        # 2-4 words is common for a person's name
        if 2 <= len(words) <= 4:
            score += 3

        # Proper capitalization
        capitalized_count = 0

        for word in words:

            clean_word = word.strip(".-'")

            if (
                clean_word
                and clean_word[0].isupper()
            ):
                capitalized_count += 1

        if capitalized_count >= len(words) - 1:
            score += 3

        # Earlier lines receive higher priority
        score += max(
            0,
            10 - index
        )

        possible_names.append(
            (score, candidate)
        )

    if possible_names:

        possible_names.sort(
            key=lambda item: item[0],
            reverse=True
        )

        return possible_names[0][1]

    # =========================================================
    # METHOD 3:
    # SPACY PERSON ENTITY
    # =========================================================

    try:

        doc = nlp(text)

        person_candidates = []

        for entity in doc.ents:

            if entity.label_ != "PERSON":
                continue

            candidate = entity.text.strip()

            if not is_valid_name(candidate):
                continue

            words = candidate.split()

            if not 2 <= len(words) <= 5:
                continue

            person_candidates.append(
                candidate
            )

        # Prefer PERSON entities near the beginning
        for candidate in person_candidates:

            position = text.lower().find(
                candidate.lower()
            )

            if 0 <= position < 1500:
                return candidate

        if person_candidates:
            return person_candidates[0]

    except Exception as e:

        print(
            "spaCy name detection warning:",
            e
        )

    # =========================================================
    # NO VALID NAME FOUND
    # =========================================================

    return None


def extract_skills(text):
    text_lower = text.lower()

    found_skills = []

    for skill in SKILLS:
        if skill.lower() in text_lower:
            found_skills.append(skill)

    return sorted(set(found_skills))


def extract_section(text, section_names):
    lines = text.splitlines()

    section_start = -1

    for index, line in enumerate(lines):
        clean_line = line.strip().lower()

        for section in section_names:
            if clean_line == section:
                section_start = index
                break

        if section_start != -1:
            break

    if section_start == -1:
        return ""

    section_content = []

    for line in lines[section_start + 1:]:
        clean_line = line.strip().lower()

        # Stop when another common section starts
        if clean_line in [
            "skills",
            "technical skills",
            "education",
            "experience",
            "work experience",
            "projects",
            "certifications",
            "achievements",
            "contact",
            "profile",
            "summary",
        ]:
            break

        if line.strip():
            section_content.append(line.strip())

    return "\n".join(section_content)


def extract_resume_information(text):

    information = {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),

        "skills": extract_skills(text),

        "education": extract_section(
            text,
            [
                "education",
                "educational qualification",
                "academic background",
            ],
        ),

        "experience": extract_section(
            text,
            [
                "experience",
                "work experience",
                "professional experience",
            ],
        ),

        "projects": extract_section(
            text,
            [
                "projects",
                "academic projects",
                "personal projects",
            ],
        ),

        "certifications": extract_section(
            text,
            [
                "certifications",
                "certificates",
            ],
        ),

        "raw_text": text,
    }

    return information