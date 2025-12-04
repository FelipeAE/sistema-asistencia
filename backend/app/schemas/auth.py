"""
Schemas de Pydantic para autenticación
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    """Schema para login"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4)


class TokenResponse(BaseModel):
    """Schema de respuesta con token"""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    """Schema de usuario en respuesta"""
    id: int
    username: str
    nombre_completo: str
    rol: str
    ultimo_acceso: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class AdminUserCreate(BaseModel):
    """Schema para crear usuario admin"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    nombre_completo: str = Field(..., min_length=1, max_length=100)
    rol: str = Field(default="admin", pattern="^(admin|super_admin)$")


class AdminUserUpdate(BaseModel):
    """Schema para actualizar usuario"""
    nombre_completo: Optional[str] = Field(None, min_length=1, max_length=100)
    password: Optional[str] = Field(None, min_length=6)
    rol: Optional[str] = Field(None, pattern="^(admin|super_admin)$")
    activo: Optional[bool] = None
