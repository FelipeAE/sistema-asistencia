"""
API Endpoints para Recetas
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.recipe import Recipe
from ..schemas.recipe import RecipeCreate, RecipeUpdate, RecipeResponse
from ..services.recipe_search_service import RecipeSearchService
from ..dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[RecipeResponse])
def list_recipes(
    skip: int = 0,
    limit: int = 20,
    categoria: Optional[str] = None,
    activo: bool = True,
    db: Session = Depends(get_db)
):
    """
    Listar recetas con filtros opcionales
    """
    query = db.query(Recipe)
    
    if activo is not None:
        query = query.filter(Recipe.activo == activo)
    
    if categoria:
        query = query.filter(Recipe.categoria == categoria.lower())
    
    recipes = query.order_by(Recipe.nombre).offset(skip).limit(limit).all()
    return recipes


@router.get("/search", response_model=List[RecipeResponse])
def search_recipes(
    q: Optional[str] = Query(None, description="Buscar en nombre, ingredientes o descripción"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoría"),
    sin_alergenos: Optional[str] = Query(None, description="Excluir alérgenos (separados por coma)"),
    max_tiempo: Optional[int] = Query(None, description="Tiempo máximo de preparación en minutos"),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Buscar recetas con múltiples filtros
    """
    # Procesar lista de alérgenos
    alergenos_list = None
    if sin_alergenos:
        alergenos_list = [a.strip() for a in sin_alergenos.split(",")]
    
    recipes = RecipeSearchService.search_recipes(
        db=db,
        query=q,
        categoria=categoria,
        sin_alergenos=alergenos_list,
        max_tiempo=max_tiempo,
        skip=skip,
        limit=limit
    )
    
    return recipes


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """
    Obtener lista de categorías disponibles
    """
    categories = RecipeSearchService.get_categories(db)
    return {"categories": categories}


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """
    Obtener receta por ID
    """
    recipe = RecipeSearchService.get_recipe_by_id(db, recipe_id)
    
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receta no encontrada"
        )
    
    return recipe


@router.post("/", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
def create_recipe(
    recipe: RecipeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Crear nueva receta (requiere autenticación)
    """
    db_recipe = Recipe(
        nombre=recipe.nombre,
        descripcion=recipe.descripcion,
        ingredientes=recipe.ingredientes,
        preparacion=recipe.preparacion,
        tiempo_preparacion=recipe.tiempo_preparacion,
        porciones=recipe.porciones,
        alergenos=recipe.alergenos,
        categoria=recipe.categoria.lower() if recipe.categoria else None,
        foto_url=recipe.foto_url,
        activo=True
    )
    
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    
    return db_recipe


@router.put("/{recipe_id}", response_model=RecipeResponse)
def update_recipe(
    recipe_id: int,
    recipe: RecipeUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Actualizar receta existente (requiere autenticación)
    """
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    
    if not db_recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receta no encontrada"
        )
    
    # Actualizar campos proporcionados
    update_data = recipe.dict(exclude_unset=True)
    if "categoria" in update_data and update_data["categoria"]:
        update_data["categoria"] = update_data["categoria"].lower()
    
    for field, value in update_data.items():
        setattr(db_recipe, field, value)
    
    db.commit()
    db.refresh(db_recipe)
    
    return db_recipe


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Desactivar receta (soft delete - requiere autenticación)
    """
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    
    if not db_recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receta no encontrada"
        )
    
    db_recipe.activo = False
    db.commit()
    
    return None
