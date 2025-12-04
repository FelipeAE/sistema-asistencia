"""
Schemas de Pydantic para Employee
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class EmployeeBase(BaseModel):
    rut: str = Field(..., description="RUT chileno con formato XX.XXX.XXX-X")
    nombre: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    departamento: Optional[str] = Field(None, max_length=50)
    cargo: Optional[str] = Field(None, max_length=50)
    restricciones_alimentarias: Optional[str] = None
    foto_url: Optional[str] = Field(None, max_length=255)
    activo: bool = True


class EmployeeCreate(EmployeeBase):
    """Schema para crear empleado"""
    pass


class EmployeeUpdate(BaseModel):
    """Schema para actualizar empleado"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    departamento: Optional[str] = Field(None, max_length=50)
    cargo: Optional[str] = Field(None, max_length=50)
    restricciones_alimentarias: Optional[str] = None
    foto_url: Optional[str] = Field(None, max_length=255)
    activo: Optional[bool] = None


class EmployeeResponse(EmployeeBase):
    """Schema de respuesta con ID"""
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmployeeSearchResponse(BaseModel):
    """Schema de respuesta para búsqueda por RUT"""
    id: int
    rut: str
    nombre: str
    departamento: Optional[str]
    cargo: Optional[str]
    restricciones_alimentarias: Optional[str]
    foto_url: Optional[str]
    activo: bool

    class Config:
        from_attributes = True
