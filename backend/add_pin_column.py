"""
Script para agregar la columna PIN a la tabla employees y configurar el PIN del tester
"""
import sqlite3
from pathlib import Path

# Ruta a la base de datos
DB_PATH = Path(__file__).parent / "data" / "asistencia.db"

def main():
    print(f"Conectando a: {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Verificar si la columna PIN ya existe
    cursor.execute("PRAGMA table_info(employees)")
    columns = [col[1] for col in cursor.fetchall()]

    if 'pin' not in columns:
        print("Agregando columna 'pin' a la tabla employees...")
        cursor.execute("ALTER TABLE employees ADD COLUMN pin VARCHAR(4)")
        conn.commit()
        print("Columna 'pin' agregada exitosamente!")
    else:
        print("La columna 'pin' ya existe.")

    # Actualizar el PIN del empleado tester (RUT: 19478868-1, PIN: 1345)
    rut_tester = "19.478.868-1"
    pin_tester = "1345"

    # Buscar el empleado con diferentes formatos de RUT
    cursor.execute("""
        UPDATE employees
        SET pin = ?
        WHERE rut = ? OR rut = ? OR rut = ?
    """, (pin_tester, rut_tester, "19478868-1", "194788681"))

    if cursor.rowcount > 0:
        print(f"PIN '{pin_tester}' asignado al empleado con RUT {rut_tester}")
    else:
        print(f"No se encontró empleado con RUT {rut_tester}")
        # Listar empleados para verificar
        cursor.execute("SELECT id, rut, nombre FROM employees LIMIT 10")
        print("\nEmpleados en la base de datos:")
        for row in cursor.fetchall():
            print(f"  ID: {row[0]}, RUT: {row[1]}, Nombre: {row[2]}")

    conn.commit()
    conn.close()
    print("\nProceso completado!")

if __name__ == "__main__":
    main()
