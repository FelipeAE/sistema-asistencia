"""
Script para inicializar la base de datos
"""
import sys
from pathlib import Path

# Añadir el directorio backend al path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.database import engine, Base
from app.models import (
    Employee, Guest, AttendanceRecord, DailyMenu, 
    Recipe, MealSchedule, AdminUser, AuditLog
)


def init_db():
    """Inicializar todas las tablas en la base de datos"""
    print("[*] Inicializando base de datos...")

    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)

    print("[OK] Base de datos inicializada correctamente")
    print("[INFO] Tablas creadas:")
    print("   - employees")
    print("   - guests")
    print("   - attendance_records")
    print("   - daily_menus")
    print("   - recipes")
    print("   - meal_schedules")
    print("   - admin_users")
    print("   - audit_log")


if __name__ == "__main__":
    init_db()
