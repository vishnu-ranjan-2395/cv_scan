import re


class CandidateScorer:

    # =========================================================
    # SCORE WEIGHTS
    # =========================================================

    SEMANTIC_WEIGHT = 0.40
    SKILL_WEIGHT = 0.30
    EXPERIENCE_WEIGHT = 0.15
    EDUCATION_WEIGHT = 0.10
    PROJECT_WEIGHT = 0.05

    # =========================================================
    # SKILL MATCH
    # =========================================================

    def calculate_skill_match(
        self,
        candidate_skills,
        required_skills
    ):

        candidate_skills = candidate_skills or []
        required_skills = required_skills or []

        if not required_skills:
            return 100.0

        candidate_set = {
            str(skill).lower().strip()
            for skill in candidate_skills
        }

        required_set = {
            str(skill).lower().strip()
            for skill in required_skills
        }

        matched_skills = candidate_set.intersection(
            required_set
        )

        score = (
            len(matched_skills)
            / len(required_set)
        ) * 100

        return round(score, 2)

    # =========================================================
    # EXPERIENCE EXTRACTION
    # =========================================================

    def extract_years_from_text(self, text):
        """
        Extract total experience in years from resume/job text.

        Examples:
            2 years       -> 2.0
            3+ years      -> 3.0
            1.5 years     -> 1.5
            6 months      -> 0.5
            8 months      -> 0.67
        """

        if not text:
            return 0.0

        text = str(text).lower()

        total_months = 0.0

        # -----------------------------------------------------
        # Years
        # -----------------------------------------------------

        year_matches = re.findall(
            r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)",
            text
        )

        if year_matches:
            for value in year_matches:
                try:
                    total_months += float(value) * 12
                except ValueError:
                    pass

        # -----------------------------------------------------
        # Months
        # -----------------------------------------------------

        month_matches = re.findall(
            r"(\d+(?:\.\d+)?)\s*(?:months?|mos?)",
            text
        )

        if month_matches:
            for value in month_matches:
                try:
                    total_months += float(value)
                except ValueError:
                    pass

        # -----------------------------------------------------
        # Return years
        # -----------------------------------------------------

        return round(total_months / 12, 2)

    # =========================================================
    # REQUIRED EXPERIENCE
    # =========================================================

    def extract_required_experience(
        self,
        required_experience
    ):
        """
        Convert job requirement such as
        '2 years' into numeric years.
        """

        if not required_experience:
            return 0.0

        return self.extract_years_from_text(
            required_experience
        )

    # =========================================================
    # EXPERIENCE MATCH
    # =========================================================

    def calculate_experience_match(
        self,
        candidate_experience,
        required_experience
    ):
        """
        Compare candidate experience with required experience.

        Examples:

        Required: 2 years
        Candidate: 2 years
        Score: 100%

        Required: 2 years
        Candidate: 1 year
        Score: 50%

        Required: 2 years
        Candidate: 6 months
        Score: 25%

        Required: 2 years
        Candidate: 3 years
        Score: 100%

        If the job does not specify experience:
        Score = 100%
        """

        required_years = self.extract_required_experience(
            required_experience
        )

        # -----------------------------------------------------
        # No experience requirement
        # -----------------------------------------------------

        if required_years <= 0:
            return 100.0

        # -----------------------------------------------------
        # No candidate experience
        # -----------------------------------------------------

        if not candidate_experience:
            return 0.0

        candidate_years = self.extract_years_from_text(
            candidate_experience
        )

        # -----------------------------------------------------
        # No measurable experience found
        # -----------------------------------------------------

        if candidate_years <= 0:
            return 0.0

        # -----------------------------------------------------
        # Candidate meets/exceeds requirement
        # -----------------------------------------------------

        if candidate_years >= required_years:
            return 100.0

        # -----------------------------------------------------
        # Partial experience
        # -----------------------------------------------------

        score = (
            candidate_years
            / required_years
        ) * 100

        return round(
            min(score, 100.0),
            2
        )

    # =========================================================
    # EDUCATION NORMALIZATION
    # =========================================================

    def normalize_education(self, text):
        """
        Normalize education text for comparison.
        """

        if not text:
            return ""

        text = str(text).lower()

        # Normalize punctuation
        text = re.sub(
            r"[^a-z0-9\s]",
            " ",
            text
        )

        # Normalize spaces
        text = re.sub(
            r"\s+",
            " ",
            text
        ).strip()

        return text

    # =========================================================
    # DEGREE DETECTION
    # =========================================================

    def detect_degrees(self, text):

        text = self.normalize_education(text)

        degrees = set()

        degree_patterns = {
            "btech": [
                r"\bb\s*tech\b",
                r"\bbtech\b",
                r"\bbachelor\s+of\s+technology\b"
            ],

            "be": [
                r"\bb\s*e\b",
                r"\bbe\b",
                r"\bbachelor\s+of\s+engineering\b"
            ],

            "mtech": [
                r"\bm\s*tech\b",
                r"\bmtech\b",
                r"\bmaster\s+of\s+technology\b"
            ],

            "me": [
                r"\bm\s*e\b",
                r"\bmaster\s+of\s+engineering\b"
            ],

            "bca": [
                r"\bbca\b",
                r"\bbachelor\s+of\s+computer\s+applications\b"
            ],

            "mca": [
                r"\bmca\b",
                r"\bmaster\s+of\s+computer\s+applications\b"
            ],

            "bsc": [
                r"\bb\s*sc\b",
                r"\bbsc\b",
                r"\bbachelor\s+of\s+science\b"
            ],

            "msc": [
                r"\bm\s*sc\b",
                r"\bmsc\b",
                r"\bmaster\s+of\s+science\b"
            ],

            "diploma": [
                r"\bdiploma\b"
            ],

            "phd": [
                r"\bphd\b",
                r"\bph\.d\b",
                r"\bdoctorate\b"
            ]
        }

        for degree, patterns in degree_patterns.items():

            for pattern in patterns:

                if re.search(pattern, text):
                    degrees.add(degree)
                    break

        return degrees

    # =========================================================
    # FIELD DETECTION
    # =========================================================

    def detect_education_fields(self, text):

        text = self.normalize_education(text)

        fields = set()

        field_patterns = {
            "computer_science": [
                "computer science",
                "computer science engineering",
                "computer engineering",
                "cse"
            ],

            "information_technology": [
                "information technology",
                "information technology engineering",
                "it"
            ],

            "artificial_intelligence": [
                "artificial intelligence",
                "artificial intelligence and machine learning",
                "ai ml",
                "aiml"
            ],

            "machine_learning": [
                "machine learning"
            ],

            "data_science": [
                "data science",
                "data analytics"
            ],

            "electronics": [
                "electronics",
                "electronics and communication",
                "ece"
            ],

            "electrical": [
                "electrical engineering",
                "eee"
            ],

            "mechanical": [
                "mechanical engineering",
                "mechanical"
            ],

            "civil": [
                "civil engineering",
                "civil"
            ],

            "engineering": [
                "engineering"
            ],

            "business": [
                "business administration",
                "management",
                "mba"
            ]
        }

        for field, keywords in field_patterns.items():

            for keyword in keywords:

                if keyword in text:
                    fields.add(field)
                    break

        return fields

    # =========================================================
    # EDUCATION MATCH
    # =========================================================

    def calculate_education_match(
        self,
        candidate_education,
        required_education
    ):
        """
        Compare candidate education against job education.

        Scoring:

        100% -> matching degree and field
        85%  -> matching degree / related field
        70%  -> related engineering qualification
        50%  -> education exists but weak match
        0%   -> education missing
        """

        # -----------------------------------------------------
        # No job education requirement
        # -----------------------------------------------------

        if not required_education:
            return 100.0

        # -----------------------------------------------------
        # No candidate education
        # -----------------------------------------------------

        if not candidate_education:
            return 0.0

        candidate_text = self.normalize_education(
            candidate_education
        )

        required_text = self.normalize_education(
            required_education
        )

        if not candidate_text:
            return 0.0

        # -----------------------------------------------------
        # Detect degrees
        # -----------------------------------------------------

        candidate_degrees = self.detect_degrees(
            candidate_text
        )

        required_degrees = self.detect_degrees(
            required_text
        )

        # -----------------------------------------------------
        # Detect fields
        # -----------------------------------------------------

        candidate_fields = self.detect_education_fields(
            candidate_text
        )

        required_fields = self.detect_education_fields(
            required_text
        )

        # -----------------------------------------------------
        # Exact degree + field match
        # -----------------------------------------------------

        degree_match = bool(
            candidate_degrees.intersection(
                required_degrees
            )
        )

        field_match = bool(
            candidate_fields.intersection(
                required_fields
            )
        )

        if degree_match and field_match:
            return 100.0

        # -----------------------------------------------------
        # Same degree but field not detected
        # -----------------------------------------------------

        if degree_match:
            return 85.0

        # -----------------------------------------------------
        # Same field but different degree
        # -----------------------------------------------------

        if field_match:
            return 75.0

        # -----------------------------------------------------
        # Both are engineering qualifications
        # -----------------------------------------------------

        if (
            "engineering" in candidate_fields
            and "engineering" in required_fields
        ):
            return 70.0

        # -----------------------------------------------------
        # Related education exists
        # -----------------------------------------------------

        if candidate_degrees:
            return 50.0

        return 25.0

    # =========================================================
    # PROJECT MATCH
    # =========================================================

    def calculate_project_match(
        self,
        projects,
        certifications
    ):

        has_projects = bool(
            projects and str(projects).strip()
        )

        has_certifications = bool(
            certifications and str(certifications).strip()
        )

        if has_projects and has_certifications:
            return 100.0

        if has_projects or has_certifications:
            return 70.0

        return 0.0

    # =========================================================
    # FINAL SCORE
    # =========================================================

    def calculate_final_score(
        self,
        semantic_score,
        skill_score,
        experience_score,
        education_score,
        project_score
    ):

        final_score = (
            semantic_score * self.SEMANTIC_WEIGHT
            + skill_score * self.SKILL_WEIGHT
            + experience_score * self.EXPERIENCE_WEIGHT
            + education_score * self.EDUCATION_WEIGHT
            + project_score * self.PROJECT_WEIGHT
        )

        return round(
            final_score,
            2
        )

    # =========================================================
    # COMPLETE CANDIDATE SCORING
    # =========================================================

    def score_candidate(
        self,
        candidate,
        job,
        semantic_score
    ):

        # -----------------------------------------------------
        # Skills
        # -----------------------------------------------------

        skill_score = self.calculate_skill_match(
            candidate.get("skills", []),
            job.get("required_skills", [])
        )

        # -----------------------------------------------------
        # Experience
        # -----------------------------------------------------

        experience_score = self.calculate_experience_match(
            candidate.get("experience", ""),
            job.get("experience_required")
        )

        # -----------------------------------------------------
        # Education
        # -----------------------------------------------------

        education_score = self.calculate_education_match(
            candidate.get("education", ""),
            job.get("education", "")
        )

        # -----------------------------------------------------
        # Projects
        # -----------------------------------------------------

        project_score = self.calculate_project_match(
            candidate.get("projects", ""),
            candidate.get("certifications", "")
        )

        # -----------------------------------------------------
        # Final AI score
        # -----------------------------------------------------

        final_score = self.calculate_final_score(
            semantic_score,
            skill_score,
            experience_score,
            education_score,
            project_score
        )

        # -----------------------------------------------------
        # Return scores
        # -----------------------------------------------------

        return {
            "semantic_score": round(
                float(semantic_score),
                2
            ),

            "skill_score": round(
                float(skill_score),
                2
            ),

            "experience_score": round(
                float(experience_score),
                2
            ),

            "education_score": round(
                float(education_score),
                2
            ),

            "project_score": round(
                float(project_score),
                2
            ),

            "final_score": round(
                float(final_score),
                2
            )
        }