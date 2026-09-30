from pathlib import Path

from backend.services.resume_parser import extract_text
from backend.services.resume_information import extract_resume_information
from backend.services.job_parser import extract_job_information
from backend.services.semantic_matcher import SemanticMatcher
from backend.services.candidate_scorer import CandidateScorer


class ScreeningService:

    def __init__(self):
        self.matcher = SemanticMatcher()
        self.scorer = CandidateScorer()

    def screen_resume(
        self,
        resume_path,
        job_text
    ):
        resume_path = Path(resume_path)

        # --------------------------------
        # 1. Extract resume text
        # --------------------------------
        resume_text = extract_text(
            resume_path
        )

        if not resume_text.strip():
            raise ValueError(
                "No text could be extracted from resume."
            )

        # --------------------------------
        # 2. Extract candidate information
        # --------------------------------
        candidate = extract_resume_information(
            resume_text
        )

        # --------------------------------
        # 3. Extract job information
        # --------------------------------
        job = extract_job_information(
            job_text
        )

        # --------------------------------
        # 4. Semantic matching
        # --------------------------------
        semantic_score = (
            self.matcher.calculate_match_percentage(
                resume_text,
                job_text
            )
        )

        # --------------------------------
        # 5. Candidate scoring
        # --------------------------------
        score = self.scorer.score_candidate(
            candidate,
            job,
            semantic_score
        )

        # --------------------------------
        # 6. Return complete result
        # --------------------------------
        return {
            "candidate": candidate,
            "job": job,
            "score": score
        }