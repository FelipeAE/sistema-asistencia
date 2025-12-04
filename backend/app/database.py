"""
Configuración de la base de datos
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Motor de base de datos
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # Necesario para SQLite
    echo=True if settings.ENVIRONMENT == "development" else False
)

# Sesión de base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para modelos
Base = declarative_base()


def get_db():
    """
    Generador de sesiones de base de datos para FastAPI dependency injection
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
