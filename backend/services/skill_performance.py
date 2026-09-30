import re


class SkillPerformanceCalculator:
    """
    Calculates skill-level performance using evidence
    from the candidate's resume, projects and certifications.

    This is a project-defined heuristic, not an objective
    measurement of actual human skill proficiency.
    """

    RESUME_SKILL_POINTS = 40
    PROJECT_EVIDENCE_POINTS = 35
    CERTIFICATION_EVIDENCE_POINTS = 25

    def normalize_text(self, text):
        if not text:
            return ""

        return re.sub(
            r"\s+",
            " ",
            str(text).lower()
        ).strip()

    def skill_exists_in_text(
        self,
        skill,
        text
    ):
        if not text:
            return False

        normalized_skill = self.normalize_text(
            skill
        )

        normalized_text = self.normalize_text(
            text
        )

        if not normalized_skill:
            return False

        # Multi-word skills need direct phrase matching.
        if " " in normalized_skill:
            return normalized_skill in normalized_text

        # Word-boundary matching prevents partial matches.
        pattern = (
            r"(?<!\w)"
            + re.escape(normalized_skill)
            + r"(?!\w)"
        )

        return bool(
            re.search(
                pattern,
                normalized_text
            )
        )

    def calculate_skill_score(
        self,
        skill,
        candidate_skills,
        projects,
        certifications
    ):
        score = 0

        # ----------------------------------------------------
        # Resume skill evidence
        # ----------------------------------------------------

        normalized_candidate_skills = {
            self.normalize_text(item)
            for item in candidate_skills
            if item
        }

        normalized_skill = self.normalize_text(
            skill
        )

        if normalized_skill in normalized_candidate_skills:

            score += self.RESUME_SKILL_POINTS

        # ----------------------------------------------------
        # Project evidence
        # ----------------------------------------------------

        if self.skill_exists_in_text(
            skill,
            projects
        ):

            score += self.PROJECT_EVIDENCE_POINTS

        # ----------------------------------------------------
        # Certification evidence
        # ----------------------------------------------------

        if self.skill_exists_in_text(
            skill,
            certifications
        ):

            score += (
                self.CERTIFICATION_EVIDENCE_POINTS
            )

        return min(
            score,
            100
        )

    def calculate_candidate_skill_performance(
        self,
        candidate
    ):
        candidate_skills = candidate.get(
            "skills",
            []
        )

        projects = candidate.get(
            "projects",
            ""
        )

        certifications = candidate.get(
            "certifications",
            ""
        )

        skill_performance = []

        for skill in candidate_skills:

            if not skill:
                continue

            score = self.calculate_skill_score(
                skill,
                candidate_skills,
                projects,
                certifications
            )

            project_evidence = (
                self.skill_exists_in_text(
                    skill,
                    projects
                )
            )

            certification_evidence = (
                self.skill_exists_in_text(
                    skill,
                    certifications
                )
            )

            skill_performance.append(
                {
                    "skill": skill,

                    "score": score,

                    "resume_evidence": True,

                    "project_evidence": (
                        project_evidence
                    ),

                    "certification_evidence": (
                        certification_evidence
                    )
                }
            )

        # Highest skill scores first.
        skill_performance.sort(
            key=lambda item: item["score"],
            reverse=True
        )

        return skill_performance