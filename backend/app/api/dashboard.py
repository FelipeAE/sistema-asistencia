"""
API Endpoints para Dashboard y Estadísticas
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import timedelta
from typing import Optional

from ..database import get_db
from ..models.admin_user import AdminUser
from ..models.attendance import AttendanceRecord
from ..models.employee import Employee
from ..models.guest import Guest
from ..dependencies import get_current_user
from ..utils.timezone import get_chile_today

router = APIRouter()


@router.get("/stats/today")
def get_today_stats(
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Estadísticas del día actual (zona horaria Chile)
    """
    today = get_chile_today()
    
    # Total de asistencias hoy
    total_today = db.query(AttendanceRecord).filter(
        AttendanceRecord.fecha == today
    ).count()
    
    # Asistencias por tipo
    by_type = db.query(
        AttendanceRecord.tipo_comida,
        func.count(AttendanceRecord.id).label('count')
    ).filter(
        AttendanceRecord.fecha == today
    ).group_by(AttendanceRecord.tipo_comida).all()
    
    # Empleados vs Invitados
    empleados_count = db.query(AttendanceRecord).filter(
        AttendanceRecord.fecha == today,
        AttendanceRecord.es_invitado == False
    ).count()
    
    invitados_count = db.query(AttendanceRecord).filter(
        AttendanceRecord.fecha == today,
        AttendanceRecord.es_invitado == True
    ).count()
    
    return {
        "fecha": today.isoformat(),
        "total_asistencias": total_today,
        "empleados": empleados_count,
        "invitados": invitados_count,
        "por_tipo_comida": {item.tipo_comida: item.count for item in by_type}
    }


@router.get("/stats/week")
def get_week_stats(
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Estadísticas de la semana actual (zona horaria Chile)
    """
    today = get_chile_today()
    week_start = today - timedelta(days=today.weekday())
    
    # Asistencias por día de la semana
    daily_stats = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        count = db.query(AttendanceRecord).filter(
            AttendanceRecord.fecha == day
        ).count()
        
        daily_stats.append({
            "fecha": day.isoformat(),
            "dia_semana": day.strftime("%A"),
            "total": count
        })
    
    # Total semanal
    total_week = db.query(AttendanceRecord).filter(
        AttendanceRecord.fecha >= week_start,
        AttendanceRecord.fecha <= today
    ).count()
    
    return {
        "semana_inicio": week_start.isoformat(),
        "total_semana": total_week,
        "por_dia": daily_stats
    }


@router.get("/stats/month")
def get_month_stats(
    year: Optional[int] = None,
    month: Optional[int] = None,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Estadísticas del mes (zona horaria Chile)
    """
    from datetime import date
    today = get_chile_today()
    year = year or today.year
    month = month or today.month
    
    # Primer y último día del mes
    month_start = date(year, month, 1)
    if month == 12:
        month_end = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        month_end = date(year, month + 1, 1) - timedelta(days=1)
    
    # Total mensual
    total_month = db.query(AttendanceRecord).filter(
        AttendanceRecord.fecha >= month_start,
        AttendanceRecord.fecha <= month_end
    ).count()
    
    # Por tipo de comida
    by_type = db.query(
        AttendanceRecord.tipo_comida,
        func.count(AttendanceRecord.id).label('count')
    ).filter(
        AttendanceRecord.fecha >= month_start,
        AttendanceRecord.fecha <= month_end
    ).group_by(AttendanceRecord.tipo_comida).all()
    
    # Empleados vs Invitados
    empleados_count = db.query(AttendanceRecord).filter(
        AttendanceRecord.fecha >= month_start,
        AttendanceRecord.fecha <= month_end,
        AttendanceRecord.es_invitado == False
    ).count()
    
    invitados_count = db.query(AttendanceRecord).filter(
        AttendanceRecord.fecha >= month_start,
        AttendanceRecord.fecha <= month_end,
        AttendanceRecord.es_invitado == True
    ).count()
    
    return {
        "año": year,
        "mes": month,
        "periodo_inicio": month_start.isoformat(),
        "periodo_fin": month_end.isoformat(),
        "total_asistencias": total_month,
        "empleados": empleados_count,
        "invitados": invitados_count,
        "por_tipo_comida": {item.tipo_comida: item.count for item in by_type}
    }


@router.get("/stats/employees")
def get_employee_stats(
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Estadísticas de empleados
    """
    total_employees = db.query(Employee).filter(Employee.activo == True).count()
    total_inactive = db.query(Employee).filter(Employee.activo == False).count()
    
    # Top 10 empleados por asistencia este mes
    from datetime import date
    today = get_chile_today()
    month_start = date(today.year, today.month, 1)
    
    top_employees = db.query(
        Employee.nombre,
        Employee.departamento,
        func.count(AttendanceRecord.id).label('asistencias')
    ).join(
        AttendanceRecord,
        AttendanceRecord.employee_id == Employee.id
    ).filter(
        AttendanceRecord.fecha >= month_start
    ).group_by(
        Employee.id
    ).order_by(
        func.count(AttendanceRecord.id).desc()
    ).limit(10).all()
    
    return {
        "total_activos": total_employees,
        "total_inactivos": total_inactive,
        "top_asistencias_mes": [
            {
                "nombre": emp.nombre,
                "area": emp.departamento,
                "asistencias": emp.asistencias
            }
            for emp in top_employees
        ]
    }


@router.get("/stats/guests")
def get_guest_stats(
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Estadísticas de invitados
    """
    total_guests = db.query(Guest).count()
    
    # Por empresa
    by_company = db.query(
        Guest.empresa,
        func.count(Guest.id).label('count')
    ).filter(
        Guest.empresa.isnot(None)
    ).group_by(Guest.empresa).order_by(
        func.count(Guest.id).desc()
    ).limit(10).all()
    
    # Por región
    by_region = db.query(
        Guest.region,
        func.count(Guest.id).label('count')
    ).filter(
        Guest.region.isnot(None)
    ).group_by(Guest.region).order_by(
        func.count(Guest.id).desc()
    ).all()
    
    # Invitados este mes
    from datetime import date
    today = get_chile_today()
    month_start = date(today.year, today.month, 1)
    
    guests_this_month = db.query(Guest).filter(
        func.date(Guest.fecha_registro) >= month_start
    ).count()
    
    return {
        "total_invitados": total_guests,
        "invitados_este_mes": guests_this_month,
        "top_empresas": [
            {"empresa": item.empresa, "count": item.count}
            for item in by_company
        ],
        "por_region": [
            {"region": item.region, "count": item.count}
            for item in by_region
        ]
    }
