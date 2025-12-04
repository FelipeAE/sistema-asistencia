"""
API Endpoints para Invitados (Guests)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.guest import Guest
from ..schemas.guest import GuestCreate, GuestUpdate, GuestResponse

router = APIRouter()


@router.get("/", response_model=List[GuestResponse])
def list_guests(
    skip: int = 0,
    limit: int = 100,
    activo: bool = None,
    empresa: str = None,
    region: str = None,
    db: Session = Depends(get_db)
):
    """
    Listar invitados con filtros opcionales
    """
    query = db.query(Guest)
    
    if activo is not None:
        query = query.filter(Guest.activo == activo)
    
    if empresa:
        query = query.filter(Guest.empresa.ilike(f"%{empresa}%"))
    
    if region:
        query = query.filter(Guest.region.ilike(f"%{region}%"))
    
    guests = query.order_by(Guest.fecha_registro.desc()).offset(skip).limit(limit).all()
    return guests


@router.get("/{guest_id}", response_model=GuestResponse)
def get_guest(guest_id: int, db: Session = Depends(get_db)):
    """
    Obtener invitado por ID
    """
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitado no encontrado"
        )
    
    return guest


@router.post("/", response_model=GuestResponse, status_code=status.HTTP_201_CREATED)
def create_guest(guest: GuestCreate, db: Session = Depends(get_db)):
    """
    Crear nuevo invitado
    """
    db_guest = Guest(
        nombre=guest.nombre,
        apellido=guest.apellido,
        empresa=guest.empresa,
        region=guest.region,
        motivo_visita=guest.motivo_visita,
        email=guest.email,
        telefono=guest.telefono,
        restricciones_alimentarias=guest.restricciones_alimentarias,
        foto_url=guest.foto_url,
        activo=True
    )
    
    db.add(db_guest)
    db.commit()
    db.refresh(db_guest)
    
    return db_guest


@router.put("/{guest_id}", response_model=GuestResponse)
def update_guest(
    guest_id: int,
    guest: GuestUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar invitado existente
    """
    db_guest = db.query(Guest).filter(Guest.id == guest_id).first()
    
    if not db_guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitado no encontrado"
        )
    
    # Actualizar campos proporcionados
    update_data = guest.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_guest, field, value)
    
    db.commit()
    db.refresh(db_guest)
    
    return db_guest


@router.delete("/{guest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_guest(guest_id: int, db: Session = Depends(get_db)):
    """
    Desactivar invitado (soft delete)
    """
    db_guest = db.query(Guest).filter(Guest.id == guest_id).first()
    
    if not db_guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitado no encontrado"
        )
    
    db_guest.activo = False
    db.commit()
    
    return None


@router.get("/search/", response_model=List[GuestResponse])
def search_guests(
    q: str,
    db: Session = Depends(get_db)
):
    """
    Buscar invitados por nombre, apellido o empresa
    """
    search_term = f"%{q}%"
    guests = db.query(Guest).filter(
        (Guest.nombre.ilike(search_term)) |
        (Guest.apellido.ilike(search_term)) |
        (Guest.empresa.ilike(search_term))
    ).filter(Guest.activo == True).limit(20).all()
    
    return guests
