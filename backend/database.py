from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from pathlib import Path


# =========================================
# CV SCAN DATABASE CONFIGURATION
# =========================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_PATH = BASE_DIR / "cv_scan.db"

DATABASE_URL = (
    f"sqlite:///{DATABASE_PATH}"
)


# =========================================
# DATABASE ENGINE
# =========================================

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    }
)


# =========================================
# DATABASE SESSION
# =========================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# =========================================
# BASE MODEL
# =========================================

Base = declarative_base()


# =========================================
# DATABASE SESSION DEPENDENCY
# =========================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()