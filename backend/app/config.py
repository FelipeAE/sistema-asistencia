"""
Configuración de la aplicación
"""
import os
import secrets
from pathlib import Path
from pydantic_settings import BaseSettings

# Directorio base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# Generar SECRET_KEY segura (se mantiene mientras el servidor esté activo)
_DEFAULT_SECRET = secrets.token_hex(32)


class Settings(BaseSettings):
    """Configuración de la aplicación"""

    # Base de datos
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/data/asistencia.db"

    # Seguridad (usa variable de entorno o genera una automáticamente)
    SECRET_KEY: str = os.getenv("SECRET_KEY", _DEFAULT_SECRET)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 horas
    
    # Servidor
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    
    # Directorios
    UPLOAD_DIR: Path = BASE_DIR / "data" / "uploads"
    PHOTOS_DIR: Path = BASE_DIR / "data" / "photos"
    EXPORTS_DIR: Path = BASE_DIR / "data" / "exports"
    BACKUPS_DIR: Path = BASE_DIR / "data" / "backups"
    
    # CORS - Incluye localhost y VS Code Dev Tunnels
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        # VS Code Dev Tunnels (permite cualquier subdominio)
        "https://*.devtunnels.ms",
    ]
    # Para desarrollo: permitir todos los orígenes
    CORS_ALLOW_ALL: bool = os.getenv("CORS_ALLOW_ALL", "true").lower() == "true"
    
    class Config:
        env_file = BASE_DIR / ".env"
        case_sensitive = True


# Instancia de configuración
settings = Settings()

# Crear directorios si no existen
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.PHOTOS_DIR.mkdir(parents=True, exist_ok=True)
settings.EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
settings.BACKUPS_DIR.mkdir(parents=True, exist_ok=True)
