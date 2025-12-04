"""
Script para agregar recetas de ejemplo
"""
import sys
from pathlib import Path

# Agregar el directorio backend al path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.recipe import Recipe
from app.models.menu import DailyMenu
import json
from datetime import date, timedelta


def seed_recipes():
    """Agregar recetas de ejemplo"""
    db = SessionLocal()
    
    try:
        # Verificar si ya hay recetas
        existing = db.query(Recipe).first()
        if existing:
            print("Ya existen recetas en la base de datos")
            return
        
        # Recetas chilenas de ejemplo
        recipes = [
            Recipe(
                nombre="Completos Italianos",
                descripcion="Clasicos completos con palta, tomate y mayonesa",
                ingredientes=json.dumps([
                    "8 vienesas",
                    "8 panes de completo",
                    "2 paltas maduras",
                    "3 tomates",
                    "Mayonesa",
                    "Mostaza (opcional)",
                    "Ketchup (opcional)"
                ]),
                preparacion="1. Calentar las vienesas en agua hirviendo por 5 minutos\n2. Cortar los tomates en rodajas finas\n3. Hacer pure de palta con un tenedor\n4. Calentar los panes\n5. Colocar la vienesa en el pan\n6. Agregar palta, tomate y mayonesa\n7. Servir inmediatamente",
                tiempo_preparacion=15,
                porciones=8,
                alergenos=json.dumps(["gluten", "huevo"]),
                categoria="principal",
                activo=True
            ),
            Recipe(
                nombre="Cazuela de Vacuno",
                descripcion="Cazuela tradicional chilena con verduras",
                ingredientes=json.dumps([
                    "1 kg carne de vacuno",
                    "4 papas",
                    "2 choclos",
                    "2 zanahorias",
                    "1 zapallo",
                    "Cilantro fresco",
                    "Sal y pimienta",
                    "2 litros de agua"
                ]),
                preparacion="1. Hervir la carne en agua con sal por 45 minutos\n2. Agregar las papas cortadas en cuartos\n3. Anadir zanahoria y zapallo en trozos\n4. Agregar el choclo cortado en rodajas\n5. Cocinar por 30 minutos mas\n6. Sazonar con sal, pimienta y cilantro\n7. Servir caliente",
                tiempo_preparacion=90,
                porciones=4,
                alergenos=json.dumps([]),
                categoria="principal",
                activo=True
            ),
            Recipe(
                nombre="Ensalada Chilena",
                descripcion="Ensalada fresca de tomate y cebolla",
                ingredientes=json.dumps([
                    "4 tomates grandes",
                    "2 cebollas moradas",
                    "Cilantro fresco",
                    "Aceite de oliva",
                    "Vinagre",
                    "Sal"
                ]),
                preparacion="1. Cortar los tomates en gajos\n2. Cortar la cebolla en pluma fina\n3. Mezclar en un bowl\n4. Agregar cilantro picado\n5. Aliñar con aceite, vinagre y sal\n6. Dejar reposar 10 minutos antes de servir",
                tiempo_preparacion=15,
                porciones=4,
                alergenos=json.dumps([]),
                categoria="entrada",
                activo=True
            ),
            Recipe(
                nombre="Empanadas de Pino",
                descripcion="Empanadas tradicionales chilenas",
                ingredientes=json.dumps([
                    "500g carne molida",
                    "2 cebollas grandes",
                    "Comino, merken, oregano",
                    "Aceitunas negras",
                    "Huevos duros",
                    "Pasas",
                    "Masa para empanadas",
                    "1 huevo para barnizar"
                ]),
                preparacion="1. Preparar pino: freir cebolla, agregar carne y especias\n2. Dejar enfriar el pino completamente\n3. Rellenar las masas con pino, aceituna, huevo y pasas\n4. Cerrar bien las empanadas\n5. Barnizar con huevo batido\n6. Hornear a 200C por 25-30 minutos hasta dorar\n7. Servir calientes",
                tiempo_preparacion=90,
                porciones=12,
                alergenos=json.dumps(["gluten", "huevo"]),
                categoria="entrada",
                activo=True
            ),
            Recipe(
                nombre="Pastel de Choclo",
                descripcion="Tradicional pastel chileno con pino y choclo",
                ingredientes=json.dumps([
                    "1 kg carne molida",
                    "2 cebollas",
                    "8 choclos",
                    "4 huevos duros",
                    "Pasas",
                    "Aceitunas",
                    "Leche",
                    "Azucar",
                    "Albahaca"
                ]),
                preparacion="1. Preparar pino con carne, cebolla y especias\n2. Moler el choclo con leche\n3. Cocinar la pasta de choclo con azucar\n4. En una fuente, colocar el pino\n5. Agregar huevos, pasas y aceitunas\n6. Cubrir con la pasta de choclo\n7. Hornear a 180C por 45 minutos",
                tiempo_preparacion=120,
                porciones=8,
                alergenos=json.dumps(["huevo", "lactosa"]),
                categoria="principal",
                activo=True
            ),
            Recipe(
                nombre="Mote con Huesillo",
                descripcion="Bebida tradicional chilena refrescante",
                ingredientes=json.dumps([
                    "500g huesillos",
                    "300g mote de trigo",
                    "300g azucar",
                    "2 litros agua",
                    "Canela"
                ]),
                preparacion="1. Remojar los huesillos toda la noche\n2. Cocinar huesillos con azucar y canela\n3. Cocinar el mote por separado\n4. Mezclar todo y dejar enfriar\n5. Refrigerar por al menos 2 horas\n6. Servir bien frio",
                tiempo_preparacion=180,
                porciones=8,
                alergenos=json.dumps(["gluten"]),
                categoria="bebida",
                activo=True
            ),
            Recipe(
                nombre="Leche Asada",
                descripcion="Postre tradicional chileno cremoso",
                ingredientes=json.dumps([
                    "1 litro leche",
                    "6 huevos",
                    "200g azucar",
                    "Vainilla",
                    "Caramelo para el molde"
                ]),
                preparacion="1. Preparar caramelo y cubrir el molde\n2. Batir huevos con azucar\n3. Calentar la leche con vainilla\n4. Mezclar todo suavemente\n5. Verter en el molde acaramelado\n6. Hornear a bano maria a 180C por 1 hora\n7. Dejar enfriar y desmoldar",
                tiempo_preparacion=90,
                porciones=8,
                alergenos=json.dumps(["huevo", "lactosa"]),
                categoria="postre",
                activo=True
            ),
            Recipe(
                nombre="Sopaipillas",
                descripcion="Sopaipillas caseras crocantes",
                ingredientes=json.dumps([
                    "500g harina",
                    "100g zapallo cocido",
                    "50g manteca",
                    "1 cucharadita sal",
                    "Agua tibia",
                    "Aceite para freir"
                ]),
                preparacion="1. Mezclar harina, zapallo, manteca y sal\n2. Agregar agua hasta formar masa suave\n3. Amasar por 5 minutos\n4. Dejar reposar 30 minutos\n5. Estirar la masa y cortar circulos\n6. Freir en aceite caliente hasta dorar\n7. Escurrir en papel absorbente",
                tiempo_preparacion=60,
                porciones=20,
                alergenos=json.dumps(["gluten"]),
                categoria="entrada",
                activo=True
            )
        ]
        
        # Agregar recetas
        for recipe in recipes:
            db.add(recipe)
        
        db.commit()
        print(f"[OK] {len(recipes)} recetas agregadas exitosamente")

        # Agregar menú de hoy
        today = date.today()

        menus = [
            DailyMenu(
                fecha=today,
                tipo_comida="desayuno",
                descripcion="Cafe, te, pan con mantequilla, mermelada y huevos revueltos",
                opciones_dieteticas=json.dumps({"vegetariano": True, "sin_lactosa": False}),
                activo=True
            ),
            DailyMenu(
                fecha=today,
                tipo_comida="almuerzo",
                descripcion="Pollo al Horno con Papas, Ensalada Cesar, Sopa de Lentejas de entrada",
                opciones_dieteticas=json.dumps({"vegetariano": False, "sin_lactosa": False}),
                activo=True
            ),
            DailyMenu(
                fecha=today,
                tipo_comida="cena",
                descripcion="Pescado a la Plancha con vegetales, ensalada mixta, arroz con leche de postre",
                opciones_dieteticas=json.dumps({"vegetariano": False, "sin_lactosa": False}),
                activo=True
            )
        ]

        for menu in menus:
            db.add(menu)

        db.commit()
        print(f"[OK] {len(menus)} menus de hoy agregados exitosamente")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Agregando recetas y menús de ejemplo...")
    seed_recipes()
    print("Proceso completado")
