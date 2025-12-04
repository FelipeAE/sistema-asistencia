"""
Servicio de reportes y exportación de datos
"""
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case, literal
from datetime import datetime, timedelta
from io import BytesIO
from typing import Dict, Any, Optional

from app.models.employee import Employee
from app.models.guest import Guest
from app.models.attendance import AttendanceRecord


class ReportService:
    """Servicio para generar reportes y exportar datos"""
    
    @staticmethod
    def get_attendance_report(
        db: Session,
        start_date: datetime,
        end_date: datetime,
        tipo_comida: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Genera reporte de asistencia entre fechas
        
        Args:
            db: Sesión de base de datos
            start_date: Fecha inicial
            end_date: Fecha final
            tipo_comida: Filtro por tipo de comida (opcional)
            
        Returns:
            DataFrame con reporte de asistencia
        """
        query = db.query(
            AttendanceRecord.fecha,
            AttendanceRecord.hora,
            AttendanceRecord.tipo_comida,
            AttendanceRecord.employee_id,
            AttendanceRecord.guest_id,
            Employee.nombre.label('empleado_nombre'),
            Employee.cargo,
            Employee.departamento,
            Guest.nombre.label('invitado_nombre'),
            Guest.apellido.label('invitado_apellido'),
            Guest.empresa
        ).outerjoin(
            Employee, AttendanceRecord.employee_id == Employee.id
        ).outerjoin(
            Guest, AttendanceRecord.guest_id == Guest.id
        ).filter(
            AttendanceRecord.fecha >= start_date.date(),
            AttendanceRecord.fecha <= end_date.date()
        )
        
        if tipo_comida:
            query = query.filter(AttendanceRecord.tipo_comida == tipo_comida)
        
        results = query.all()
        
        # Convertir a DataFrame
        data = []
        for r in results:
            data.append({
                'Fecha': r.fecha.strftime('%Y-%m-%d') if hasattr(r.fecha, 'strftime') else str(r.fecha),
                'Hora': r.hora.strftime('%H:%M:%S') if hasattr(r.hora, 'strftime') else str(r.hora),
                'Tipo Comida': r.tipo_comida.capitalize(),
                'Tipo Persona': 'Empleado' if r.employee_id else 'Invitado',
                'Nombre': r.empleado_nombre if r.employee_id 
                         else f"{r.invitado_nombre} {r.invitado_apellido}",
                'Cargo': r.cargo or '-',
                'Área': r.departamento or '-',
                'Empresa': r.empresa or '-'
            })
        
        return pd.DataFrame(data)
    
    @staticmethod
    def get_employee_attendance_summary(
        db: Session,
        month: int,
        year: int
    ) -> pd.DataFrame:
        """
        Genera resumen de asistencia de empleados por mes
        
        Args:
            db: Sesión de base de datos
            month: Mes (1-12)
            year: Año
            
        Returns:
            DataFrame con resumen de asistencia por empleado
        """
        results = db.query(
            Employee.rut,
            Employee.nombre,
            Employee.cargo,
            Employee.departamento,
            func.count(AttendanceRecord.id).label('total_asistencias'),
            func.sum(
                case((AttendanceRecord.tipo_comida == 'desayuno', 1), else_=0)
            ).label('desayunos'),
            func.sum(
                case((AttendanceRecord.tipo_comida == 'almuerzo', 1), else_=0)
            ).label('almuerzos'),
            func.sum(
                case((AttendanceRecord.tipo_comida == 'cena', 1), else_=0)
            ).label('cenas')
        ).join(
            AttendanceRecord, Employee.id == AttendanceRecord.employee_id
        ).filter(
            extract('month', AttendanceRecord.fecha) == month,
            extract('year', AttendanceRecord.fecha) == year
        ).group_by(
            Employee.id
        ).order_by(
            func.count(AttendanceRecord.id).desc()
        ).all()
        
        data = []
        for r in results:
            data.append({
                'RUT': r.rut,
                'Nombre': r.nombre,
                'Cargo': r.cargo or '-',
                'Área': r.departamento or '-',
                'Total Asistencias': r.total_asistencias,
                'Desayunos': r.desayunos,
                'Almuerzos': r.almuerzos,
                'Cenas': r.cenas
            })
        
        return pd.DataFrame(data)
    
    @staticmethod
    def get_guests_report(
        db: Session,
        start_date: datetime,
        end_date: datetime
    ) -> pd.DataFrame:
        """
        Genera reporte de invitados entre fechas
        
        Args:
            db: Sesión de base de datos
            start_date: Fecha inicial
            end_date: Fecha final
            
        Returns:
            DataFrame con reporte de invitados
        """
        results = db.query(
            Guest.nombre,
            Guest.apellido,
            Guest.empresa,
            Guest.region,
            func.count(AttendanceRecord.id).label('total_visitas')
        ).join(
            AttendanceRecord, Guest.id == AttendanceRecord.guest_id
        ).filter(
            AttendanceRecord.fecha >= start_date.date(),
            AttendanceRecord.fecha <= end_date.date()
        ).group_by(
            Guest.id
        ).order_by(
            func.count(AttendanceRecord.id).desc()
        ).all()
        
        data = []
        for r in results:
            data.append({
                'Nombre': f"{r.nombre} {r.apellido}",
                'Empresa': r.empresa or '-',
                'Región': r.region or '-',
                'Total Visitas': r.total_visitas
            })
        
        return pd.DataFrame(data)
    
    @staticmethod
    def export_to_excel(dataframes: Dict[str, pd.DataFrame]) -> BytesIO:
        """
        Exporta múltiples DataFrames a un archivo Excel
        
        Args:
            dataframes: Dict con nombre de hoja como key y DataFrame como value
            
        Returns:
            BytesIO con archivo Excel
        """
        output = BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            for sheet_name, df in dataframes.items():
                df.to_excel(writer, sheet_name=sheet_name, index=False)
                
                # Ajustar ancho de columnas
                worksheet = writer.sheets[sheet_name]
                for idx, col in enumerate(df.columns):
                    max_length = max(
                        df[col].astype(str).apply(len).max(),
                        len(str(col))
                    )
                    worksheet.column_dimensions[
                        chr(65 + idx)
                    ].width = min(max_length + 2, 50)
        
        output.seek(0)
        return output
    
    @staticmethod
    def get_daily_stats(
        db: Session,
        start_date: datetime,
        end_date: datetime
    ) -> pd.DataFrame:
        """
        Genera estadísticas diarias de asistencia

        Args:
            db: Sesión de base de datos
            start_date: Fecha inicial
            end_date: Fecha final

        Returns:
            DataFrame con estadísticas diarias
        """
        results = db.query(
            AttendanceRecord.fecha,
            AttendanceRecord.tipo_comida,
            func.count(AttendanceRecord.id).label('total')
        ).filter(
            AttendanceRecord.fecha >= start_date.date(),
            AttendanceRecord.fecha <= end_date.date()
        ).group_by(
            AttendanceRecord.fecha,
            AttendanceRecord.tipo_comida
        ).order_by(
            AttendanceRecord.fecha
        ).all()

        data = []
        for r in results:
            data.append({
                'Fecha': r.fecha.strftime('%Y-%m-%d') if hasattr(r.fecha, 'strftime') else str(r.fecha),
                'Tipo Comida': r.tipo_comida.capitalize(),
                'Total': r.total
            })

        return pd.DataFrame(data)

    @staticmethod
    def get_stats_by_meal_type(
        db: Session,
        start_date: datetime,
        end_date: datetime
    ) -> pd.DataFrame:
        """
        Genera estadísticas agrupadas por tipo de comida

        Args:
            db: Sesión de base de datos
            start_date: Fecha inicial
            end_date: Fecha final

        Returns:
            DataFrame con totales por tipo de comida
        """
        results = db.query(
            AttendanceRecord.tipo_comida,
            func.count(AttendanceRecord.id).label('total')
        ).filter(
            AttendanceRecord.fecha >= start_date.date(),
            AttendanceRecord.fecha <= end_date.date()
        ).group_by(
            AttendanceRecord.tipo_comida
        ).all()

        data = []
        for r in results:
            data.append({
                'name': r.tipo_comida.capitalize(),
                'value': r.total
            })

        return pd.DataFrame(data)

    @staticmethod
    def get_top_departments(
        db: Session,
        month: int,
        year: int,
        limit: int = 10
    ) -> pd.DataFrame:
        """
        Obtiene los departamentos con más asistencias

        Args:
            db: Sesión de base de datos
            month: Mes (1-12)
            year: Año
            limit: Número máximo de departamentos a retornar

        Returns:
            DataFrame con departamentos ordenados por asistencias
        """
        results = db.query(
            Employee.departamento,
            func.count(AttendanceRecord.id).label('total')
        ).join(
            AttendanceRecord, Employee.id == AttendanceRecord.employee_id
        ).filter(
            extract('month', AttendanceRecord.fecha) == month,
            extract('year', AttendanceRecord.fecha) == year,
            Employee.departamento.isnot(None)
        ).group_by(
            Employee.departamento
        ).order_by(
            func.count(AttendanceRecord.id).desc()
        ).limit(limit).all()

        data = []
        for r in results:
            data.append({
                'departamento': r.departamento,
                'total': r.total
            })

        return pd.DataFrame(data)
