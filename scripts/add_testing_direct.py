import sqlite3

db_path = r'C:\Users\fiae\sistema-asistencia\backend\data\asistencia.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Verificar si ya existe
cursor.execute("SELECT * FROM meal_schedules WHERE tipo_comida = 'testing'")
if cursor.fetchone():
    print("[!] El horario de testing ya existe")
else:
    cursor.execute("""
        INSERT INTO meal_schedules (tipo_comida, hora_inicio, hora_fin, dias_semana, activo, permite_excepciones)
        VALUES ('testing', '21:00:00', '23:59:00', '["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]', 1, 1)
    """)
    conn.commit()
    print("[OK] Horario de testing creado: 21:00 - 23:59 (todos los dias)")

conn.close()
