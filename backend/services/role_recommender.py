from backend.services.semantic_matcher import SemanticMatcher


class RoleRecommender:

    ROLE_PROFILES = [
        {
            "role": "AI/ML Engineer",
            "description": (
                "Develop artificial intelligence and machine learning systems "
                "using Python, machine learning, deep learning, data analysis, "
                "natural language processing, computer vision, TensorFlow, "
                "PyTorch and scikit-learn."
            ),
            "skills": [
                "python",
                "machine learning",
                "deep learning",
                "artificial intelligence",
                "numpy",
                "pandas",
                "scikit-learn",
                "tensorflow",
                "pytorch"
            ]
        },

        {
            "role": "Machine Learning Engineer",
            "description": (
                "Build, train, evaluate and deploy machine learning models. "
                "Strong knowledge of Python, machine learning, data processing, "
                "NumPy, Pandas, scikit-learn, TensorFlow and PyTorch."
            ),
            "skills": [
                "python",
                "machine learning",
                "numpy",
                "pandas",
                "scikit-learn",
                "tensorflow",
                "pytorch",
                "deep learning"
            ]
        },

        {
            "role": "Data Scientist",
            "description": (
                "Analyze data and develop predictive models using Python, "
                "Pandas, NumPy, machine learning, statistics, data visualization "
                "and scikit-learn."
            ),
            "skills": [
                "python",
                "pandas",
                "numpy",
                "machine learning",
                "scikit-learn",
                "sql",
                "data analysis"
            ]
        },

        {
            "role": "Data Analyst",
            "description": (
                "Analyze structured data, create reports and identify useful "
                "business insights using Python, SQL, Pandas, NumPy and data "
                "visualization techniques."
            ),
            "skills": [
                "python",
                "sql",
                "mysql",
                "pandas",
                "numpy",
                "data analysis"
            ]
        },

        {
            "role": "Python Developer",
            "description": (
                "Develop software applications and backend systems using Python, "
                "FastAPI, Flask, Django, SQL, MongoDB, REST APIs and Git."
            ),
            "skills": [
                "python",
                "fastapi",
                "flask",
                "django",
                "sql",
                "mysql",
                "mongodb",
                "git"
            ]
        },

        {
            "role": "Backend Developer",
            "description": (
                "Develop scalable backend applications and REST APIs using "
                "Python, FastAPI, Flask, databases, SQL, MongoDB, Git and Docker."
            ),
            "skills": [
                "python",
                "fastapi",
                "flask",
                "sql",
                "mysql",
                "mongodb",
                "git",
                "docker"
            ]
        },

        {
            "role": "Full Stack Developer",
            "description": (
                "Build complete web applications using HTML, CSS, JavaScript, "
                "React, Node.js, Python, databases, REST APIs and Git."
            ),
            "skills": [
                "html",
                "css",
                "javascript",
                "react",
                "node.js",
                "python",
                "sql",
                "mongodb",
                "git"
            ]
        },

        {
            "role": "NLP Engineer",
            "description": (
                "Develop natural language processing and language AI applications "
                "using Python, NLP, machine learning, deep learning, transformers, "
                "LLMs, RAG and text processing."
            ),
            "skills": [
                "python",
                "natural language processing",
                "nlp",
                "machine learning",
                "deep learning",
                "llm",
                "large language models",
                "rag"
            ]
        },

        {
            "role": "Computer Vision Engineer",
            "description": (
                "Develop computer vision and image processing systems using Python, "
                "OpenCV, machine learning, deep learning, TensorFlow and PyTorch."
            ),
            "skills": [
                "python",
                "computer vision",
                "opencv",
                "machine learning",
                "deep learning",
                "tensorflow",
                "pytorch"
            ]
        },

        {
            "role": "Generative AI Engineer",
            "description": (
                "Develop generative AI applications using Python, large language "
                "models, LLMs, RAG, NLP, embeddings, vector databases and AI APIs."
            ),
            "skills": [
                "python",
                "generative ai",
                "llm",
                "large language models",
                "rag",
                "nlp",
                "faiss",
                "machine learning"
            ]
        },

        {
            "role": "AI Software Developer",
            "description": (
                "Develop intelligent software applications by combining Python, "
                "artificial intelligence, machine learning, NLP, databases, "
                "FastAPI and modern AI frameworks."
            ),
            "skills": [
                "python",
                "artificial intelligence",
                "machine learning",
                "natural language processing",
                "fastapi",
                "sql",
                "git"
            ]
        }
    ]

    def __init__(self, semantic_matcher=None):
        self.matcher = semantic_matcher or SemanticMatcher()

    def normalize_skill(self, skill):
        if not skill:
            return ""

        return str(skill).lower().strip()

    def calculate_skill_match(self, candidate_skills, role_skills):
        candidate_set = {
            self.normalize_skill(skill)
            for skill in candidate_skills
            if skill
        }

        role_set = {
            self.normalize_skill(skill)
            for skill in role_skills
            if skill
        }

        if not role_set:
            return 0.0, [], []

        matched_skills = sorted(candidate_set.intersection(role_set))
        missing_skills = sorted(role_set - candidate_set)

        score = (
            len(matched_skills) / len(role_set)
        ) * 100

        return (
            round(score, 2),
            matched_skills,
            missing_skills
        )

    def build_candidate_text(self, candidate):
        parts = []

        skills = candidate.get("skills", [])
        education = candidate.get("education", "")
        experience = candidate.get("experience", "")
        projects = candidate.get("projects", "")
        certifications = candidate.get("certifications", "")
        raw_text = candidate.get("raw_text", "")

        if skills:
            parts.append(
                "Skills: " + ", ".join(str(skill) for skill in skills)
            )

        if education:
            parts.append(
                "Education: " + str(education)
            )

        if experience:
            parts.append(
                "Experience: " + str(experience)
            )

        if projects:
            parts.append(
                "Projects: " + str(projects)
            )

        if certifications:
            parts.append(
                "Certifications: " + str(certifications)
            )

        if raw_text:
            parts.append(
                str(raw_text)
            )

        return "\n".join(parts).strip()

    def calculate_semantic_match(self, candidate_text, role_description):
        if not candidate_text:
            return 0.0

        try:
            return self.matcher.calculate_match_percentage(
                candidate_text,
                role_description
            )
        except Exception as error:
            print(
                f"Semantic role matching failed: {error}"
            )
            return 0.0

    def generate_reason(
        self,
        matched_skills,
        missing_skills,
        semantic_score,
        skill_score
    ):
        reasons = []

        if matched_skills:
            reasons.append(
                "Matched skills: " +
                ", ".join(matched_skills)
            )

        if semantic_score >= 70:
            reasons.append(
                "Strong semantic similarity with the role."
            )
        elif semantic_score >= 50:
            reasons.append(
                "Moderate semantic similarity with the role."
            )
        else:
            reasons.append(
                "Limited semantic similarity with the role."
            )

        if missing_skills:
            reasons.append(
                "Skills to improve: " +
                ", ".join(missing_skills[:5])
            )

        return reasons

    def calculate_final_role_score(
        self,
        semantic_score,
        skill_score
    ):
        final_score = (
            semantic_score * 0.60
            + skill_score * 0.40
        )

        return round(
            min(max(final_score, 0), 100),
            2
        )

    def recommend_roles(
        self,
        candidate,
        top_n=5
    ):
        candidate_text = self.build_candidate_text(candidate)

        candidate_skills = candidate.get(
            "skills",
            []
        )

        recommendations = []

        for role_profile in self.ROLE_PROFILES:

            role_name = role_profile["role"]
            role_description = role_profile["description"]
            role_skills = role_profile["skills"]

            skill_score, matched_skills, missing_skills = (
                self.calculate_skill_match(
                    candidate_skills,
                    role_skills
                )
            )

            semantic_score = self.calculate_semantic_match(
                candidate_text,
                role_description
            )

            final_score = self.calculate_final_role_score(
                semantic_score,
                skill_score
            )

            reasons = self.generate_reason(
                matched_skills,
                missing_skills,
                semantic_score,
                skill_score
            )

            recommendations.append(
                {
                    "role": role_name,
                    "recommendation_score": final_score,
                    "semantic_score": semantic_score,
                    "skill_match_score": skill_score,
                    "matched_skills": matched_skills,
                    "missing_skills": missing_skills,
                    "reasons": reasons
                }
            )

        recommendations.sort(
            key=lambda item: item["recommendation_score"],
            reverse=True
        )

        for index, recommendation in enumerate(
            recommendations,
            start=1
        ):
            recommendation["rank"] = index

        return recommendations[:top_n]