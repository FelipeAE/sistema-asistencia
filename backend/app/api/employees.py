"""
API Endpoints para Empleados
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.employee import Employee
from ..schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeSearchResponse,
    EmployeeValidatePIN
)
from ..services.rut_validator import validate_rut, clean_rut, format_rut

router = APIRouter()


# IMPORTANTE: Las rutas más específicas deben ir ANTES de las rutas con parámetros dinámicos

@router.get("/", response_model=List[EmployeeResponse])
def list_employees(
    skip: int = 0,
    limit: int = 100,
    activo: bool = None,
    departamento: str = None,
    db: Session = Depends(get_db)
):
    """
    Listar empleados con filtros opcionales
    """
    query = db.query(Employee)

    if activo is not None:
        query = query.filter(Employee.activo == activo)

    if departamento:
        query = query.filter(Employee.departamento == departamento)

    employees = query.offset(skip).limit(limit).all()
    return employees


@router.get("/{rut}", response_model=EmployeeSearchResponse)
def get_employee_by_rut(rut: str, pin: str = None, db: Session = Depends(get_db)):
    """
    Buscar empleado por RUT. Si el empleado tiene PIN, debe proporcionarse.
    """
    # Validar formato RUT
    if not validate_rut(rut):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RUT inválido"
        )

    # Limpiar RUT para búsqueda
    clean_rut_value = clean_rut(rut)
    format_rut_value = format_rut(rut)

    # Buscar empleado (probando múltiples formatos)
    employee = db.query(Employee).filter(
        Employee.activo == True
    ).filter(
        (Employee.rut == rut) |  # Formato original
        (Employee.rut == clean_rut_value) |  # Sin formato
        (Employee.rut == format_rut_value)  # Con puntos
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )

    # Validar PIN si el empleado tiene uno configurado
    if employee.pin:
        if not pin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="PIN requerido"
            )
        if employee.pin != pin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="PIN incorrecto"
            )

    # Agregar campo tiene_pin a la respuesta
    response = EmployeeSearchResponse(
        id=employee.id,
        rut=employee.rut,
        nombre=employee.nombre,
        departamento=employee.departamento,
        cargo=employee.cargo,
        restricciones_alimentarias=employee.restricciones_alimentarias,
        foto_url=employee.foto_url,
        activo=employee.activo,
        tiene_pin=bool(employee.pin)
    )

    return response


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    """
    Crear nuevo empleado
    """
    # Validar RUT
    if not validate_rut(employee.rut):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RUT inválido"
        )
    
    # Limpiar y formatear RUT
    clean_rut_value = clean_rut(employee.rut)
    
    # Verificar si el RUT ya existe
    existing = db.query(Employee).filter(
        (Employee.rut == clean_rut_value) | (Employee.rut == format_rut(employee.rut))
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un empleado con este RUT"
        )
    
    # Crear empleado
    db_employee = Employee(
        rut=format_rut(employee.rut),  # Guardar con formato
        nombre=employee.nombre,
        email=employee.email,
        telefono=employee.telefono,
        departamento=employee.departamento,
        cargo=employee.cargo,
        restricciones_alimentarias=employee.restricciones_alimentarias,
        foto_url=employee.foto_url,
        pin=employee.pin,  # PIN de seguridad
        activo=employee.activo
    )
    
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    
    return db_employee


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    employee: EmployeeUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar empleado existente
    """
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    if not db_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )
    
    # Actualizar campos proporcionados
    update_data = employee.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_employee, field, value)
    
    db.commit()
    db.refresh(db_employee)
    
    return db_employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """
    Desactivar empleado (soft delete)
    """
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    
    if not db_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )
    
    db_employee.activo = False
    db.commit()
    
    return None
