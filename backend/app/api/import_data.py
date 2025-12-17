"""
API endpoints para importación de datos
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from app.services.import_service import ImportService
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/employees", response_model=Dict[str, Any])
async def import_employees(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Importa empleados desde archivo Excel o CSV

    Formatos soportados: .xlsx, .xls, .csv

    Columnas requeridas:
    - rut: RUT del empleado
    - nombre: Nombre del empleado
    - apellido: Apellido del empleado

    Columnas opcionales:
    - cargo: Cargo del empleado
    - departamento: Departamento del empleado
    - email: Email del empleado
    - telefono: Teléfono del empleado
    """
    # Validar tipo de archivo
    allowed_extensions = ['xlsx', 'xls', 'csv']
    file_ext = file.filename.lower().split('.')[-1]
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Formato de archivo no soportado. Permitidos: {', '.join(allowed_extensions)}"
        )
    
    # Leer contenido
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error al leer archivo: {str(e)}"
        )
    
    # Importar empleados
    result = await ImportService.import_employees(db, content, file.filename)
    
    if not result['success'] and 'error' in result:
        raise HTTPException(
            status_code=400,
            detail=result['error']
        )
    
    return result


@router.get("/employees/template")
async def download_employees_template(
    current_user = Depends(get_current_user)
):
    """
    Descarga plantilla Excel para importación de empleados
    """
    from fastapi.responses import StreamingResponse
    import pandas as pd
    from io import BytesIO

    # Crear DataFrame de ejemplo
    data = {
        'rut': ['12345678-9', '98765432-1'],
        'nombre': ['Juan', 'María'],
        'apellido': ['Pérez', 'González'],
        'cargo': ['Chef', 'Cajera'],
        'departamento': ['Cocina', 'Caja'],
        'email': ['juan.perez@casino.com', 'maria.gonzalez@casino.com'],
        'telefono': ['+56912345678', '+56987654321']
    }

    df = pd.DataFrame(data)

    # Crear archivo Excel en memoria
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Empleados')

    output.seek(0)

    return StreamingResponse(
        output,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={
            'Content-Disposition': 'attachment; filename=plantilla_empleados.xlsx'
        }
    )


# ============ IMPORTACIÓN DE MENÚS ============

@router.post("/menus", response_model=Dict[str, Any])
async def import_menus(
    file: UploadFile = File(...),
    update_existing: bool = True,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Importa menús desde archivo Excel o CSV

    Formatos soportados: .xlsx, .xls, .csv

    Columnas requeridas:
    - fecha: Fecha del menú (formato: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY)
    - tipo_comida: Tipo de comida (desayuno, almuerzo, cena, once)

    Columnas opcionales:
    - entrada: Entrada del menú
    - plato_principal: Plato principal
    - postre: Postre
    - ensalada: Ensalada
    - bebida: Bebida
    - descripcion: Descripción o notas adicionales

    Parámetros:
    - update_existing: Si es True, actualiza menús existentes; si es False, los omite
    """
    # Validar tipo de archivo
    allowed_extensions = ['xlsx', 'xls', 'csv']
    file_ext = file.filename.lower().split('.')[-1]

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Formato de archivo no soportado. Permitidos: {', '.join(allowed_extensions)}"
        )

    # Leer contenido
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error al leer archivo: {str(e)}"
        )

    # Importar menús
    result = await ImportService.import_menus(db, content, file.filename, update_existing)

    if not result['success'] and 'error' in result:
        raise HTTPException(
            status_code=400,
            detail=result['error']
        )

    return result


@router.get("/menus/template")
async def download_menus_template(
    current_user = Depends(get_current_user)
):
    """
    Descarga plantilla Excel para importación de menús
    """
    from fastapi.responses import StreamingResponse
    import pandas as pd
    from io import BytesIO
    from datetime import date, timedelta

    # Crear DataFrame de ejemplo con menús para una semana
    today = date.today()
    data = []

    for i in range(7):
        fecha = today + timedelta(days=i)
        # Almuerzo
        data.append({
            'Fecha': fecha.strftime('%Y-%m-%d'),
            'Tipo Comida': 'almuerzo',
            'Entrada': 'Ensalada mixta',
            'Plato Principal': f'Plato del día {i+1}',
            'Postre': 'Fruta de temporada',
            'Ensalada': 'Lechuga, tomate, pepino',
            'Bebida': 'Jugo natural',
            'Descripcion': ''
        })

    df = pd.DataFrame(data)

    # Crear archivo Excel en memoria
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Menús')

        # Ajustar ancho de columnas
        worksheet = writer.sheets['Menús']
        for idx, col in enumerate(df.columns):
            max_length = max(df[col].astype(str).map(len).max(), len(col)) + 2
            worksheet.column_dimensions[chr(65 + idx)].width = min(max_length, 30)

    output.seek(0)

    return StreamingResponse(
        output,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={
            'Content-Disposition': 'attachment; filename=plantilla_menus.xlsx'
        }
    )
