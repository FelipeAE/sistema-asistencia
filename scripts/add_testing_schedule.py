"""
Script para agregar horario de testing (21:00 - 23:59)
"""
import sys
from pathlib import Path
from datetime import time

# Añadir el directorio backend al path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.database import SessionLocal
from app.models import MealSchedule


def add_testing_schedule():
    """Agregar horario de testing después de la cena"""
    print("[*] Agregando horario de testing...")

    db = SessionLocal()

    try:
        # Verificar si ya existe
        existing = db.query(MealSchedule).filter(
            MealSchedule.tipo_comida == "testing"
        ).first()

        if existing:
            print("[!] El horario de testing ya existe")
            print(f"    Horario: {existing.hora_inicio} - {existing.hora_fin}")
            return

        # Crear horario de testing (21:00 - 23:59)
        testing_schedule = MealSchedule(
            tipo_comida="testing",
            hora_inicio=time(21, 0),
            hora_fin=time(23, 59),
            dias_semana='["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]',
            activo=True,
            permite_excepciones=True
        )

        db.add(testing_schedule)
        db.commit()

        print("[OK] Horario de testing creado correctamente")
        print("    Tipo: testing")
        print("    Horario: 21:00 - 23:59")
        print("    Días: Todos los días")
        print("")
        print("[!] Ahora puedes registrar asistencia tipo 'testing' después de las 9 PM")

    except Exception as e:
        print(f"[ERROR] Error al crear horario de testing: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    add_testing_schedule()
