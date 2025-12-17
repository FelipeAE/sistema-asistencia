"""
FastAPI Application - Sistema de Asistencia
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from .config import settings

# Directorio del frontend
frontend_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"

# Crear aplicación FastAPI
app = FastAPI(
    title="Sistema de Asistencia - Casino",
    description="API para registro de asistencia en comedor",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
# En desarrollo permite todos los orígenes para facilitar testing con tunnels
if settings.CORS_ALLOW_ALL:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,  # No se puede usar credentials con "*"
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition"],
    )


# Rutas de la API
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }


# Incluir routers de la API
from .api import employees, attendance, guests, photos, recipes, meal_schedules, menus, auth, dashboard, import_data, reports

app.include_router(employees.router, prefix="/api/employees", tags=["Empleados"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Asistencia"])
app.include_router(guests.router, prefix="/api/guests", tags=["Invitados"])
app.include_router(photos.router, prefix="/api/photos", tags=["Fotos"])
app.include_router(recipes.router, prefix="/api/recipes", tags=["Recetas"])
app.include_router(meal_schedules.router, prefix="/api/meal-schedules", tags=["Horarios"])
app.include_router(menus.router, prefix="/api/menus", tags=["Menús"])
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(import_data.router, prefix="/api/import", tags=["Importación"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reportes"])

# Servir fotos estáticas
app.mount("/photos", StaticFiles(directory=str(settings.PHOTOS_DIR)), name="photos")

# Servir archivos estáticos del frontend (assets)
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")


# Ruta raíz - sirve el index.html
@app.get("/")
async def serve_index():
    """Sirve la página principal del frontend"""
    if frontend_dist.exists():
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
    return {"message": "Frontend not built. Run 'npm run build' in frontend/"}


# Rutas específicas del frontend SPA (no captura /api/)
@app.get("/login")
@app.get("/recipes")
@app.get("/admin")
@app.get("/admin/{rest:path}")
async def serve_spa_routes(request: Request):
    """Sirve index.html para rutas del SPA"""
    if frontend_dist.exists():
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
    return {"message": "Frontend not built. Run 'npm run build' in frontend/"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )
