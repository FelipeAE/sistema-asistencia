"""
Configuración de pytest
"""
import sys
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models import *  # Importar todos los modelos


# Base de datos de prueba en memoria
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Crea una sesión de base de datos para testing"""
    # Crear las tablas
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
    
    # Limpiar después del test
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Crea un cliente de prueba de FastAPI"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def sample_employee_data():
    """Datos de ejemplo para empleado"""
    return {
        "rut": "12345678-9",
        "nombre": "Juan",
        "apellido": "Pérez",
        "cargo": "Chef",
        "area": "Cocina",
        "email": "juan.perez@test.com",
        "telefono": "+56912345678"
    }


@pytest.fixture
def sample_guest_data():
    """Datos de ejemplo para invitado"""
    return {
        "nombre": "María",
        "apellido": "González",
        "empresa": "Test Corp",
        "region": "Metropolitana",
        "motivo_visita": "Reunión de negocios"
    }
