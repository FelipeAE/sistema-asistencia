"""
Servicio de validación de horarios
"""
from datetime import time
from sqlalchemy.orm import Session
from typing import Optional, Tuple
import json

from ..models.meal_schedule import MealSchedule
from ..utils.timezone import get_chile_now


class TimeValidationService:
    """Servicio para validación de horarios de comida"""
    
    @staticmethod
    def get_current_meal_type(db: Session) -> Optional[str]:
        """
        Determina el tipo de comida actual según la hora (zona horaria Chile)
        
        Returns:
            str: "desayuno", "almuerzo", "cena" o None
        """
        now = get_chile_now()
        current_time = now.time()
        current_day = now.strftime("%A").lower()
        
        # Mapeo de días en inglés a español
        day_mapping = {
            "monday": "lunes",
            "tuesday": "martes",
            "wednesday": "miercoles",
            "thursday": "jueves",
            "friday": "viernes",
            "saturday": "sabado",
            "sunday": "domingo"
        }
        
        spanish_day = day_mapping.get(current_day, current_day)
        
        # Obtener todos los horarios activos
        schedules = db.query(MealSchedule).filter(
            MealSchedule.activo == True
        ).all()
        
        for schedule in schedules:
            # Verificar si el horario cruza la medianoche (ej: 21:00 a 06:00)
            if schedule.hora_inicio > schedule.hora_fin:
                # Horario nocturno: válido si es >= inicio OR <= fin
                in_schedule = current_time >= schedule.hora_inicio or current_time <= schedule.hora_fin
            else:
                # Horario normal: válido si está entre inicio y fin
                in_schedule = schedule.hora_inicio <= current_time <= schedule.hora_fin

            if in_schedule:
                # Verificar si hoy es un día permitido
                if schedule.dias_semana:
                    try:
                        dias = json.loads(schedule.dias_semana)
                        if spanish_day in dias:
                            return schedule.tipo_comida
                    except:
                        return schedule.tipo_comida
                else:
                    return schedule.tipo_comida

        return None
    
    @staticmethod
    def validate_meal_time(
        tipo_comida: str,
        db: Session
    ) -> Tuple[bool, Optional[str]]:
        """
        Valida si la hora actual es apropiada para el tipo de comida (zona horaria Chile)
        
        Returns:
            tuple: (es_valido, mensaje_error)
        """
        schedule = db.query(MealSchedule).filter(
            MealSchedule.tipo_comida == tipo_comida,
            MealSchedule.activo == True
        ).first()
        
        if not schedule:
            return False, f"No hay horario configurado para {tipo_comida}"
        
        now = get_chile_now()
        current_time = now.time()

        # Verificar si el horario cruza la medianoche (ej: 21:00 a 06:00)
        if schedule.hora_inicio > schedule.hora_fin:
            is_valid = current_time >= schedule.hora_inicio or current_time <= schedule.hora_fin
        else:
            is_valid = schedule.hora_inicio <= current_time <= schedule.hora_fin

        if not is_valid:
            hora_inicio = schedule.hora_inicio.strftime("%H:%M")
            hora_fin = schedule.hora_fin.strftime("%H:%M")
            return False, f"Fuera de horario. {tipo_comida.capitalize()}: {hora_inicio} - {hora_fin}"

        return True, None
    
    @staticmethod
    def get_schedule_info(tipo_comida: str, db: Session) -> Optional[dict]:
        """
        Obtiene información del horario de un tipo de comida
        """
        schedule = db.query(MealSchedule).filter(
            MealSchedule.tipo_comida == tipo_comida,
            MealSchedule.activo == True
        ).first()
        
        if not schedule:
            return None
        
        return {
            "tipo_comida": schedule.tipo_comida,
            "hora_inicio": schedule.hora_inicio.strftime("%H:%M"),
            "hora_fin": schedule.hora_fin.strftime("%H:%M"),
            "activo": schedule.activo,
            "permite_excepciones": schedule.permite_excepciones
        }
    
    @staticmethod
    def get_all_schedules(db: Session) -> list:
        """
        Obtiene todos los horarios configurados
        """
        schedules = db.query(MealSchedule).filter(
            MealSchedule.activo == True
        ).all()
        
        return [
            {
                "tipo_comida": s.tipo_comida,
                "hora_inicio": s.hora_inicio.strftime("%H:%M"),
                "hora_fin": s.hora_fin.strftime("%H:%M"),
                "activo": s.activo
            }
            for s in schedules
        ]
