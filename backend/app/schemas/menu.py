"""
Schemas de Pydantic para DailyMenu
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class DailyMenuBase(BaseModel):
    fecha: date = Field(..., description="Fecha del menú")
    tipo_comida: str = Field(..., max_length=20, description="desayuno, almuerzo, cena")
    entrada: Optional[str] = Field(None, max_length=200, description="Entrada")
    plato_principal: Optional[str] = Field(None, max_length=200, description="Plato principal")
    postre: Optional[str] = Field(None, max_length=200, description="Postre")
    ensalada: Optional[str] = Field(None, max_length=200, description="Ensalada")
    bebida: Optional[str] = Field(None, max_length=200, description="Bebida")
    descripcion: Optional[str] = Field(None, description="Descripción/notas adicionales")
    opciones_dieteticas: Optional[str] = Field(None, description="JSON con opciones")
    activo: bool = True


class DailyMenuCreate(DailyMenuBase):
    """Schema para crear menú"""
    pass


class DailyMenuUpdate(BaseModel):
    """Schema para actualizar menú"""
    entrada: Optional[str] = None
    plato_principal: Optional[str] = None
    postre: Optional[str] = None
    ensalada: Optional[str] = None
    bebida: Optional[str] = None
    descripcion: Optional[str] = None
    opciones_dieteticas: Optional[str] = None
    activo: Optional[bool] = None


class DailyMenuResponse(DailyMenuBase):
    """Schema de respuesta con ID"""
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None

    class Config:
        from_attributes = True
