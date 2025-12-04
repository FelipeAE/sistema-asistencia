"""
API Endpoints para autenticación
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta

from ..database import get_db
from ..models.admin_user import AdminUser
from ..schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserResponse,
    AdminUserCreate,
    AdminUserUpdate
)
from ..services.auth_service import AuthService
from ..dependencies import get_current_user

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login con username y password, retorna JWT token
    """
    user = AuthService.authenticate_user(db, login_data.username, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    # Crear token
    access_token = AuthService.create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(hours=24)
    )
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.from_orm(user)
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: AdminUser = Depends(get_current_user)):
    """
    Obtener información del usuario actual
    """
    return UserResponse.from_orm(current_user)


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_admin_user(
    user_data: AdminUserCreate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crear nuevo usuario admin (solo super_admin)
    """
    if current_user.rol != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo super_admin puede crear usuarios"
        )
    
    # Verificar si el usuario ya existe
    existing = db.query(AdminUser).filter(
        AdminUser.username == user_data.username
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya existe"
        )
    
    # Crear usuario
    hashed_password = AuthService.hash_password(user_data.password)
    
    new_user = AdminUser(
        username=user_data.username,
        password_hash=hashed_password,
        nombre_completo=user_data.nombre_completo,
        rol=user_data.rol,
        activo=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return UserResponse.from_orm(new_user)


@router.get("/users", response_model=list[UserResponse])
def list_admin_users(
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Listar usuarios admin
    """
    users = db.query(AdminUser).all()
    return [UserResponse.from_orm(u) for u in users]


@router.put("/users/{user_id}", response_model=UserResponse)
def update_admin_user(
    user_id: int,
    user_data: AdminUserUpdate,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar usuario admin
    """
    # Solo super_admin o el mismo usuario puede actualizar
    if current_user.rol != "super_admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para actualizar este usuario"
        )
    
    user = db.query(AdminUser).filter(AdminUser.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Actualizar campos
    update_data = user_data.dict(exclude_unset=True)
    
    if "password" in update_data:
        update_data["password_hash"] = AuthService.hash_password(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return UserResponse.from_orm(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_user(
    user_id: int,
    current_user: AdminUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Desactivar usuario admin
    """
    if current_user.rol != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo super_admin puede desactivar usuarios"
        )
    
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivarte a ti mismo"
        )
    
    user = db.query(AdminUser).filter(AdminUser.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    user.activo = False
    db.commit()
    
    return None
