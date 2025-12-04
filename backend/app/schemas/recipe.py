"""
Schemas de Pydantic para Recipe (Recetario)
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class RecipeBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=150)
    descripcion: Optional[str] = None
    ingredientes: str = Field(..., description="JSON array de ingredientes")
    preparacion: str = Field(..., description="Pasos de preparación")
    tiempo_preparacion: Optional[int] = Field(None, description="Tiempo en minutos")
    porciones: Optional[int] = None
    alergenos: Optional[str] = Field(None, description="JSON array de alérgenos")
    categoria: Optional[str] = Field(None, max_length=50)
    foto_url: Optional[str] = Field(None, max_length=255)


class RecipeCreate(RecipeBase):
    """Schema para crear receta"""
    pass


class RecipeUpdate(BaseModel):
    """Schema para actualizar receta"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=150)
    descripcion: Optional[str] = None
    ingredientes: Optional[str] = None
    preparacion: Optional[str] = None
    tiempo_preparacion: Optional[int] = None
    porciones: Optional[int] = None
    alergenos: Optional[str] = None
    categoria: Optional[str] = None
    foto_url: Optional[str] = None
    activo: Optional[bool] = None


class RecipeResponse(RecipeBase):
    """Schema de respuesta con ID"""
    id: int
    activo: bool
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None

    class Config:
        from_attributes = True
