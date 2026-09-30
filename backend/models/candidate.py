from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime

from backend.database import Base


class Candidate(Base):

    __tablename__ = "candidates"

    # ---------------------------------------------------------
    # PRIMARY KEY
    # ---------------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ---------------------------------------------------------
    # BASIC CANDIDATE INFORMATION
    # ---------------------------------------------------------

    name = Column(
        String(255),
        nullable=True
    )

    email = Column(
        String(255),
        nullable=True
    )

    phone = Column(
        String(50),
        nullable=True
    )

    # ---------------------------------------------------------
    # JOB INFORMATION
    # ---------------------------------------------------------

    position = Column(
        String(255),
        nullable=True
    )

    job_description = Column(
        Text,
        nullable=True
    )

    # ---------------------------------------------------------
    # AI SCREENING SCORES
    # ---------------------------------------------------------

    final_score = Column(
        Float,
        nullable=True
    )

    semantic_score = Column(
        Float,
        nullable=True
    )

    skill_score = Column(
        Float,
        nullable=True
    )

    experience_score = Column(
        Float,
        nullable=True
    )

    education_score = Column(
        Float,
        nullable=True
    )

    project_score = Column(
        Float,
        nullable=True
    )

    # ---------------------------------------------------------
    # CANDIDATE SKILLS
    # ---------------------------------------------------------

    skills = Column(
        Text,
        nullable=True
    )

    # ---------------------------------------------------------
    # PROJECTS
    # ---------------------------------------------------------

    projects = Column(
        Text,
        nullable=True
    )

    # ---------------------------------------------------------
    # CERTIFICATIONS
    # ---------------------------------------------------------

    certifications = Column(
        Text,
        nullable=True
    )

    # ---------------------------------------------------------
    # SCREENING STATUS
    # ---------------------------------------------------------

    status = Column(
        String(100),
        nullable=True
    )

    # ---------------------------------------------------------
    # PIPELINE STAGE
    # ---------------------------------------------------------

    pipeline_stage = Column(
        String(100),
        nullable=True,
        default="Screening"
    )

    # ---------------------------------------------------------
    # RESUME FILE
    # ---------------------------------------------------------

    resume_filename = Column(
        String(255),
        nullable=True
    )

    # ---------------------------------------------------------
    # CREATED DATE
    # ---------------------------------------------------------

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )