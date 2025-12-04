"""
API Endpoints para Horarios de Comida
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.meal_schedule import MealSchedule
from ..schemas.meal_schedule import (
    MealScheduleCreate,
    MealScheduleUpdate,
    MealScheduleResponse
)
from ..services.time_validation_service import TimeValidationService

router = APIRouter()


@router.get("/", response_model=List[MealScheduleResponse])
def list_meal_schedules(
    activo: bool = None,
    db: Session = Depends(get_db)
):
    """
    Listar horarios de comida
    """
    query = db.query(MealSchedule)
    
    if activo is not None:
        query = query.filter(MealSchedule.activo == activo)
    
    schedules = query.all()
    return schedules


@router.get("/current")
def get_current_meal():
    """
    Obtener tipo de comida actual según la hora
    """
    # Esta función no necesita DB, se implementará en el frontend
    return {
        "message": "Usar endpoint /info con tipo_comida para validar horarios"
    }


@router.get("/info")
def get_schedules_info(db: Session = Depends(get_db)):
    """
    Obtener información de todos los horarios
    """
    schedules = TimeValidationService.get_all_schedules(db)
    return {"schedules": schedules}


@router.get("/{tipo_comida}", response_model=MealScheduleResponse)
def get_meal_schedule(
    tipo_comida: str,
    db: Session = Depends(get_db)
):
    """
    Obtener horario por tipo de comida
    """
    schedule = db.query(MealSchedule).filter(
        MealSchedule.tipo_comida == tipo_comida.lower()
    ).first()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Horario no encontrado"
        )
    
    return schedule


@router.post("/", response_model=MealScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_meal_schedule(
    schedule: MealScheduleCreate,
    db: Session = Depends(get_db)
):
    """
    Crear nuevo horario de comida
    """
    # Verificar si ya existe
    existing = db.query(MealSchedule).filter(
        MealSchedule.tipo_comida == schedule.tipo_comida.lower()
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un horario para {schedule.tipo_comida}"
        )
    
    db_schedule = MealSchedule(
        tipo_comida=schedule.tipo_comida.lower(),
        hora_inicio=schedule.hora_inicio,
        hora_fin=schedule.hora_fin,
        dias_semana=schedule.dias_semana,
        activo=schedule.activo,
        permite_excepciones=schedule.permite_excepciones
    )
    
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    
    return db_schedule


@router.put("/{schedule_id}", response_model=MealScheduleResponse)
def update_meal_schedule(
    schedule_id: int,
    schedule: MealScheduleUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar horario existente
    """
    db_schedule = db.query(MealSchedule).filter(
        MealSchedule.id == schedule_id
    ).first()
    
    if not db_schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Horario no encontrado"
        )
    
    # Actualizar campos proporcionados
    update_data = schedule.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_schedule, field, value)
    
    db.commit()
    db.refresh(db_schedule)
    
    return db_schedule


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal_schedule(
    schedule_id: int,
    db: Session = Depends(get_db)
):
    """
    Desactivar horario
    """
    db_schedule = db.query(MealSchedule).filter(
        MealSchedule.id == schedule_id
    ).first()
    
    if not db_schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Horario no encontrado"
        )
    
    db_schedule.activo = False
    db.commit()
    
    return None
