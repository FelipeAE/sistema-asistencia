"""
Schemas de Pydantic para MealSchedule (Horarios de Comida)
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import time


class MealScheduleBase(BaseModel):
    tipo_comida: str = Field(..., max_length=20, description="desayuno, almuerzo, cena")
    hora_inicio: time = Field(..., description="Hora de inicio (HH:MM)")
    hora_fin: time = Field(..., description="Hora de fin (HH:MM)")
    dias_semana: Optional[str] = Field(None, description="JSON array de días")
    activo: bool = True
    permite_excepciones: bool = True


class MealScheduleCreate(MealScheduleBase):
    """Schema para crear horario"""
    pass


class MealScheduleUpdate(BaseModel):
    """Schema para actualizar horario"""
    hora_inicio: Optional[time] = None
    hora_fin: Optional[time] = None
    dias_semana: Optional[str] = None
    activo: Optional[bool] = None
    permite_excepciones: Optional[bool] = None


class MealScheduleResponse(MealScheduleBase):
    """Schema de respuesta con ID"""
    id: int

    class Config:
        from_attributes = True
