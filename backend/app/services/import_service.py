"""
Servicio de importación de datos desde Excel/CSV
"""
import pandas as pd
from typing import List, Dict, Any
from io import BytesIO
from datetime import datetime

from app.models.employee import Employee
from app.utils.rut_validator import validate_rut


class ImportService:
    """Servicio para importar empleados desde Excel/CSV"""
    
    # Mapeo de columnas permitidas
    COLUMN_MAPPING = {
        'rut': ['rut', 'RUT', 'Rut'],
        'nombre': ['nombre', 'Nombre', 'NOMBRE', 'name', 'Name'],
        'apellido': ['apellido', 'Apellido', 'APELLIDO', 'lastname', 'Lastname'],
        'cargo': ['cargo', 'Cargo', 'CARGO', 'position', 'Position'],
        'departamento': ['departamento', 'Departamento', 'DEPARTAMENTO', 'area', 'Area', 'AREA', 'department', 'Department'],
        'email': ['email', 'Email', 'EMAIL', 'correo', 'Correo'],
        'telefono': ['telefono', 'Telefono', 'TELEFONO', 'phone', 'Phone', 'teléfono']
    }
    
    @staticmethod
    def parse_file(file_content: bytes, filename: str) -> pd.DataFrame:
        """
        Parsea archivo Excel o CSV a DataFrame
        
        Args:
            file_content: Contenido del archivo en bytes
            filename: Nombre del archivo
            
        Returns:
            DataFrame con los datos
        """
        file_ext = filename.lower().split('.')[-1]
        
        try:
            if file_ext in ['xlsx', 'xls']:
                df = pd.read_excel(BytesIO(file_content))
            elif file_ext == 'csv':
                # Intentar detectar encoding
                try:
                    df = pd.read_csv(BytesIO(file_content), encoding='utf-8')
                except UnicodeDecodeError:
                    df = pd.read_csv(BytesIO(file_content), encoding='latin1')
            else:
                raise ValueError(f"Formato de archivo no soportado: {file_ext}")
                
            return df
        except Exception as e:
            raise ValueError(f"Error al leer archivo: {str(e)}")
    
    @staticmethod
    def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
        """
        Normaliza nombres de columnas según mapeo
        
        Args:
            df: DataFrame original
            
        Returns:
            DataFrame con columnas normalizadas
        """
        normalized_df = df.copy()
        
        # Crear mapeo inverso
        reverse_mapping = {}
        for standard_name, variants in ImportService.COLUMN_MAPPING.items():
            for variant in variants:
                reverse_mapping[variant] = standard_name
        
        # Renombrar columnas
        normalized_df.columns = [
            reverse_mapping.get(col, col.lower()) 
            for col in normalized_df.columns
        ]
        
        return normalized_df
    
    @staticmethod
    def validate_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Valida que el DataFrame tenga las columnas requeridas
        
        Args:
            df: DataFrame a validar
            
        Returns:
            Dict con resultado de validación
        """
        required_columns = ['rut', 'nombre', 'apellido']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return {
                'valid': False,
                'error': f"Faltan columnas requeridas: {', '.join(missing_columns)}",
                'missing_columns': missing_columns
            }
        
        return {'valid': True}
    
    @staticmethod
    def process_employees(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Procesa DataFrame de empleados y valida datos
        
        Args:
            df: DataFrame con datos de empleados
            
        Returns:
            Dict con empleados válidos, errores y resumen
        """
        valid_employees = []
        errors = []
        
        # Normalizar y validar estructura
        df = ImportService.normalize_columns(df)
        validation = ImportService.validate_dataframe(df)
        
        if not validation['valid']:
            return {
                'success': False,
                'error': validation['error'],
                'valid_employees': [],
                'errors': [],
                'summary': {
                    'total': 0,
                    'valid': 0,
                    'errors': 0
                }
            }
        
        # Procesar cada fila
        for idx, row in df.iterrows():
            try:
                # Validar RUT
                rut = str(row.get('rut', '')).strip()
                if not rut:
                    errors.append({
                        'row': idx + 2,  # +2 porque Excel empieza en 1 y tiene header
                        'error': 'RUT vacío'
                    })
                    continue
                
                if not validate_rut(rut):
                    errors.append({
                        'row': idx + 2,
                        'error': f'RUT inválido: {rut}'
                    })
                    continue
                
                # Validar nombre y apellido
                nombre = str(row.get('nombre', '')).strip()
                apellido = str(row.get('apellido', '')).strip()

                if not nombre or not apellido:
                    errors.append({
                        'row': idx + 2,
                        'error': 'Nombre o apellido vacío'
                    })
                    continue

                # Concatenar nombre completo
                nombre_completo = f"{nombre} {apellido}"

                # Construir datos del empleado
                employee_data = {
                    'rut': rut,
                    'nombre': nombre_completo,
                    'cargo': str(row.get('cargo', '')).strip() or None,
                    'departamento': str(row.get('departamento', '')).strip() or None,
                    'email': str(row.get('email', '')).strip() or None,
                    'telefono': str(row.get('telefono', '')).strip() or None
                }
                
                # Validar email si existe
                if employee_data['email'] and '@' not in employee_data['email']:
                    errors.append({
                        'row': idx + 2,
                        'error': f'Email inválido: {employee_data["email"]}'
                    })
                    continue
                
                valid_employees.append(employee_data)
                
            except Exception as e:
                errors.append({
                    'row': idx + 2,
                    'error': f'Error procesando fila: {str(e)}'
                })
        
        return {
            'success': True,
            'valid_employees': valid_employees,
            'errors': errors,
            'summary': {
                'total': len(df),
                'valid': len(valid_employees),
                'errors': len(errors)
            }
        }
    
    @staticmethod
    async def import_employees(db, file_content: bytes, filename: str) -> Dict[str, Any]:
        """
        Importa empleados desde archivo
        
        Args:
            db: Sesión de base de datos
            file_content: Contenido del archivo
            filename: Nombre del archivo
            
        Returns:
            Resultado de la importación
        """
        try:
            # Parsear archivo
            df = ImportService.parse_file(file_content, filename)
            
            # Procesar empleados
            result = ImportService.process_employees(df)
            
            if not result['success']:
                return result
            
            # Importar empleados válidos
            imported = 0
            skipped = 0
            import_errors = []
            
            for emp_data in result['valid_employees']:
                try:
                    # Verificar si ya existe
                    existing = db.query(Employee).filter(
                        Employee.rut == emp_data['rut']
                    ).first()
                    
                    if existing:
                        skipped += 1
                        continue
                    
                    # Crear nuevo empleado
                    employee = Employee(**emp_data)
                    db.add(employee)
                    imported += 1
                    
                except Exception as e:
                    import_errors.append({
                        'rut': emp_data['rut'],
                        'error': str(e)
                    })
            
            # Commit
            db.commit()
            
            return {
                'success': True,
                'imported': imported,
                'skipped': skipped,
                'errors': result['errors'] + import_errors,
                'summary': {
                    'total': result['summary']['total'],
                    'valid': result['summary']['valid'],
                    'imported': imported,
                    'skipped': skipped,
                    'errors': len(result['errors']) + len(import_errors)
                }
            }
            
        except Exception as e:
            db.rollback()
            return {
                'success': False,
                'error': str(e),
                'imported': 0,
                'skipped': 0,
                'errors': [],
                'summary': {
                    'total': 0,
                    'valid': 0,
                    'imported': 0,
                    'skipped': 0,
                    'errors': 1
                }
            }
