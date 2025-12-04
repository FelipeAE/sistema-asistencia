"""
Script para agregar columnas de menú a la tabla daily_menus
"""
import sqlite3
from pathlib import Path

# Ruta a la base de datos (en backend/data/)
DB_PATH = Path(__file__).parent.parent / "backend" / "data" / "asistencia.db"

def migrate():
    print(f"Conectando a: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Verificar columnas existentes
    cursor.execute("PRAGMA table_info(daily_menus)")
    existing_columns = [col[1] for col in cursor.fetchall()]
    print(f"Columnas existentes: {existing_columns}")
    
    # Nuevas columnas a agregar
    new_columns = [
        ("entrada", "VARCHAR(200)"),
        ("plato_principal", "VARCHAR(200)"),
        ("postre", "VARCHAR(200)"),
        ("ensalada", "VARCHAR(200)"),
        ("bebida", "VARCHAR(200)")
    ]
    
    for col_name, col_type in new_columns:
        if col_name not in existing_columns:
            print(f"Agregando columna: {col_name}")
            cursor.execute(f"ALTER TABLE daily_menus ADD COLUMN {col_name} {col_type}")
        else:
            print(f"Columna ya existe: {col_name}")
    
    conn.commit()
    conn.close()
    print("Migración completada!")

if __name__ == "__main__":
    migrate()
