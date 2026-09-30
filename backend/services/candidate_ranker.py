from backend.services.candidate_scorer import CandidateScorer


class CandidateRanker:

    def __init__(self):
        self.scorer = CandidateScorer()

    def rank_candidates(
        self,
        candidates,
        job,
        semantic_scores
    ):
        ranked_candidates = []

        for index, candidate in enumerate(candidates):

            semantic_score = semantic_scores[index]

            score_result = self.scorer.score_candidate(
                candidate,
                job,
                semantic_score
            )

            candidate_result = {
                "rank": 0,
                "name": candidate.get(
                    "name",
                    "Unknown Candidate"
                ),
                "email": candidate.get(
                    "email"
                ),
                "phone": candidate.get(
                    "phone"
                ),
                "skills": candidate.get(
                    "skills",
                    []
                ),
                "score": score_result
            }

            ranked_candidates.append(
                candidate_result
            )

        ranked_candidates.sort(
            key=lambda candidate:
                candidate["score"]["final_score"],
            reverse=True
        )

        for rank, candidate in enumerate(
            ranked_candidates,
            start=1
        ):
            candidate["rank"] = rank

        return ranked_candidates