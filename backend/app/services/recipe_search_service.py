"""
Servicio de búsqueda de recetas
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
import json

from ..models.recipe import Recipe


class RecipeSearchService:
    """Servicio para búsqueda avanzada de recetas"""
    
    @staticmethod
    def search_recipes(
        db: Session,
        query: Optional[str] = None,
        categoria: Optional[str] = None,
        sin_alergenos: Optional[List[str]] = None,
        max_tiempo: Optional[int] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[Recipe]:
        """
        Buscar recetas con múltiples filtros
        
        Args:
            query: Búsqueda por nombre o ingredientes
            categoria: Filtrar por categoría
            sin_alergenos: Excluir recetas con estos alérgenos
            max_tiempo: Tiempo máximo de preparación
            skip: Offset para paginación
            limit: Límite de resultados
        """
        # Query base
        db_query = db.query(Recipe).filter(Recipe.activo == True)
        
        # Búsqueda por texto (nombre o ingredientes)
        if query:
            search_term = f"%{query.lower()}%"
            db_query = db_query.filter(
                or_(
                    Recipe.nombre.ilike(search_term),
                    Recipe.ingredientes.ilike(search_term),
                    Recipe.descripcion.ilike(search_term)
                )
            )
        
        # Filtro por categoría
        if categoria:
            db_query = db_query.filter(Recipe.categoria == categoria.lower())
        
        # Filtro por tiempo máximo
        if max_tiempo:
            db_query = db_query.filter(
                Recipe.tiempo_preparacion <= max_tiempo
            )
        
        # Filtro por alérgenos (excluir recetas que contengan estos alérgenos)
        if sin_alergenos:
            for alergeno in sin_alergenos:
                db_query = db_query.filter(
                    ~Recipe.alergenos.ilike(f"%{alergeno}%")
                )
        
        # Ordenar por nombre y paginar
        recipes = db_query.order_by(Recipe.nombre).offset(skip).limit(limit).all()
        
        return recipes
    
    @staticmethod
    def get_categories(db: Session) -> List[str]:
        """
        Obtener lista de categorías únicas
        """
        result = db.query(Recipe.categoria).filter(
            Recipe.activo == True,
            Recipe.categoria.isnot(None)
        ).distinct().all()
        
        return [cat[0] for cat in result if cat[0]]
    
    @staticmethod
    def get_recipe_by_id(db: Session, recipe_id: int) -> Optional[Recipe]:
        """
        Obtener receta por ID
        """
        return db.query(Recipe).filter(
            Recipe.id == recipe_id,
            Recipe.activo == True
        ).first()
    
    @staticmethod
    def parse_ingredientes(ingredientes_json: str) -> List[str]:
        """
        Parsear JSON de ingredientes
        """
        try:
            return json.loads(ingredientes_json)
        except:
            return []
    
    @staticmethod
    def parse_alergenos(alergenos_json: str) -> List[str]:
        """
        Parsear JSON de alérgenos
        """
        try:
            return json.loads(alergenos_json) if alergenos_json else []
        except:
            return []
