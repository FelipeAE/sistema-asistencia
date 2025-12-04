"""
API Endpoints para Registro de Asistencia
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from ..database import get_db
from ..schemas.attendance import (
    AttendanceRegister,
    GuestAttendanceRegister,
    AttendanceResponse,
    AttendanceWithDetails
)
from ..services.attendance_service import AttendanceService
from ..services.rut_validator import validate_rut, clean_rut, format_rut
from ..models.attendance import AttendanceRecord
from ..models.employee import Employee
from ..models.guest import Guest
from ..utils.timezone import get_chile_today

router = APIRouter()


@router.post("/register", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def register_attendance(
    attendance: AttendanceRegister,
    db: Session = Depends(get_db)
):
    """
    Registrar asistencia de empleado por RUT
    """
    # Validar RUT
    if not validate_rut(attendance.rut):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RUT inválido"
        )
    
    # Validar tipo de comida
    valid_tipos = ["desayuno", "almuerzo", "cena", "testing"]
    if attendance.tipo_comida.lower() not in valid_tipos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de comida debe ser: {', '.join(valid_tipos)}"
        )

    # Preparar datos (NO formatear el RUT, dejarlo como viene)
    tipo_comida = attendance.tipo_comida.lower()
    
    # Registrar asistencia
    record, error = AttendanceService.register_employee_attendance(
        rut=attendance.rut,  # Enviar RUT sin formatear
        tipo_comida=tipo_comida,
        observaciones=attendance.observaciones,
        db=db
    )
    
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    
    return record


@router.post("/register-guest", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def register_guest_attendance(
    attendance: GuestAttendanceRegister,
    db: Session = Depends(get_db)
):
    """
    Registrar asistencia de invitado
    """
    # Validar tipo de comida
    valid_tipos = ["desayuno", "almuerzo", "cena", "testing"]
    if attendance.tipo_comida.lower() not in valid_tipos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de comida debe ser: {', '.join(valid_tipos)}"
        )

    tipo_comida = attendance.tipo_comida.lower()

    # Registrar asistencia
    record, error = AttendanceService.register_guest_attendance(
        guest_id=attendance.guest_id,
        tipo_comida=tipo_comida,
        observaciones=attendance.observaciones,
        db=db
    )
    
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    
    return record


@router.get("/today", response_model=List[AttendanceWithDetails])
def get_today_attendance(
    tipo_comida: str = None,
    db: Session = Depends(get_db)
):
    """
    Obtener registros de asistencia del día actual (zona horaria Chile)
    """
    today = get_chile_today()
    query = db.query(AttendanceRecord).filter(AttendanceRecord.fecha == today)
    
    if tipo_comida:
        query = query.filter(AttendanceRecord.tipo_comida == tipo_comida.lower())
    
    records = query.all()
    
    # Construir respuesta con detalles
    result = []
    for record in records:
        if record.employee_id:
            employee = db.query(Employee).filter(Employee.id == record.employee_id).first()
            result.append(AttendanceWithDetails(
                id=record.id,
                fecha=record.fecha,
                hora=record.hora,
                tipo_comida=record.tipo_comida,
                es_invitado=False,
                nombre=employee.nombre,
                departamento=employee.departamento,
                empresa=None,
                restricciones_alimentarias=employee.restricciones_alimentarias,
                observaciones=record.observaciones
            ))
        elif record.guest_id:
            guest = db.query(Guest).filter(Guest.id == record.guest_id).first()
            result.append(AttendanceWithDetails(
                id=record.id,
                fecha=record.fecha,
                hora=record.hora,
                tipo_comida=record.tipo_comida,
                es_invitado=True,
                nombre=f"{guest.nombre} {guest.apellido}",
                departamento=None,
                empresa=guest.empresa,
                restricciones_alimentarias=guest.restricciones_alimentarias,
                observaciones=record.observaciones
            ))
    
    return result


@router.get("/date/{fecha}", response_model=List[AttendanceWithDetails])
def get_attendance_by_date(
    fecha: date,
    tipo_comida: str = None,
    db: Session = Depends(get_db)
):
    """
    Obtener registros de asistencia por fecha específica
    """
    query = db.query(AttendanceRecord).filter(AttendanceRecord.fecha == fecha)
    
    if tipo_comida:
        query = query.filter(AttendanceRecord.tipo_comida == tipo_comida.lower())
    
    records = query.all()
    
    # Construir respuesta con detalles
    result = []
    for record in records:
        if record.employee_id:
            employee = db.query(Employee).filter(Employee.id == record.employee_id).first()
            result.append(AttendanceWithDetails(
                id=record.id,
                fecha=record.fecha,
                hora=record.hora,
                tipo_comida=record.tipo_comida,
                es_invitado=False,
                nombre=employee.nombre,
                departamento=employee.departamento,
                empresa=None,
                restricciones_alimentarias=employee.restricciones_alimentarias,
                observaciones=record.observaciones
            ))
        elif record.guest_id:
            guest = db.query(Guest).filter(Guest.id == record.guest_id).first()
            result.append(AttendanceWithDetails(
                id=record.id,
                fecha=record.fecha,
                hora=record.hora,
                tipo_comida=record.tipo_comida,
                es_invitado=True,
                nombre=f"{guest.nombre} {guest.apellido}",
                departamento=None,
                empresa=guest.empresa,
                restricciones_alimentarias=guest.restricciones_alimentarias,
                observaciones=record.observaciones
            ))
    
    return result
