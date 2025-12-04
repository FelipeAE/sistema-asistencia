"""
API Endpoints para Menús Diarios
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..database import get_db
from ..models.menu import DailyMenu
from ..schemas.menu import DailyMenuCreate, DailyMenuUpdate, DailyMenuResponse
from ..dependencies import get_current_user
from ..utils.timezone import get_chile_today

router = APIRouter()


@router.get("/", response_model=List[DailyMenuResponse])
def list_menus(
    fecha: Optional[date] = None,
    tipo_comida: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Listar menús con filtros opcionales
    """
    query = db.query(DailyMenu)
    
    if fecha:
        query = query.filter(DailyMenu.fecha == fecha)
    
    if tipo_comida:
        query = query.filter(DailyMenu.tipo_comida == tipo_comida.lower())
    
    menus = query.order_by(DailyMenu.fecha.desc()).offset(skip).limit(limit).all()
    return menus


@router.get("/today")
def get_today_menu(
    tipo_comida: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Obtener menú del día actual (zona horaria Chile)
    """
    today = get_chile_today()
    query = db.query(DailyMenu).filter(
        DailyMenu.fecha == today,
        DailyMenu.activo == True
    )
    
    if tipo_comida:
        query = query.filter(DailyMenu.tipo_comida == tipo_comida.lower())
    
    menus = query.all()
    
    if not menus:
        return {"message": "No hay menú configurado para hoy", "menus": []}
    
    return {"menus": [DailyMenuResponse.from_orm(m) for m in menus]}


@router.get("/{menu_id}", response_model=DailyMenuResponse)
def get_menu(menu_id: int, db: Session = Depends(get_db)):
    """
    Obtener menú por ID
    """
    menu = db.query(DailyMenu).filter(DailyMenu.id == menu_id).first()
    
    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menú no encontrado"
        )
    
    return menu


@router.post("/", response_model=DailyMenuResponse, status_code=status.HTTP_201_CREATED)
def create_menu(
    menu: DailyMenuCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Crear nuevo menú
    """
    # Verificar si ya existe un menú para esa fecha y tipo de comida
    existing = db.query(DailyMenu).filter(
        DailyMenu.fecha == menu.fecha,
        DailyMenu.tipo_comida == menu.tipo_comida.lower()
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un menú para {menu.fecha} - {menu.tipo_comida}"
        )
    
    db_menu = DailyMenu(
        fecha=menu.fecha,
        tipo_comida=menu.tipo_comida.lower(),
        entrada=menu.entrada,
        plato_principal=menu.plato_principal,
        postre=menu.postre,
        ensalada=menu.ensalada,
        bebida=menu.bebida,
        descripcion=menu.descripcion,
        opciones_dieteticas=menu.opciones_dieteticas,
        activo=menu.activo
    )
    
    db.add(db_menu)
    db.commit()
    db.refresh(db_menu)
    
    return db_menu


@router.put("/{menu_id}", response_model=DailyMenuResponse)
def update_menu(
    menu_id: int,
    menu: DailyMenuUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Actualizar menú existente
    """
    db_menu = db.query(DailyMenu).filter(DailyMenu.id == menu_id).first()
    
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menú no encontrado"
        )
    
    # Actualizar campos proporcionados
    update_data = menu.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_menu, field, value)
    
    db.commit()
    db.refresh(db_menu)
    
    return db_menu


@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu(
    menu_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Desactivar menú
    """
    db_menu = db.query(DailyMenu).filter(DailyMenu.id == menu_id).first()
    
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menú no encontrado"
        )
    
    db_menu.activo = False
    db.commit()
    
    return None
