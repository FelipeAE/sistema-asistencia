"""
Script para generar datos de prueba de menús
"""
import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.database import SessionLocal
from app.models.menu import DailyMenu
from datetime import datetime, timedelta


def seed_menus_data():
    """Genera datos de prueba de menús"""
    db = SessionLocal()

    try:
        print("Generando datos de menus de prueba...")

        # Menús de ejemplo
        menus_data = [
            # Hoy
            {
                'fecha': datetime.now().date(),
                'tipo_comida': 'desayuno',
                'descripcion': 'Pan con mantequilla\nCafé o té\nJugo de naranja\nFruta fresca',
                'opciones_dieteticas': 'Pan integral disponible, Leche sin lactosa'
            },
            {
                'fecha': datetime.now().date(),
                'tipo_comida': 'almuerzo',
                'descripcion': 'Entrada: Ensalada chilena\nPlato principal: Pollo al horno con puré\nPostre: Flan\nBebida: Jugo o agua',
                'opciones_dieteticas': 'Opción vegetariana: Tortilla de verduras'
            },
            {
                'fecha': datetime.now().date(),
                'tipo_comida': 'cena',
                'descripcion': 'Sopa de verduras\nSándwich de pavo y queso\nYogurt\nTé o café',
                'opciones_dieteticas': 'Sin gluten disponible'
            },

            # Mañana
            {
                'fecha': (datetime.now() + timedelta(days=1)).date(),
                'tipo_comida': 'desayuno',
                'descripcion': 'Cereales con leche\nPan tostado con mermelada\nYogurt\nCafé o té',
                'opciones_dieteticas': 'Leche de almendras disponible'
            },
            {
                'fecha': (datetime.now() + timedelta(days=1)).date(),
                'tipo_comida': 'almuerzo',
                'descripcion': 'Entrada: Sopa de lentejas\nPlato principal: Carne mechada con arroz\nPostre: Ensalada de frutas\nBebida: Limonada',
                'opciones_dieteticas': 'Opción vegetariana: Guiso de legumbres'
            },
            {
                'fecha': (datetime.now() + timedelta(days=1)).date(),
                'tipo_comida': 'cena',
                'descripcion': 'Ensalada verde\nPizza casera\nFruta\nAgua o jugo',
                'opciones_dieteticas': 'Pizza vegetariana disponible'
            },

            # Pasado mañana
            {
                'fecha': (datetime.now() + timedelta(days=2)).date(),
                'tipo_comida': 'desayuno',
                'descripcion': 'Huevos revueltos\nPan amasado\nPalta\nCafé con leche',
                'opciones_dieteticas': 'Huevos duros disponibles'
            },
            {
                'fecha': (datetime.now() + timedelta(days=2)).date(),
                'tipo_comida': 'almuerzo',
                'descripcion': 'Entrada: Ensalada mixta\nPlato principal: Pescado al vapor con papas\nPostre: Gelatina\nBebida: Agua mineral',
                'opciones_dieteticas': 'Bajo en sodio disponible'
            },
            {
                'fecha': (datetime.now() + timedelta(days=2)).date(),
                'tipo_comida': 'cena',
                'descripcion': 'Crema de zapallo\nEmpanadas de queso\nCompota de manzana\nTé',
                'opciones_dieteticas': 'Empanadas al horno disponibles'
            },

            # Hace 1 semana (para tener histórico)
            {
                'fecha': (datetime.now() - timedelta(days=7)).date(),
                'tipo_comida': 'almuerzo',
                'descripcion': 'Entrada: Ensalada césar\nPlato principal: Pastel de choclo\nPostre: Fruta\nBebida: Agua',
                'opciones_dieteticas': 'Opción sin carne disponible'
            },
        ]

        created_count = 0

        for menu_info in menus_data:
            # Verificar si ya existe
            existing = db.query(DailyMenu).filter(
                DailyMenu.fecha == menu_info['fecha'],
                DailyMenu.tipo_comida == menu_info['tipo_comida']
            ).first()

            if existing:
                print(f"Menu ya existe para {menu_info['fecha']} - {menu_info['tipo_comida']}")
                continue

            menu = DailyMenu(
                fecha=menu_info['fecha'],
                tipo_comida=menu_info['tipo_comida'],
                descripcion=menu_info['descripcion'],
                opciones_dieteticas=menu_info.get('opciones_dieteticas'),
                activo=True
            )

            db.add(menu)
            created_count += 1

        db.commit()
        print(f"Se crearon {created_count} menus de prueba")
        print("Datos de prueba generados correctamente")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_menus_data()
