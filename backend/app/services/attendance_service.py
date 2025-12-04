"""
Servicio de gestión de asistencia
"""
from datetime import datetime, date, time
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional

from ..models.attendance import AttendanceRecord
from ..models.employee import Employee
from ..models.guest import Guest
from ..models.meal_schedule import MealSchedule
from .rut_validator import clean_rut, format_rut
from ..utils.timezone import get_chile_now, get_chile_today


class AttendanceService:
    """Servicio para gestionar registros de asistencia"""
    
    @staticmethod
    def validate_time_schedule(tipo_comida: str, db: Session) -> tuple[bool, Optional[str]]:
        """
        Valida si la hora actual está dentro del horario permitido

        Returns:
            tuple: (es_valido, mensaje_error)
        """
        # Obtener horario configurado
        schedule = db.query(MealSchedule).filter(
            MealSchedule.tipo_comida == tipo_comida,
            MealSchedule.activo == True
        ).first()

        if not schedule:
            return False, f"No hay horario configurado para {tipo_comida}"

        # Validar hora actual (zona horaria Chile)
        now = get_chile_now()
        current_time = now.time()

        # Verificar si el horario cruza la medianoche (ej: 21:00 a 06:00)
        if schedule.hora_inicio > schedule.hora_fin:
            # Horario nocturno: válido si es >= inicio OR <= fin
            is_valid = current_time >= schedule.hora_inicio or current_time <= schedule.hora_fin
        else:
            # Horario normal: válido si está entre inicio y fin
            is_valid = schedule.hora_inicio <= current_time <= schedule.hora_fin

        if not is_valid:
            return False, f"Fuera de horario. {tipo_comida.capitalize()}: {schedule.hora_inicio.strftime('%H:%M')} - {schedule.hora_fin.strftime('%H:%M')}"

        return True, None
    
    @staticmethod
    def check_duplicate_attendance(
        employee_id: Optional[int],
        guest_id: Optional[int],
        fecha: date,
        tipo_comida: str,
        db: Session
    ) -> bool:
        """
        Verifica si ya existe un registro de asistencia
        
        Returns:
            bool: True si ya existe, False si no
        """
        query = db.query(AttendanceRecord).filter(
            AttendanceRecord.fecha == fecha,
            AttendanceRecord.tipo_comida == tipo_comida
        )
        
        if employee_id:
            query = query.filter(AttendanceRecord.employee_id == employee_id)
        elif guest_id:
            query = query.filter(AttendanceRecord.guest_id == guest_id)
        
        return query.first() is not None
    
    @staticmethod
    def register_employee_attendance(
        rut: str,
        tipo_comida: str,
        observaciones: Optional[str],
        db: Session
    ) -> tuple[Optional[AttendanceRecord], Optional[str]]:
        """
        Registra asistencia de un empleado
        
        Returns:
            tuple: (registro_asistencia, mensaje_error)
        """
        # Buscar empleado con múltiples formatos de RUT
        clean_rut_value = clean_rut(rut)
        format_rut_value = format_rut(rut)
        
        employee = db.query(Employee).filter(
            Employee.activo == True
        ).filter(
            or_(
                Employee.rut == rut,
                Employee.rut == clean_rut_value,
                Employee.rut == format_rut_value
            )
        ).first()
        
        if not employee:
            return None, "Empleado no encontrado o inactivo"
        
        # Validar horario
        is_valid, error_msg = AttendanceService.validate_time_schedule(tipo_comida, db)
        if not is_valid:
            return None, error_msg
        
        # Verificar duplicados (zona horaria Chile)
        today = get_chile_today()
        if AttendanceService.check_duplicate_attendance(
            employee.id, None, today, tipo_comida, db
        ):
            return None, f"Ya existe un registro de {tipo_comida} para hoy"
        
        # Crear registro
        chile_now = get_chile_now()
        attendance = AttendanceRecord(
            employee_id=employee.id,
            guest_id=None,
            fecha=today,
            hora=chile_now.time(),
            tipo_comida=tipo_comida,
            observaciones=observaciones,
            es_invitado=False
        )
        
        db.add(attendance)
        db.commit()
        db.refresh(attendance)
        
        return attendance, None
    
    @staticmethod
    def register_guest_attendance(
        guest_id: int,
        tipo_comida: str,
        observaciones: Optional[str],
        db: Session
    ) -> tuple[Optional[AttendanceRecord], Optional[str]]:
        """
        Registra asistencia de un invitado
        
        Returns:
            tuple: (registro_asistencia, mensaje_error)
        """
        # Buscar invitado
        guest = db.query(Guest).filter(
            Guest.id == guest_id,
            Guest.activo == True
        ).first()
        
        if not guest:
            return None, "Invitado no encontrado o inactivo"
        
        # Validar horario
        is_valid, error_msg = AttendanceService.validate_time_schedule(tipo_comida, db)
        if not is_valid:
            return None, error_msg
        
        # Verificar duplicados (zona horaria Chile)
        today = get_chile_today()
        if AttendanceService.check_duplicate_attendance(
            None, guest_id, today, tipo_comida, db
        ):
            return None, f"Ya existe un registro de {tipo_comida} para este invitado hoy"
        
        # Crear registro
        chile_now = get_chile_now()
        attendance = AttendanceRecord(
            employee_id=None,
            guest_id=guest_id,
            fecha=today,
            hora=chile_now.time(),
            tipo_comida=tipo_comida,
            observaciones=observaciones,
            es_invitado=True
        )
        
        db.add(attendance)
        db.commit()
        db.refresh(attendance)
        
        return attendance, None
