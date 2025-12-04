"""
Script de inicio del servidor FastAPI
"""
import uvicorn
import sys
from pathlib import Path

# Añadir el directorio app al path
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    from app.config import settings
    
    print(f"🚀 Iniciando servidor en {settings.HOST}:{settings.PORT}")
    print(f"📝 Entorno: {settings.ENVIRONMENT}")
    print(f"💾 Base de datos: {settings.DATABASE_URL}")
    print(f"🌐 Accede a: http://localhost:{settings.PORT}/docs para ver la API")
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )
