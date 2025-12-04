"""
Servicio de gestión de fotos
"""
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile
import uuid
from PIL import Image
import io

from ..config import settings


class PhotoService:
    """Servicio para gestión de fotos"""
    
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    MAX_IMAGE_SIZE = (800, 800)  # Redimensionar a máximo 800x800
    
    @staticmethod
    def validate_image(file: UploadFile) -> Tuple[bool, Optional[str]]:
        """
        Valida que el archivo sea una imagen válida
        
        Returns:
            tuple: (es_valido, mensaje_error)
        """
        # Validar extensión
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in PhotoService.ALLOWED_EXTENSIONS:
            return False, f"Formato no permitido. Use: {', '.join(PhotoService.ALLOWED_EXTENSIONS)}"
        
        # Validar tipo MIME
        if not file.content_type or not file.content_type.startswith("image/"):
            return False, "El archivo debe ser una imagen"
        
        return True, None
    
    @staticmethod
    async def save_photo(file: UploadFile, entity_type: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Guarda una foto y retorna la URL
        
        Args:
            file: Archivo subido
            entity_type: Tipo de entidad ("employee" o "guest")
        
        Returns:
            tuple: (url_relativa, mensaje_error)
        """
        # Validar imagen
        is_valid, error_msg = PhotoService.validate_image(file)
        if not is_valid:
            return None, error_msg
        
        try:
            # Leer contenido
            contents = await file.read()
            
            # Validar tamaño
            if len(contents) > PhotoService.MAX_FILE_SIZE:
                return None, f"El archivo es muy grande. Máximo {PhotoService.MAX_FILE_SIZE / 1024 / 1024}MB"
            
            # Abrir imagen con Pillow
            image = Image.open(io.BytesIO(contents))
            
            # Redimensionar si es necesario
            if image.size[0] > PhotoService.MAX_IMAGE_SIZE[0] or image.size[1] > PhotoService.MAX_IMAGE_SIZE[1]:
                image.thumbnail(PhotoService.MAX_IMAGE_SIZE, Image.Resampling.LANCZOS)
            
            # Generar nombre único
            file_ext = Path(file.filename).suffix.lower()
            unique_filename = f"{entity_type}_{uuid.uuid4().hex}{file_ext}"
            
            # Ruta completa
            file_path = settings.PHOTOS_DIR / unique_filename
            
            # Guardar imagen optimizada
            if file_ext in [".jpg", ".jpeg"]:
                image.save(file_path, "JPEG", quality=85, optimize=True)
            elif file_ext == ".png":
                image.save(file_path, "PNG", optimize=True)
            else:
                image.save(file_path)
            
            # Retornar URL relativa
            return f"/photos/{unique_filename}", None
            
        except Exception as e:
            return None, f"Error al procesar imagen: {str(e)}"
    
    @staticmethod
    def delete_photo(photo_url: str) -> bool:
        """
        Elimina una foto del sistema de archivos
        
        Args:
            photo_url: URL relativa de la foto (/photos/filename.jpg)
        
        Returns:
            bool: True si se eliminó correctamente
        """
        try:
            if not photo_url or not photo_url.startswith("/photos/"):
                return False
            
            filename = photo_url.split("/")[-1]
            file_path = settings.PHOTOS_DIR / filename
            
            if file_path.exists():
                file_path.unlink()
                return True
            
            return False
            
        except Exception:
            return False
