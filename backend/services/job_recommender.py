from sentence_transformers import SentenceTransformer
import torch


class JobRoleRecommender:

    def __init__(self):

        print("Loading Job Role Recommendation AI model...")

        self.model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )

        print(
            "Job Role Recommendation AI model loaded successfully."
        )

        # ====================================================
        # JOB ROLE KNOWLEDGE BASE
        # ====================================================

        self.job_roles = [

            {
                "role": "AI/ML Engineer",
                "description": """
                Develop artificial intelligence and machine learning
                systems using Python, machine learning, deep learning,
                artificial intelligence, NLP, computer vision,
                TensorFlow, PyTorch, scikit-learn and data processing.
                Work on model development, training, evaluation,
                deployment and AI-powered applications.
                """
            },

            {
                "role": "Machine Learning Engineer",
                "description": """
                Design, train and deploy machine learning models.
                Required knowledge includes Python, machine learning,
                deep learning, scikit-learn, TensorFlow, PyTorch,
                feature engineering, data preprocessing, model
                evaluation and deployment.
                """
            },

            {
                "role": "Data Scientist",
                "description": """
                Analyze large datasets and develop predictive models.
                Requires Python, Pandas, NumPy, statistics, machine
                learning, data visualization, data preprocessing,
                feature engineering and model evaluation.
                """
            },

            {
                "role": "Data Analyst",
                "description": """
                Analyze business and technical data to identify
                patterns and insights. Skills include Python, SQL,
                MySQL, Pandas, NumPy, data visualization, statistics,
                Excel and reporting.
                """
            },

            {
                "role": "NLP Engineer",
                "description": """
                Develop natural language processing applications
                using Python, NLP, machine learning, deep learning,
                transformers, text processing, information extraction,
                semantic similarity, embeddings and language models.
                """
            },

            {
                "role": "Computer Vision Engineer",
                "description": """
                Build computer vision and image processing systems.
                Requires Python, OpenCV, computer vision, deep learning,
                image processing, TensorFlow, PyTorch and machine
                learning.
                """
            },

            {
                "role": "Generative AI Engineer",
                "description": """
                Develop generative AI applications using Python,
                large language models, LLMs, RAG, embeddings,
                vector databases, NLP, prompt engineering and
                AI application development.
                """
            },

            {
                "role": "LLM Engineer",
                "description": """
                Build applications around large language models.
                Requires Python, LLMs, NLP, transformers, embeddings,
                vector databases, RAG, prompt engineering and
                generative AI.
                """
            },

            {
                "role": "AI Research Engineer",
                "description": """
                Research and develop advanced artificial intelligence
                and machine learning algorithms. Requires Python,
                machine learning, deep learning, mathematics,
                experimentation, model evaluation and research
                implementation.
                """
            },

            {
                "role": "Backend Developer",
                "description": """
                Develop server-side applications and REST APIs.
                Skills include Python, FastAPI, Flask, Django,
                Java, databases, SQL, MongoDB, API development,
                authentication and backend architecture.
                """
            },

            {
                "role": "Full Stack Developer",
                "description": """
                Develop complete web applications using frontend
                and backend technologies. Skills include HTML, CSS,
                JavaScript, React, Node.js, Python, databases,
                REST APIs and web application development.
                """
            },

            {
                "role": "Python Developer",
                "description": """
                Develop software applications using Python.
                Knowledge includes Python programming, FastAPI,
                Flask, Django, APIs, databases, automation,
                data processing and software development.
                """
            },

            {
                "role": "MLOps Engineer",
                "description": """
                Deploy, monitor and maintain machine learning
                systems in production. Requires Python, machine
                learning, Docker, cloud platforms, model deployment,
                CI/CD, monitoring and ML pipelines.
                """
            },

            {
                "role": "Cloud AI Engineer",
                "description": """
                Build and deploy AI and machine learning applications
                on cloud platforms. Requires Python, machine learning,
                artificial intelligence, AWS, Azure, Docker,
                APIs and cloud deployment.
                """
            },

            {
                "role": "AI Application Developer",
                "description": """
                Build practical AI-powered applications using
                Python, machine learning, NLP, computer vision,
                APIs, FastAPI, databases and AI models.
                """
            }
        ]

        # ====================================================
        # PRE-COMPUTE ROLE EMBEDDINGS
        # ====================================================

        role_descriptions = [
            role["description"]
            for role in self.job_roles
        ]

        self.role_embeddings = self.model.encode(
            role_descriptions,
            convert_to_tensor=True,
            normalize_embeddings=True
        )

    # ========================================================
    # CREATE CANDIDATE PROFILE TEXT
    # ========================================================

    def create_candidate_profile(self, candidate):

        skills = candidate.get("skills", [])
        projects = candidate.get("projects", "")
        certifications = candidate.get(
            "certifications",
            ""
        )
        raw_text = candidate.get(
            "raw_text",
            ""
        )

        profile_parts = []

        if skills:

            profile_parts.append(
                "Skills: " +
                ", ".join(skills)
            )

        if projects:

            profile_parts.append(
                "Projects: " +
                str(projects)
            )

        if certifications:

            profile_parts.append(
                "Certifications: " +
                str(certifications)
            )

        if raw_text:

            profile_parts.append(
                "Resume: " +
                str(raw_text)
            )

        profile = "\n".join(
            profile_parts
        )

        return profile.strip()

    # ========================================================
    # CALCULATE ROLE MATCH
    # ========================================================

    def calculate_role_matches(
        self,
        candidate,
        top_n=5
    ):

        profile = self.create_candidate_profile(
            candidate
        )

        if not profile:

            return []

        candidate_embedding = self.model.encode(
            profile,
            convert_to_tensor=True,
            normalize_embeddings=True
        )

        similarities = torch.matmul(
            self.role_embeddings,
            candidate_embedding
        )

        results = []

        for index, similarity in enumerate(
            similarities
        ):

            similarity_value = float(
                similarity.item()
            )

            # Convert cosine similarity
            # from approximately [-1, 1]
            # into percentage [0, 100].

            percentage = (
                (similarity_value + 1)
                / 2
            ) * 100

            percentage = round(
                percentage,
                2
            )

            role = self.job_roles[index]

            results.append(
                {
                    "role": role["role"],
                    "match_percentage": percentage
                }
            )

        # Highest matching role first

        results.sort(
            key=lambda item:
            item["match_percentage"],
            reverse=True
        )

        # Assign recommendation rank

        results = results[:top_n]

        for rank, result in enumerate(
            results,
            start=1
        ):

            result["rank"] = rank

        return results

    # ========================================================
    # COMPLETE RECOMMENDATION
    # ========================================================

    def recommend_roles(
        self,
        candidate,
        top_n=5
    ):

        recommendations = (
            self.calculate_role_matches(
                candidate,
                top_n
            )
        )

        return {
            "success": True,
            "total_recommendations": len(
                recommendations
            ),
            "recommendations": recommendations
        }