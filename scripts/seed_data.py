"""
Script para poblar la base de datos con datos de ejemplo
"""
import sys
from pathlib import Path
from datetime import datetime, date, time

# Añadir el directorio backend al path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.database import SessionLocal
from app.models import Employee, MealSchedule


def seed_data():
    """Poblar la base de datos con datos de ejemplo"""
    print("[*] Poblando base de datos con datos de ejemplo...")
    
    db = SessionLocal()
    
    try:
        # Crear horarios de comida
        schedules = [
            MealSchedule(
                tipo_comida="desayuno",
                hora_inicio=time(7, 0),
                hora_fin=time(9, 30),
                dias_semana='["lunes", "martes", "miercoles", "jueves", "viernes"]',
                activo=True,
                permite_excepciones=True
            ),
            MealSchedule(
                tipo_comida="almuerzo",
                hora_inicio=time(12, 0),
                hora_fin=time(14, 30),
                dias_semana='["lunes", "martes", "miercoles", "jueves", "viernes"]',
                activo=True,
                permite_excepciones=True
            ),
            MealSchedule(
                tipo_comida="cena",
                hora_inicio=time(19, 0),
                hora_fin=time(21, 0),
                dias_semana='["lunes", "martes", "miercoles", "jueves", "viernes"]',
                activo=True,
                permite_excepciones=True
            ),
        ]
        
        for schedule in schedules:
            existing = db.query(MealSchedule).filter(
                MealSchedule.tipo_comida == schedule.tipo_comida
            ).first()
            if not existing:
                db.add(schedule)
        
        # Crear empleados de ejemplo
        employees = [
            Employee(
                rut="12345678-9",
                nombre="Juan Pérez",
                email="juan.perez@empresa.cl",
                telefono="+56912345678",
                departamento="Administración",
                cargo="Gerente",
                activo=True
            ),
            Employee(
                rut="98765432-1",
                nombre="María González",
                email="maria.gonzalez@empresa.cl",
                telefono="+56987654321",
                departamento="Operaciones",
                cargo="Supervisor",
                restricciones_alimentarias="Vegetariana",
                activo=True
            ),
            Employee(
                rut="11222333-4",
                nombre="Pedro Silva",
                email="pedro.silva@empresa.cl",
                telefono="+56911223344",
                departamento="Mantención",
                cargo="Técnico",
                restricciones_alimentarias="Celíaco",
                activo=True
            ),
        ]
        
        for employee in employees:
            existing = db.query(Employee).filter(Employee.rut == employee.rut).first()
            if not existing:
                db.add(employee)
        
        db.commit()

        print("[OK] Datos de ejemplo creados correctamente")
        print("   - 3 horarios de comida")
        print("   - 3 empleados de ejemplo")

    except Exception as e:
        print(f"[ERROR] Error al crear datos de ejemplo: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
