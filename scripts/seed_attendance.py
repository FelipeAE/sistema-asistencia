"""
Script para generar datos de prueba de asistencias
"""
import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.database import SessionLocal
from app.models.employee import Employee
from app.models.guest import Guest
from app.models.attendance import AttendanceRecord
from datetime import datetime, timedelta, time
import random


def seed_attendance_data():
    """Genera datos de prueba de asistencias"""
    db = SessionLocal()

    try:
        print("Generando datos de asistencias de prueba...")

        # Obtener empleados y invitados existentes
        employees = db.query(Employee).filter(Employee.activo == True).all()
        guests = db.query(Guest).filter(Guest.activo == True).all()

        if not employees:
            print("No hay empleados activos. Por favor ejecuta seed_data.py primero.")
            return

        print(f"Encontrados {len(employees)} empleados y {len(guests)} invitados")

        # Generar asistencias para los últimos 30 días
        tipos_comida = ['desayuno', 'almuerzo', 'cena']
        start_date = datetime.now() - timedelta(days=30)

        attendance_count = 0

        for day in range(30):
            current_date = start_date + timedelta(days=day)

            # Solo días laborales (lunes a viernes)
            if current_date.weekday() >= 5:
                continue

            # Cada empleado tiene 70% de probabilidad de asistir cada día
            for employee in employees:
                if random.random() < 0.7:
                    # Seleccionar 1-2 comidas al azar
                    num_meals = random.randint(1, 2)
                    selected_meals = random.sample(tipos_comida, num_meals)

                    for tipo_comida in selected_meals:
                        # Generar hora según tipo de comida
                        if tipo_comida == 'desayuno':
                            hour = random.randint(7, 9)
                        elif tipo_comida == 'almuerzo':
                            hour = random.randint(12, 14)
                        else:  # cena
                            hour = random.randint(19, 20)

                        minute = random.randint(0, 59)

                        # Crear registro de asistencia
                        attendance = AttendanceRecord(
                            employee_id=employee.id,
                            guest_id=None,
                            fecha=current_date.date(),
                            hora=time(hour, minute, 0),
                            tipo_comida=tipo_comida,
                            es_invitado=False
                        )

                        db.add(attendance)
                        attendance_count += 1

            # Invitados visitan menos frecuentemente (20% de probabilidad por día)
            for guest in guests:
                if random.random() < 0.2:
                    # Usualmente almuerzo
                    tipo_comida = 'almuerzo'
                    hour = random.randint(12, 14)
                    minute = random.randint(0, 59)

                    attendance = AttendanceRecord(
                        employee_id=None,
                        guest_id=guest.id,
                        fecha=current_date.date(),
                        hora=time(hour, minute, 0),
                        tipo_comida=tipo_comida,
                        es_invitado=True
                    )

                    db.add(attendance)
                    attendance_count += 1

        db.commit()
        print(f"Se crearon {attendance_count} registros de asistencia")
        print("Datos de prueba generados correctamente")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_attendance_data()
