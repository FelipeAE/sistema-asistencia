"""
API Endpoints para Upload de Fotos
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path

from ..database import get_db
from ..models.employee import Employee
from ..models.guest import Guest
from ..models.recipe import Recipe
from ..services.photo_service import PhotoService
from ..config import settings

router = APIRouter()


@router.post("/employee/{employee_id}")
async def upload_employee_photo(
    employee_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Subir foto de empleado
    """
    # Verificar que el empleado existe
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )
    
    # Eliminar foto anterior si existe
    if employee.foto_url:
        PhotoService.delete_photo(employee.foto_url)
    
    # Guardar nueva foto
    photo_url, error = await PhotoService.save_photo(file, "employee")
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    
    # Actualizar empleado
    employee.foto_url = photo_url
    db.commit()
    
    return {
        "message": "Foto subida correctamente",
        "photo_url": photo_url
    }


@router.post("/guest/{guest_id}")
async def upload_guest_photo(
    guest_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Subir foto de invitado
    """
    # Verificar que el invitado existe
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitado no encontrado"
        )
    
    # Eliminar foto anterior si existe
    if guest.foto_url:
        PhotoService.delete_photo(guest.foto_url)
    
    # Guardar nueva foto
    photo_url, error = await PhotoService.save_photo(file, "guest")
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    
    # Actualizar invitado
    guest.foto_url = photo_url
    db.commit()
    
    return {
        "message": "Foto subida correctamente",
        "photo_url": photo_url
    }


@router.get("/photos/{filename}")
async def get_photo(filename: str):
    """
    Servir foto almacenada
    """
    file_path = settings.PHOTOS_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Foto no encontrada"
        )
    
    return FileResponse(file_path)


@router.delete("/employee/{employee_id}/photo")
def delete_employee_photo(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """
    Eliminar foto de empleado
    """
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado"
        )
    
    if not employee.foto_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El empleado no tiene foto"
        )
    
    # Eliminar archivo
    PhotoService.delete_photo(employee.foto_url)
    
    # Actualizar base de datos
    employee.foto_url = None
    db.commit()
    
    return {"message": "Foto eliminada correctamente"}


@router.delete("/guest/{guest_id}/photo")
def delete_guest_photo(
    guest_id: int,
    db: Session = Depends(get_db)
):
    """
    Eliminar foto de invitado
    """
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitado no encontrado"
        )
    
    if not guest.foto_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El invitado no tiene foto"
        )
    
    # Eliminar archivo
    PhotoService.delete_photo(guest.foto_url)

    # Actualizar base de datos
    guest.foto_url = None
    db.commit()

    return {"message": "Foto eliminada correctamente"}


@router.post("/recipe/{recipe_id}")
async def upload_recipe_photo(
    recipe_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Subir foto de receta
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receta no encontrada"
        )

    # Eliminar foto anterior si existe
    if recipe.foto_url and recipe.foto_url.startswith("/photos/"):
        PhotoService.delete_photo(recipe.foto_url)

    # Guardar nueva foto
    photo_url, error = await PhotoService.save_photo(file, "recipe")
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )

    # Actualizar receta
    recipe.foto_url = photo_url
    db.commit()

    return {
        "message": "Foto subida correctamente",
        "photo_url": photo_url
    }


@router.delete("/recipe/{recipe_id}")
def delete_recipe_photo(
    recipe_id: int,
    db: Session = Depends(get_db)
):
    """
    Eliminar foto de receta
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Receta no encontrada"
        )

    if not recipe.foto_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La receta no tiene foto"
        )

    # Eliminar archivo si es local
    if recipe.foto_url.startswith("/photos/"):
        PhotoService.delete_photo(recipe.foto_url)

    # Actualizar base de datos
    recipe.foto_url = None
    db.commit()

    return {"message": "Foto eliminada correctamente"}
