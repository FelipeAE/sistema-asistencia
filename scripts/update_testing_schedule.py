import sqlite3

db_path = r'C:\Users\fiae\sistema-asistencia\backend\data\asistencia.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Actualizar horario de testing: 21:00 a 06:00 (cruza medianoche)
# Cuando hora_inicio > hora_fin, la lógica de validación lo interpreta como cruce de medianoche
cursor.execute("""
    UPDATE meal_schedules
    SET hora_inicio = '21:00:00', hora_fin = '06:00:00'
    WHERE tipo_comida = 'testing'
""")

conn.commit()
print("[OK] Horario de testing actualizado: 21:00 a 06:00")

conn.close()
