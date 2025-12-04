"""
Schemas de Pydantic para Guest (Invitados)
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class GuestBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    apellido: str = Field(..., min_length=1, max_length=100)
    empresa: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=50)
    motivo_visita: Optional[str] = None
    email: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    restricciones_alimentarias: Optional[str] = None
    foto_url: Optional[str] = Field(None, max_length=255)


class GuestCreate(GuestBase):
    """Schema para crear invitado"""
    pass


class GuestUpdate(BaseModel):
    """Schema para actualizar invitado"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    apellido: Optional[str] = Field(None, min_length=1, max_length=100)
    empresa: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=50)
    motivo_visita: Optional[str] = None
    email: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    restricciones_alimentarias: Optional[str] = None
    foto_url: Optional[str] = Field(None, max_length=255)
    activo: Optional[bool] = None


class GuestResponse(GuestBase):
    """Schema de respuesta con ID"""
    id: int
    fecha_registro: datetime
    activo: bool

    class Config:
        from_attributes = True
