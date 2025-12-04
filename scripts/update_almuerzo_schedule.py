"""
Script para actualizar el horario del almuerzo a 1pm - 3pm
"""
import sys
from pathlib import Path
from datetime import time

# Agregar el directorio backend al path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.database import SessionLocal
from app.models.meal_schedule import MealSchedule

def update_almuerzo_schedule():
    db = SessionLocal()
    try:
        # Buscar el horario de almuerzo
        almuerzo = db.query(MealSchedule).filter(
            MealSchedule.tipo_comida == 'almuerzo'
        ).first()

        if almuerzo:
            almuerzo.hora_inicio = time(13, 0, 0)  # 1:00 PM
            almuerzo.hora_fin = time(15, 0, 0)     # 3:00 PM
            db.commit()
            print("[OK] Horario de almuerzo actualizado: 13:00 - 15:00")
        else:
            print("[INFO] No se encontro horario de almuerzo configurado")

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_almuerzo_schedule()
