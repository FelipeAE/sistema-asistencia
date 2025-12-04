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
async def download_template(
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
