from sentence_transformers import SentenceTransformer
import torch


class SemanticMatcher:

    def __init__(self):
        print("Loading Sentence-BERT model...")

        self.model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )

        print("Sentence-BERT model loaded successfully.")

    def create_embedding(self, text):
        if not text or not text.strip():
            raise ValueError("Text cannot be empty.")

        embedding = self.model.encode(
            text,
            convert_to_tensor=True
        )

        return embedding

    def calculate_similarity(self, resume_text, job_text):

        if not resume_text.strip():
            raise ValueError("Resume text is empty.")

        if not job_text.strip():
            raise ValueError("Job description is empty.")

        resume_embedding = self.create_embedding(
            resume_text
        )

        job_embedding = self.create_embedding(
            job_text
        )

        similarity = torch.nn.functional.cosine_similarity(
            resume_embedding,
            job_embedding,
            dim=0
        )

        return float(similarity.item())

    def calculate_match_percentage(
        self,
        resume_text,
        job_text
    ):

        similarity = self.calculate_similarity(
            resume_text,
            job_text
        )

        # Convert cosine similarity to a 0-100 display score
        score = ((similarity + 1) / 2) * 100

        return round(score, 2)