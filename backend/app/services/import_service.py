"""
Servicio de importación de datos desde Excel/CSV
"""
import pandas as pd
from typing import List, Dict, Any
from io import BytesIO
from datetime import datetime, date

from app.models.employee import Employee
from app.models.menu import DailyMenu
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

    # ============ IMPORTACIÓN DE MENÚS ============

    # Mapeo de columnas para menús
    MENU_COLUMN_MAPPING = {
        'fecha': ['fecha', 'Fecha', 'FECHA', 'date', 'Date'],
        'tipo_comida': ['tipo_comida', 'Tipo Comida', 'TIPO COMIDA', 'tipo', 'Tipo', 'meal_type'],
        'entrada': ['entrada', 'Entrada', 'ENTRADA', 'starter'],
        'plato_principal': ['plato_principal', 'Plato Principal', 'PLATO PRINCIPAL', 'plato', 'Plato', 'main'],
        'postre': ['postre', 'Postre', 'POSTRE', 'dessert'],
        'ensalada': ['ensalada', 'Ensalada', 'ENSALADA', 'salad'],
        'bebida': ['bebida', 'Bebida', 'BEBIDA', 'drink'],
        'descripcion': ['descripcion', 'Descripcion', 'DESCRIPCION', 'Descripción', 'notas', 'Notas']
    }

    @staticmethod
    def normalize_menu_columns(df: pd.DataFrame) -> pd.DataFrame:
        """Normaliza nombres de columnas de menús"""
        normalized_df = df.copy()

        # Crear mapeo inverso
        reverse_mapping = {}
        for standard_name, variants in ImportService.MENU_COLUMN_MAPPING.items():
            for variant in variants:
                reverse_mapping[variant] = standard_name

        # Renombrar columnas
        normalized_df.columns = [
            reverse_mapping.get(col.strip(), col.lower().strip())
            for col in normalized_df.columns
        ]

        return normalized_df

    @staticmethod
    def validate_menu_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
        """Valida que el DataFrame de menús tenga las columnas requeridas"""
        required_columns = ['fecha', 'tipo_comida']
        missing_columns = [col for col in required_columns if col not in df.columns]

        if missing_columns:
            return {
                'valid': False,
                'error': f"Faltan columnas requeridas: {', '.join(missing_columns)}",
                'missing_columns': missing_columns
            }

        return {'valid': True}

    @staticmethod
    def parse_date(date_value) -> date:
        """Parsea diferentes formatos de fecha"""
        if pd.isna(date_value):
            return None

        # Si ya es un objeto date o datetime
        if isinstance(date_value, (date, datetime)):
            return date_value if isinstance(date_value, date) else date_value.date()

        # Si es string
        date_str = str(date_value).strip()

        # Intentar varios formatos
        formats = ['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%Y/%m/%d', '%d.%m.%Y']
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue

        raise ValueError(f"Formato de fecha no reconocido: {date_str}")

    @staticmethod
    def normalize_tipo_comida(tipo: str) -> str:
        """Normaliza el tipo de comida"""
        tipo = str(tipo).lower().strip()
        mapping = {
            'desayuno': 'desayuno',
            'almuerzo': 'almuerzo',
            'cena': 'cena',
            'once': 'once',
            'colacion': 'colacion',
            'colación': 'colacion',
            'testing': 'testing'
        }
        return mapping.get(tipo, tipo)

    @staticmethod
    def process_menus(df: pd.DataFrame) -> Dict[str, Any]:
        """Procesa DataFrame de menús y valida datos"""
        valid_menus = []
        errors = []

        # Normalizar y validar estructura
        df = ImportService.normalize_menu_columns(df)
        validation = ImportService.validate_menu_dataframe(df)

        if not validation['valid']:
            return {
                'success': False,
                'error': validation['error'],
                'valid_menus': [],
                'errors': [],
                'summary': {'total': 0, 'valid': 0, 'errors': 0}
            }

        # Procesar cada fila
        for idx, row in df.iterrows():
            try:
                # Parsear fecha
                fecha_raw = row.get('fecha')
                try:
                    fecha = ImportService.parse_date(fecha_raw)
                    if not fecha:
                        errors.append({'row': idx + 2, 'error': 'Fecha vacía'})
                        continue
                except ValueError as e:
                    errors.append({'row': idx + 2, 'error': str(e)})
                    continue

                # Validar tipo de comida
                tipo_comida = row.get('tipo_comida', '')
                if not tipo_comida or pd.isna(tipo_comida):
                    errors.append({'row': idx + 2, 'error': 'Tipo de comida vacío'})
                    continue

                tipo_comida = ImportService.normalize_tipo_comida(tipo_comida)

                # Construir datos del menú
                menu_data = {
                    'fecha': fecha,
                    'tipo_comida': tipo_comida,
                    'entrada': str(row.get('entrada', '')).strip() if not pd.isna(row.get('entrada')) else None,
                    'plato_principal': str(row.get('plato_principal', '')).strip() if not pd.isna(row.get('plato_principal')) else None,
                    'postre': str(row.get('postre', '')).strip() if not pd.isna(row.get('postre')) else None,
                    'ensalada': str(row.get('ensalada', '')).strip() if not pd.isna(row.get('ensalada')) else None,
                    'bebida': str(row.get('bebida', '')).strip() if not pd.isna(row.get('bebida')) else None,
                    'descripcion': str(row.get('descripcion', '')).strip() if not pd.isna(row.get('descripcion')) else None,
                    'activo': True
                }

                # Limpiar valores vacíos
                for key in ['entrada', 'plato_principal', 'postre', 'ensalada', 'bebida', 'descripcion']:
                    if menu_data[key] == '' or menu_data[key] == 'nan':
                        menu_data[key] = None

                valid_menus.append(menu_data)

            except Exception as e:
                errors.append({'row': idx + 2, 'error': f'Error procesando fila: {str(e)}'})

        return {
            'success': True,
            'valid_menus': valid_menus,
            'errors': errors,
            'summary': {
                'total': len(df),
                'valid': len(valid_menus),
                'errors': len(errors)
            }
        }

    @staticmethod
    async def import_menus(db, file_content: bytes, filename: str, update_existing: bool = True) -> Dict[str, Any]:
        """
        Importa menús desde archivo Excel/CSV

        Args:
            db: Sesión de base de datos
            file_content: Contenido del archivo
            filename: Nombre del archivo
            update_existing: Si es True, actualiza menús existentes; si es False, los omite

        Returns:
            Resultado de la importación
        """
        try:
            # Parsear archivo
            df = ImportService.parse_file(file_content, filename)

            # Procesar menús
            result = ImportService.process_menus(df)

            if not result['success']:
                return result

            # Importar menús válidos
            imported = 0
            updated = 0
            skipped = 0
            import_errors = []

            for menu_data in result['valid_menus']:
                try:
                    # Verificar si ya existe
                    existing = db.query(DailyMenu).filter(
                        DailyMenu.fecha == menu_data['fecha'],
                        DailyMenu.tipo_comida == menu_data['tipo_comida']
                    ).first()

                    if existing:
                        if update_existing:
                            # Actualizar menú existente
                            for key, value in menu_data.items():
                                if key not in ['fecha', 'tipo_comida'] and value is not None:
                                    setattr(existing, key, value)
                            updated += 1
                        else:
                            skipped += 1
                        continue

                    # Crear nuevo menú
                    menu = DailyMenu(**menu_data)
                    db.add(menu)
                    imported += 1

                except Exception as e:
                    import_errors.append({
                        'fecha': str(menu_data['fecha']),
                        'tipo': menu_data['tipo_comida'],
                        'error': str(e)
                    })

            # Commit
            db.commit()

            return {
                'success': True,
                'imported': imported,
                'updated': updated,
                'skipped': skipped,
                'errors': result['errors'] + import_errors,
                'summary': {
                    'total': result['summary']['total'],
                    'valid': result['summary']['valid'],
                    'imported': imported,
                    'updated': updated,
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
                'updated': 0,
                'skipped': 0,
                'errors': [],
                'summary': {
                    'total': 0,
                    'valid': 0,
                    'imported': 0,
                    'updated': 0,
                    'skipped': 0,
                    'errors': 1
                }
            }
