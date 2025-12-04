"""
API endpoints para reportes y exportación
"""
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from app.database import get_db
from app.services.report_service import ReportService
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/attendance")
async def export_attendance_report(
    start_date: str = Query(..., description="Fecha inicial (YYYY-MM-DD)"),
    end_date: str = Query(..., description="Fecha final (YYYY-MM-DD)"),
    tipo_comida: Optional[str] = Query(None, description="Tipo de comida (desayuno/almuerzo/cena)"),
    format: str = Query("excel", description="Formato de exportación (excel/csv)"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Exporta reporte de asistencia entre fechas
    
    Parámetros:
    - start_date: Fecha inicial en formato YYYY-MM-DD
    - end_date: Fecha final en formato YYYY-MM-DD
    - tipo_comida: Filtro opcional por tipo de comida
    - format: Formato de exportación (excel o csv)
    """
    # Parsear fechas
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        end = end.replace(hour=23, minute=59, second=59)
    except ValueError:
        return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}
    
    # Generar reporte
    df = ReportService.get_attendance_report(db, start, end, tipo_comida)
    
    if df.empty:
        return {"message": "No hay datos para el período seleccionado"}
    
    # Exportar según formato
    if format == "csv":
        from io import StringIO
        output = StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        from datetime import datetime as dt
        timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=Asistencias_{start_date}_a_{end_date}_{timestamp}.csv"
            }
        )
    else:
        # Excel
        from datetime import datetime as dt
        timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
        output = ReportService.export_to_excel({
            "Asistencias": df
        })

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=Asistencias_{start_date}_a_{end_date}_{timestamp}.xlsx"
            }
        )


@router.get("/employees/monthly")
async def export_employee_monthly_report(
    month: int = Query(..., description="Mes (1-12)", ge=1, le=12),
    year: int = Query(..., description="Año (ej: 2024)"),
    format: str = Query("excel", description="Formato (excel/csv)"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Exporta resumen mensual de asistencia de empleados
    
    Incluye total de asistencias y desglose por tipo de comida
    """
    df = ReportService.get_employee_attendance_summary(db, month, year)
    
    if df.empty:
        return {"message": "No hay datos para el período seleccionado"}
    
    # Exportar según formato
    from datetime import datetime as dt
    timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
    month_names = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    month_name = month_names[month - 1]

    if format == "csv":
        from io import StringIO
        output = StringIO()
        df.to_csv(output, index=False)
        output.seek(0)

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=Empleados_Mensual_{month_name}_{year}_{timestamp}.csv"
            }
        )
    else:
        output = ReportService.export_to_excel({
            f"Resumen {month_name} {year}": df
        })

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=Empleados_Mensual_{month_name}_{year}_{timestamp}.xlsx"
            }
        )


@router.get("/guests")
async def export_guests_report(
    start_date: str = Query(..., description="Fecha inicial (YYYY-MM-DD)"),
    end_date: str = Query(..., description="Fecha final (YYYY-MM-DD)"),
    format: str = Query("excel", description="Formato (excel/csv)"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Exporta reporte de invitados entre fechas
    
    Incluye nombre, empresa, región y total de visitas
    """
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        end = end.replace(hour=23, minute=59, second=59)
    except ValueError:
        return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}
    
    df = ReportService.get_guests_report(db, start, end)
    
    if df.empty:
        return {"message": "No hay datos para el período seleccionado"}
    
    from datetime import datetime as dt
    timestamp = dt.now().strftime("%Y%m%d_%H%M%S")

    if format == "csv":
        from io import StringIO
        output = StringIO()
        df.to_csv(output, index=False)
        output.seek(0)

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=Invitados_{start_date}_a_{end_date}_{timestamp}.csv"
            }
        )
    else:
        output = ReportService.export_to_excel({
            "Invitados": df
        })

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=Invitados_{start_date}_a_{end_date}_{timestamp}.xlsx"
            }
        )


@router.get("/complete")
async def export_complete_report(
    month: int = Query(..., description="Mes (1-12)", ge=1, le=12),
    year: int = Query(..., description="Año"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Exporta reporte completo del mes con múltiples hojas

    Incluye:
    - Resumen de empleados
    - Resumen de invitados
    - Estadísticas diarias
    - Detalle de asistencias
    """
    # Calcular rango del mes
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = datetime(year, month + 1, 1) - timedelta(days=1)
    end_date = end_date.replace(hour=23, minute=59, second=59)

    # Generar todos los reportes
    dataframes = {}

    # Empleados
    df_employees = ReportService.get_employee_attendance_summary(db, month, year)
    if not df_employees.empty:
        dataframes["Empleados"] = df_employees

    # Invitados
    df_guests = ReportService.get_guests_report(db, start_date, end_date)
    if not df_guests.empty:
        dataframes["Invitados"] = df_guests

    # Estadísticas diarias
    df_daily = ReportService.get_daily_stats(db, start_date, end_date)
    if not df_daily.empty:
        dataframes["Estadísticas Diarias"] = df_daily

    # Detalle de asistencias
    df_attendance = ReportService.get_attendance_report(db, start_date, end_date)
    if not df_attendance.empty:
        dataframes["Detalle Asistencias"] = df_attendance

    if not dataframes:
        return {"message": "No hay datos para el período seleccionado"}

    # Exportar
    from datetime import datetime as dt
    timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
    month_names = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    month_name = month_names[month - 1]

    output = ReportService.export_to_excel(dataframes)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename=Reporte_Completo_{month_name}_{year}_{timestamp}.xlsx"
        }
    )


@router.get("/stats/daily")
async def get_daily_stats(
    start_date: str = Query(..., description="Fecha inicial (YYYY-MM-DD)"),
    end_date: str = Query(..., description="Fecha final (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Obtiene estadísticas diarias para gráficos

    Retorna datos en formato JSON para gráficos de línea/barras
    """
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        end = end.replace(hour=23, minute=59, second=59)
    except ValueError:
        return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}

    df = ReportService.get_daily_stats(db, start, end)

    if df.empty:
        return {"data": []}

    # Convertir a formato para gráficos
    return {"data": df.to_dict('records')}


@router.get("/stats/by-meal-type")
async def get_stats_by_meal_type(
    start_date: str = Query(..., description="Fecha inicial (YYYY-MM-DD)"),
    end_date: str = Query(..., description="Fecha final (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Obtiene estadísticas agrupadas por tipo de comida

    Retorna datos en formato JSON para gráficos de pastel/dona
    """
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        end = end.replace(hour=23, minute=59, second=59)
    except ValueError:
        return {"error": "Formato de fecha inválido. Use YYYY-MM-DD"}

    df = ReportService.get_stats_by_meal_type(db, start, end)

    if df.empty:
        return {"data": []}

    return {"data": df.to_dict('records')}


@router.get("/stats/top-departments")
async def get_top_departments(
    month: int = Query(..., description="Mes (1-12)", ge=1, le=12),
    year: int = Query(..., description="Año"),
    limit: int = Query(10, description="Número de departamentos a retornar"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Obtiene los departamentos con más asistencias

    Retorna datos en formato JSON para gráficos de barras
    """
    df = ReportService.get_top_departments(db, month, year, limit)

    if df.empty:
        return {"data": []}

    return {"data": df.to_dict('records')}
