"""
Script para crear menús de prueba para 5 días
"""
import sqlite3
from pathlib import Path

# Ruta a la base de datos (en backend/data/)
DB_PATH = Path(__file__).parent.parent / "backend" / "data" / "asistencia.db"

def create_test_menus():
    print(f"Conectando a: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Menús de prueba para 5 días
    menus = [
        # Día 1 - Hoy (2 dic)
        {
            'fecha': '2025-12-02',
            'tipo_comida': 'almuerzo',
            'entrada': 'Sopa de verduras',
            'plato_principal': 'Pollo al horno con papas doradas',
            'ensalada': 'Ensalada mixta',
            'postre': 'Flan de vainilla',
            'bebida': 'Jugo de naranja natural'
        },
        # Día 2 (3 dic)
        {
            'fecha': '2025-12-03',
            'tipo_comida': 'almuerzo',
            'entrada': 'Crema de zapallo',
            'plato_principal': 'Carne mechada con arroz',
            'ensalada': 'Ensalada chilena',
            'postre': 'Fruta de estación',
            'bebida': 'Jugo de manzana'
        },
        # Día 3 (4 dic)
        {
            'fecha': '2025-12-04',
            'tipo_comida': 'almuerzo',
            'entrada': 'Empanadas de queso',
            'plato_principal': 'Pescado frito con puré',
            'ensalada': 'Ensalada de betarraga',
            'postre': 'Arroz con leche',
            'bebida': 'Limonada'
        },
        # Día 4 (5 dic)
        {
            'fecha': '2025-12-05',
            'tipo_comida': 'almuerzo',
            'entrada': 'Sopa de lentejas',
            'plato_principal': 'Pastel de choclo',
            'ensalada': 'Ensalada de tomate',
            'postre': 'Gelatina con fruta',
            'bebida': 'Jugo de piña'
        },
        # Día 5 (6 dic)
        {
            'fecha': '2025-12-06',
            'tipo_comida': 'almuerzo',
            'entrada': 'Consomé de ave',
            'plato_principal': 'Albóndigas en salsa con tallarines',
            'ensalada': 'Ensalada de repollo',
            'postre': 'Torta de mil hojas',
            'bebida': 'Jugo de durazno'
        }
    ]
    
    # Eliminar menús existentes para estas fechas
    fechas = [m['fecha'] for m in menus]
    placeholders = ','.join(['?' for _ in fechas])
    cursor.execute(f'DELETE FROM daily_menus WHERE fecha IN ({placeholders})', fechas)
    print(f"Eliminados menús anteriores para fechas: {fechas}")
    
    # Insertar nuevos menús
    for menu in menus:
        cursor.execute('''
            INSERT INTO daily_menus (fecha, tipo_comida, entrada, plato_principal, ensalada, postre, bebida, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        ''', (menu['fecha'], menu['tipo_comida'], menu['entrada'], menu['plato_principal'], 
              menu['ensalada'], menu['postre'], menu['bebida']))
        print(f"✅ Menú creado para {menu['fecha']}: {menu['plato_principal']}")
    
    conn.commit()
    conn.close()
    print("\n¡5 menús de prueba creados exitosamente!")

if __name__ == "__main__":
    create_test_menus()
