"""
Servicio de autenticación JWT
"""
from datetime import datetime, timedelta
from typing import Optional
import jwt
from sqlalchemy.orm import Session
import bcrypt

from ..models.admin_user import AdminUser
from ..config import settings


class AuthService:
    """Servicio para autenticación y gestión de tokens"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verifica si la contraseña coincide con el hash
        """
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Genera hash de contraseña con bcrypt
        """
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[AdminUser]:
        """
        Autentica usuario y retorna el objeto AdminUser si es válido
        """
        user = db.query(AdminUser).filter(
            AdminUser.username == username,
            AdminUser.activo == True
        ).first()
        
        if not user:
            return None
        
        if not AuthService.verify_password(password, user.password_hash):
            return None
        
        # Actualizar último acceso
        user.ultimo_acceso = datetime.now()
        db.commit()
        
        return user
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """
        Crea token JWT
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=24)
        
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm="HS256"
        )
        
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> Optional[dict]:
        """
        Decodifica y valida token JWT
        """
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"]
            )
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.JWTError:
            return None
    
    @staticmethod
    def get_current_user(db: Session, token: str) -> Optional[AdminUser]:
        """
        Obtiene usuario actual desde token
        """
        payload = AuthService.decode_token(token)
        
        if not payload:
            return None
        
        username = payload.get("sub")
        if not username:
            return None
        
        user = db.query(AdminUser).filter(
            AdminUser.username == username,
            AdminUser.activo == True
        ).first()
        
        return user
