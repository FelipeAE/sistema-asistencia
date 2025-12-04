"""
Schemas de Pydantic para Attendance
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, time, datetime


class AttendanceRegister(BaseModel):
    """Schema para registrar asistencia de empleado"""
    rut: str = Field(..., description="RUT del empleado")
    tipo_comida: str = Field(..., description="desayuno, almuerzo o cena")
    observaciones: Optional[str] = None


class GuestAttendanceRegister(BaseModel):
    """Schema para registrar asistencia de invitado"""
    guest_id: int = Field(..., description="ID del invitado")
    tipo_comida: str = Field(..., description="desayuno, almuerzo o cena")
    observaciones: Optional[str] = None


class AttendanceResponse(BaseModel):
    """Schema de respuesta de registro de asistencia"""
    id: int
    employee_id: Optional[int]
    guest_id: Optional[int]
    fecha: date
    hora: time
    tipo_comida: str
    es_invitado: bool
    observaciones: Optional[str]
    fecha_creacion: datetime

    class Config:
        from_attributes = True


class AttendanceWithDetails(BaseModel):
    """Schema de respuesta con detalles del empleado/invitado"""
    id: int
    fecha: date
    hora: time
    tipo_comida: str
    es_invitado: bool
    nombre: str
    departamento: Optional[str] = None
    empresa: Optional[str] = None
    restricciones_alimentarias: Optional[str] = None
    observaciones: Optional[str] = None

    class Config:
        from_attributes = True
