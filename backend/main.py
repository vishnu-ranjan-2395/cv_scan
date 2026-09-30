from pathlib import Path
import shutil
import uuid
import os
import re

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    Form,
    Depends,
)

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from typing import List, Dict, Any

from sqlalchemy.orm import Session
from sqlalchemy import inspect, text

from backend.database import engine, Base, get_db
from backend.models.candidate import Candidate

from backend.services.resume_parser import extract_text

from backend.services.resume_information import (
    extract_resume_information
)

from backend.services.job_parser import (
    extract_job_information
)

from backend.services.semantic_matcher import (
    SemanticMatcher
)

from backend.services.candidate_scorer import (
    CandidateScorer
)

from backend.services.candidate_ranker import (
    CandidateRanker
)

from backend.services.screening_service import (
    ScreeningService
)

# ============================================================
# JOB ROLE RECOMMENDATION
# ============================================================

from backend.services.job_recommender import (
    JobRoleRecommender
)


# ============================================================
# APPLICATION CONFIGURATION
# ============================================================

app = FastAPI(
    title="CV Scan",
    description=(
        "AI-Powered Multimodal Resume Screening "
        "and Explainable Candidate Ranking System"
    ),
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# PATH CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

RESUME_DIR = (
    BASE_DIR /
    "data" /
    "resumes"
)

JOB_DESCRIPTION_DIR = (
    BASE_DIR /
    "data" /
    "job_descriptions"
)

PROCESSED_DIR = (
    BASE_DIR /
    "data" /
    "processed"
)


RESUME_DIR.mkdir(
    parents=True,
    exist_ok=True
)

JOB_DESCRIPTION_DIR.mkdir(
    parents=True,
    exist_ok=True
)

PROCESSED_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# FILE CONFIGURATION
# ============================================================

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".jpg",
    ".jpeg",
    ".png"
}


# ============================================================
# PIPELINE CONFIGURATION
# ============================================================

PIPELINE_STAGES = [
    "Applied",
    "Screening",
    "Reviewed",
    "Shortlisted",
    "Rejected"
]


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

Base.metadata.create_all(
    bind=engine
)


# ============================================================
# DATABASE MIGRATION
# ============================================================

def migrate_database():
    """
    Adds newly introduced columns to the existing SQLite
    database without deleting existing candidate records.
    """

    inspector = inspect(engine)

    try:

        existing_columns = {
            column["name"]
            for column in inspector.get_columns(
                "candidates"
            )
        }

    except Exception:

        return

    required_columns = {
        "pipeline_stage": "VARCHAR(100)",
        "projects": "TEXT",
        "certifications": "TEXT",
    }

    missing_columns = []

    for column_name, column_type in required_columns.items():

        if column_name not in existing_columns:

            missing_columns.append(
                (
                    column_name,
                    column_type
                )
            )

    if not missing_columns:

        return

    with engine.begin() as connection:

        for column_name, column_type in missing_columns:

            connection.execute(
                text(
                    f"""
                    ALTER TABLE candidates
                    ADD COLUMN {column_name}
                    {column_type}
                    """
                )
            )


migrate_database()


# ============================================================
# JOB ROLE RECOMMENDER
# ============================================================

# The model is loaded lazily.

# This prevents the Sentence-BERT model from being loaded
# every time main.py is imported.

job_role_recommender = None


def get_job_role_recommender():

    global job_role_recommender

    if job_role_recommender is None:

        job_role_recommender = (
            JobRoleRecommender()
        )

    return job_role_recommender


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_extension(filename: str) -> str:

    return Path(filename).suffix.lower()


def validate_resume_extension(filename: str):

    extension = get_extension(filename)

    if extension not in ALLOWED_EXTENSIONS:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Use PDF, DOC, DOCX, JPG, JPEG or PNG."
            )
        )

    return extension


def calculate_status(
    final_score: float
) -> str:

    if final_score >= 80:

        return "High Match"

    if final_score >= 60:

        return "Reviewed"

    return "Screened"


def clean_optional_text(value):

    if value is None:

        return ""

    return str(value).strip()


# ============================================================
# CANDIDATE NAME VALIDATION
# ============================================================

INVALID_NAME_VALUES = {
    "resume", "curriculum vitae", "cv", "profile",
    "profile summary", "professional summary", "summary",
    "objective", "career objective", "about me",
    "key strengths", "skills", "technical skills",
    "education", "educational qualification",
    "educational qualifications", "academic background",
    "experience", "work experience", "professional experience",
    "employment history", "projects", "academic projects",
    "personal projects", "certifications", "certificates",
    "achievements", "contact", "contact details",
    "personal details", "references", "declaration",
    "languages", "hobbies", "interests"
}

INVALID_NAME_PHRASES = {
    "quick learner", "problem solver", "team player", "hard worker",
    "machine learning", "artificial intelligence", "computer science",
    "software developer", "data scientist", "web developer",
    "full stack developer", "engineering student"
}

def validate_candidate_name(name):
    if not name:
        return ""
    name = re.sub(r"\s+", " ", str(name).strip())
    normalized = name.lower()
    if normalized in INVALID_NAME_VALUES or normalized in INVALID_NAME_PHRASES:
        return ""
    if len(name) < 3 or len(name) > 60 or "@" in name:
        return ""
    if any(x in normalized for x in ("http://", "https://", "www.", "linkedin.com", "github.com")):
        return ""
    if re.search(r"\d{7,}", name) or not re.search(r"[A-Za-z]", name):
        return ""
    if not re.fullmatch(r"[A-Za-z][A-Za-z.\-'\s]{1,59}", name):
        return ""
    words = name.split()
    if len(words) < 2 or len(words) > 5:
        return ""
    if normalized in INVALID_NAME_PHRASES:
        return ""
    return name

def extract_candidate_name_from_text(text):
    if not text:
        return ""
    lines = []
    for raw_line in text.splitlines():
        line = re.sub(r"\s+", " ", raw_line.strip()).strip(" :-|•·_+=#*")
        if line:
            lines.append(line)
    if not lines:
        return ""
    # Names are normally near the top of a CV.
    for line in lines[:20]:
        candidate = validate_candidate_name(line)
        if candidate and 2 <= len(candidate.split()) <= 4:
            return candidate
    # Secondary check with spaCy.
    try:
        import spacy
        nlp_name = spacy.load("en_core_web_sm")
        doc = nlp_name(text)
        for entity in doc.ents:
            if entity.label_ == "PERSON":
                candidate = validate_candidate_name(entity.text)
                if candidate:
                    return candidate
    except Exception:
        pass
    # Final safe fallback: never blindly use the first line.
    for line in lines:
        candidate = validate_candidate_name(line)
        if candidate:
            return candidate
    return ""


def skills_to_string(skills):

    if not skills:

        return ""

    return ", ".join(
        sorted(
            set(
                str(skill).strip()
                for skill in skills
                if str(skill).strip()
            )
        )
    )


def skills_to_list(skills_text):

    if not skills_text:

        return []

    return [
        skill.strip()
        for skill in skills_text.split(",")
        if skill.strip()
    ]


def serialize_candidate(candidate):

    return {

        "id": candidate.id,

        "name": candidate.name,

        "email": candidate.email,

        "phone": candidate.phone,

        "position": candidate.position,

        "job_description": (
            candidate.job_description
        ),

        "final_score": candidate.final_score,

        "semantic_score": (
            candidate.semantic_score
        ),

        "skill_score": (
            candidate.skill_score
        ),

        "experience_score": (
            candidate.experience_score
        ),

        "education_score": (
            candidate.education_score
        ),

        "project_score": (
            candidate.project_score
        ),

        "skills": skills_to_list(
            candidate.skills
        ),

        "projects": (
            candidate.projects or ""
        ),

        "certifications": (
            candidate.certifications or ""
        ),

        "status": candidate.status,

        "pipeline_stage": (
            candidate.pipeline_stage
            or "Screening"
        ),

        "resume_filename": (
            candidate.resume_filename
        ),

        "created_at": (
            candidate.created_at.isoformat()
            if candidate.created_at
            else None
        ),
    }


# ============================================================
# ROOT API
# ============================================================

@app.get("/")
def home():

    return {

        "project": "CV Scan",

        "message": (
            "CV Scan AI Resume Screening "
            "System is running!"
        ),

        "status": "online"
    }


# ============================================================
# HEALTH API
# ============================================================

@app.get("/health")
def health_check():

    return {

        "status": "healthy",

        "ai_engine": "online"
    }


# ============================================================
# UPLOAD RESUME
# ============================================================

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...)
):

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    original_name = file.filename

    extension = validate_resume_extension(
        original_name
    )

    unique_name = (
        f"{uuid.uuid4().hex}{extension}"
    )

    save_path = (
        RESUME_DIR /
        unique_name
    )

    try:

        with save_path.open("wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Unable to save resume: {error}"
            )
        )

    return {

        "success": True,

        "message": (
            "Resume uploaded successfully."
        ),

        "original_filename": original_name,

        "saved_filename": unique_name,

        "file_path": str(save_path)
    }


# ============================================================
# RANKING REQUEST MODEL
# ============================================================

class RankingRequest(BaseModel):

    candidates: List[
        Dict[str, Any]
    ]

    job: Dict[str, Any]

    semantic_scores: List[float]


# ============================================================
# RANK CANDIDATES
# ============================================================

@app.post("/rank-candidates")
def rank_candidates(
    request: RankingRequest
):

    if len(
        request.candidates
    ) != len(
        request.semantic_scores
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Number of candidates must match "
                "number of semantic scores."
            )
        )

    ranker = CandidateRanker()

    results = ranker.rank_candidates(
        request.candidates,
        request.job,
        request.semantic_scores
    )

    return {

        "success": True,

        "total_candidates": len(
            results
        ),

        "ranked_candidates": results
    }


# ============================================================
# SCREEN RESUME
# ============================================================

@app.post("/screen-resume")
async def screen_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    db: Session = Depends(get_db)
):

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No resume file selected."
        )

    original_filename = file.filename

    extension = validate_resume_extension(
        original_filename
    )

    if not job_description.strip():

        raise HTTPException(
            status_code=400,
            detail=(
                "Job description cannot be empty."
            )
        )

    temp_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    temp_path = (
        RESUME_DIR /
        temp_filename
    )

    try:

        with temp_path.open("wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        if extension == ".doc":

            raise HTTPException(
                status_code=400,
                detail=(
                    "Legacy .doc files are accepted for upload, "
                    "but direct text extraction is not supported "
                    "by the current parser. Please convert the "
                    ".doc file to .docx or PDF."
                )
            )

        screening_service = (
            ScreeningService()
        )

        screening_result = (
            screening_service.screen_resume(
                temp_path,
                job_description
            )
        )

        candidate_data = (
            screening_result["candidate"]
        )

        job_data = (
            screening_result["job"]
        )

        score_data = (
            screening_result["score"]
        )

        # Re-detect and validate the applicant name from the actual
        # extracted resume text before storing it in the database.
        extracted_resume_text = ""
        try:
            extracted_resume_text = extract_text(temp_path)
        except Exception:
            extracted_resume_text = ""

        candidate_name = extract_candidate_name_from_text(
            extracted_resume_text
        )

        # Safe fallback to the service-extracted name.
        if not candidate_name:
            candidate_name = validate_candidate_name(
                candidate_data.get("name")
            )

        candidate_email = clean_optional_text(
            candidate_data.get("email")
        )

        candidate_phone = clean_optional_text(
            candidate_data.get("phone")
        )

        candidate_skills = (
            candidate_data.get(
                "skills",
                []
            )
        )

        candidate_projects = (
            candidate_data.get(
                "projects",
                ""
            )
        )

        candidate_certifications = (
            candidate_data.get(
                "certifications",
                ""
            )
        )

        job_title = clean_optional_text(
            job_data.get("job_title")
        )

        final_score = float(
            score_data.get(
                "final_score",
                0
            )
        )

        semantic_score = float(
            score_data.get(
                "semantic_score",
                0
            )
        )

        skill_score = float(
            score_data.get(
                "skill_score",
                0
            )
        )

        experience_score = float(
            score_data.get(
                "experience_score",
                0
            )
        )

        education_score = float(
            score_data.get(
                "education_score",
                0
            )
        )

        project_score = float(
            score_data.get(
                "project_score",
                0
            )
        )

        status = calculate_status(
            final_score
        )

        candidate_record = Candidate(

            name=(
                candidate_name
                if candidate_name
                else "Unknown Candidate"
            ),

            email=(
                candidate_email
                if candidate_email
                else None
            ),

            phone=(
                candidate_phone
                if candidate_phone
                else None
            ),

            position=(
                job_title
                if job_title
                else "Unknown Position"
            ),

            job_description=(
                job_description
            ),

            final_score=final_score,

            semantic_score=semantic_score,

            skill_score=skill_score,

            experience_score=experience_score,

            education_score=education_score,

            project_score=project_score,

            skills=skills_to_string(
                candidate_skills
            ),

            projects=(
                candidate_projects
                if candidate_projects
                else ""
            ),

            certifications=(
                candidate_certifications
                if candidate_certifications
                else ""
            ),

            status=status,

            pipeline_stage="Screening",

            resume_filename=(
                original_filename
            )
        )

        db.add(
            candidate_record
        )

        db.commit()

        db.refresh(
            candidate_record
        )

        return {

            "success": True,

            "message": (
                "Resume screened successfully."
            ),

            "database_id": (
                candidate_record.id
            ),

            "filename": (
                original_filename
            ),

            "candidate": {

                "name": (
                    candidate_record.name
                ),

                "email": (
                    candidate_record.email
                ),

                "phone": (
                    candidate_record.phone
                ),

                "skills": (
                    candidate_skills
                ),

                "projects": (
                    candidate_record.projects
                ),

                "certifications": (
                    candidate_record.certifications
                ),
            },

            "job": {

                "job_title": (
                    job_data.get(
                        "job_title"
                    )
                ),

                "required_skills": (
                    job_data.get(
                        "required_skills",
                        []
                    )
                ),

                "experience_required": (
                    job_data.get(
                        "experience_required"
                    )
                ),
            },

            "score": {

                "final_score": final_score,

                "semantic_score": semantic_score,

                "skill_score": skill_score,

                "experience_score": (
                    experience_score
                ),

                "education_score": (
                    education_score
                ),

                "project_score": (
                    project_score
                ),
            },

            "status": status,

            "pipeline_stage": (
                candidate_record.pipeline_stage
            )
        }

    except HTTPException:

        raise

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                f"Resume screening failed: {error}"
            )
        )

    finally:

        if temp_path.exists():

            try:

                temp_path.unlink()

            except Exception:

                pass


# ============================================================
# GET ALL CANDIDATES
# ============================================================

@app.get("/candidates")
def get_candidates(
    db: Session = Depends(get_db)
):

    candidates = (
        db.query(Candidate)
        .order_by(
            Candidate.created_at.desc()
        )
        .all()
    )

    return {

        "success": True,

        "total_candidates": len(
            candidates
        ),

        "candidates": [

            serialize_candidate(
                candidate
            )

            for candidate in candidates
        ]
    }


# ============================================================
# GET SINGLE CANDIDATE
# ============================================================

@app.get("/candidates/{candidate_id}")
def get_candidate(
    candidate_id: int,
    db: Session = Depends(get_db)
):

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id
        )
        .first()
    )

    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found."
        )

    return {

        "success": True,

        "candidate": (
            serialize_candidate(
                candidate
            )
        )
    }


# ============================================================
# AI JOB ROLE RECOMMENDATION
# ============================================================

@app.get(
    "/recommend-roles/{candidate_id}"
)
def recommend_roles(
    candidate_id: int,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Find candidate
    # --------------------------------------------------------

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id
        )
        .first()
    )

    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found."
        )

    # --------------------------------------------------------
    # Convert database candidate into AI profile
    # --------------------------------------------------------

    candidate_data = {

        "name": (
            candidate.name
            or ""
        ),

        "email": (
            candidate.email
            or ""
        ),

        "phone": (
            candidate.phone
            or ""
        ),

        "skills": (
            skills_to_list(
                candidate.skills
            )
        ),

        "projects": (
            candidate.projects
            or ""
        ),

        "certifications": (
            candidate.certifications
            or ""
        ),

        # These fields are not currently stored
        # separately in the Candidate table.
        #
        # We intentionally leave them empty instead
        # of inventing information.

        "education": "",

        "experience": "",

        "raw_text": ""
    }

    # --------------------------------------------------------
    # Get AI recommender
    # --------------------------------------------------------

    try:

        recommender = (
            get_job_role_recommender()
        )

        recommendation_result = (
            recommender.recommend_roles(
                candidate_data,
                top_n=5
            )
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Job role recommendation failed: "
                f"{error}"
            )
        )

    # --------------------------------------------------------
    # Return recommendation
    # --------------------------------------------------------

    return {

        "success": True,

        "candidate": {

            "id": candidate.id,

            "name": (
                candidate.name
                or "Unknown Candidate"
            ),

            "skills": (
                skills_to_list(
                    candidate.skills
                )
            )
        },

        "total_recommendations": (
            recommendation_result.get(
                "total_recommendations",
                0
            )
        ),

        "recommendations": (
            recommendation_result.get(
                "recommendations",
                []
            )
        )
    }


# ============================================================
# PIPELINE - GET
# ============================================================

@app.get("/pipeline")
def get_pipeline(
    db: Session = Depends(get_db)
):

    candidates = (
        db.query(Candidate)
        .order_by(
            Candidate.created_at.desc()
        )
        .all()
    )

    pipeline = {}

    for stage in PIPELINE_STAGES:

        pipeline[stage] = []

    for candidate in candidates:

        stage = (
            candidate.pipeline_stage
            or "Screening"
        )

        if stage not in pipeline:

            pipeline[stage] = []

        pipeline[stage].append(
            serialize_candidate(
                candidate
            )
        )

    return {

        "success": True,

        "pipeline_stages": (
            PIPELINE_STAGES
        ),

        "pipeline": pipeline
    }


# ============================================================
# PIPELINE STAGE REQUEST
# ============================================================

class PipelineStageRequest(BaseModel):

    pipeline_stage: str


# ============================================================
# UPDATE PIPELINE STAGE
# ============================================================

@app.patch(
    "/candidates/{candidate_id}/pipeline-stage"
)
def update_pipeline_stage(
    candidate_id: int,
    request: PipelineStageRequest,
    db: Session = Depends(get_db)
):

    new_stage = (
        request.pipeline_stage.strip()
    )

    if new_stage not in PIPELINE_STAGES:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid pipeline stage. "
                f"Allowed stages: {PIPELINE_STAGES}"
            )
        )

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id
        )
        .first()
    )

    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found."
        )

    candidate.pipeline_stage = (
        new_stage
    )

    db.commit()

    db.refresh(
        candidate
    )

    return {

        "success": True,

        "message": (
            "Pipeline stage updated successfully."
        ),

        "candidate": (
            serialize_candidate(
                candidate
            )
        )
    }


# ============================================================
# ANALYTICS
# ============================================================

@app.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db)
):

    candidates = (
        db.query(Candidate)
        .order_by(
            Candidate.created_at.desc()
        )
        .all()
    )

    total_candidates = len(
        candidates
    )

    # --------------------------------------------------------
    # Scores
    # --------------------------------------------------------

    scores = []

    for candidate in candidates:

        if candidate.final_score is not None:

            scores.append(
                float(
                    candidate.final_score
                )
            )

    if scores:

        average_score = round(
            sum(scores) /
            len(scores),
            2
        )

        highest_score = round(
            max(scores),
            2
        )

        lowest_score = round(
            min(scores),
            2
        )

    else:

        average_score = 0.0
        highest_score = 0.0
        lowest_score = 0.0

    # --------------------------------------------------------
    # Status counts
    # --------------------------------------------------------

    high_match = sum(

        1

        for candidate in candidates

        if candidate.status ==
        "High Match"
    )

    reviewed = sum(

        1

        for candidate in candidates

        if candidate.status ==
        "Reviewed"
    )

    screened = sum(

        1

        for candidate in candidates

        if candidate.status ==
        "Screened"
    )

    # --------------------------------------------------------
    # Pipeline distribution
    # --------------------------------------------------------

    pipeline_distribution = {}

    for stage in PIPELINE_STAGES:

        pipeline_distribution[
            stage
        ] = 0

    for candidate in candidates:

        stage = (
            candidate.pipeline_stage
            or "Screening"
        )

        if stage not in pipeline_distribution:

            pipeline_distribution[
                stage
            ] = 0

        pipeline_distribution[
            stage
        ] += 1

    # --------------------------------------------------------
    # Score distribution
    # --------------------------------------------------------

    score_distribution = {

        "0-20": 0,

        "21-40": 0,

        "41-60": 0,

        "61-80": 0,

        "81-100": 0
    }

    for score in scores:

        if score <= 20:

            score_distribution[
                "0-20"
            ] += 1

        elif score <= 40:

            score_distribution[
                "21-40"
            ] += 1

        elif score <= 60:

            score_distribution[
                "41-60"
            ] += 1

        elif score <= 80:

            score_distribution[
                "61-80"
            ] += 1

        else:

            score_distribution[
                "81-100"
            ] += 1

    # --------------------------------------------------------
    # Top skills
    # --------------------------------------------------------

    skill_counts = {}

    for candidate in candidates:

        candidate_skills = (
            skills_to_list(
                candidate.skills
            )
        )

        for skill in candidate_skills:

            normalized_skill = (
                skill.strip().lower()
            )

            if not normalized_skill:

                continue

            skill_counts[
                normalized_skill
            ] = (
                skill_counts.get(
                    normalized_skill,
                    0
                ) + 1
            )

    top_skills = sorted(

        skill_counts.items(),

        key=lambda item:
        item[1],

        reverse=True

    )[:10]

    top_skills_result = [

        {
            "skill": skill,
            "count": count
        }

        for skill, count
        in top_skills
    ]

    # --------------------------------------------------------
    # Candidate performance
    # --------------------------------------------------------

    candidate_performance = []

    for candidate in candidates:

        candidate_performance.append(

            {

                "id": candidate.id,

                "name": (
                    candidate.name
                    or "Unknown Candidate"
                ),

                "email": candidate.email,

                "position": candidate.position,

                "final_score": (
                    candidate.final_score
                    or 0
                ),

                "semantic_score": (
                    candidate.semantic_score
                    or 0
                ),

                "skill_score": (
                    candidate.skill_score
                    or 0
                ),

                "experience_score": (
                    candidate.experience_score
                    or 0
                ),

                "education_score": (
                    candidate.education_score
                    or 0
                ),

                "project_score": (
                    candidate.project_score
                    or 0
                ),

                "skills": skills_to_list(
                    candidate.skills
                ),

                "projects": (
                    candidate.projects
                    or ""
                ),

                "certifications": (
                    candidate.certifications
                    or ""
                ),

                "status": candidate.status,

                "pipeline_stage": (
                    candidate.pipeline_stage
                    or "Screening"
                ),

                "created_at": (

                    candidate.created_at.isoformat()

                    if candidate.created_at

                    else None
                )
            }
        )

    # --------------------------------------------------------
    # Recent candidates
    # --------------------------------------------------------

    recent_candidates = []

    for candidate in candidates[:10]:

        recent_candidates.append(

            {

                "id": candidate.id,

                "name": (
                    candidate.name
                    or "Unknown Candidate"
                ),

                "position": (
                    candidate.position
                    or "Unknown Position"
                ),

                "score": (
                    candidate.final_score
                    or 0
                ),

                "status": candidate.status,

                "pipeline_stage": (
                    candidate.pipeline_stage
                    or "Screening"
                ),

                "created_at": (

                    candidate.created_at.isoformat()

                    if candidate.created_at

                    else None
                )
            }
        )

    # --------------------------------------------------------
    # Final analytics response
    # --------------------------------------------------------

    return {

        "success": True,

        "total_candidates": (
            total_candidates
        ),

        "average_score": (
            average_score
        ),

        "highest_score": (
            highest_score
        ),

        "lowest_score": (
            lowest_score
        ),

        "high_match": (
            high_match
        ),

        "reviewed": (
            reviewed
        ),

        "screened": (
            screened
        ),

        "pipeline_distribution": (
            pipeline_distribution
        ),

        "score_distribution": (
            score_distribution
        ),

        "top_skills": (
            top_skills_result
        ),

        "candidate_performance": (
            candidate_performance
        ),

        "recent_candidates": (
            recent_candidates
        )
    }


# ============================================================
# DELETE CANDIDATE
# ============================================================

@app.delete(
    "/candidates/{candidate_id}"
)
def delete_candidate(
    candidate_id: int,
    db: Session = Depends(get_db)
):

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id
        )
        .first()
    )

    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found."
        )

    db.delete(
        candidate
    )

    db.commit()

    return {

        "success": True,

        "message": (
            "Candidate deleted successfully."
        ),

        "candidate_id": candidate_id
    }


# ============================================================
# APPLICATION STARTUP MESSAGE
# ============================================================

@app.on_event("startup")
async def startup_event():

    print("=" * 60)

    print(
        "CV Scan AI Resume Screening System"
    )

    print("=" * 60)

    print(
        "Backend API: "
        "http://127.0.0.1:8000"
    )

    print(
        "Swagger Docs: "
        "http://127.0.0.1:8000/docs"
    )

    print(
        "Database: SQLite"
    )

    print(
        "AI Screening Engine: Online"
    )

    print(
        "Job Role Recommendation: Online"
    )

    print("=" * 60)