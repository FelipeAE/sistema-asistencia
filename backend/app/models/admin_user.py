"""
Modelo de Usuario Administrador
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from ..database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    nombre_completo = Column(String(100))
    rol = Column(String(20), default="admin")  # admin, super_admin
    activo = Column(Boolean, default=True)
    ultimo_acceso = Column(DateTime(timezone=True))
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<AdminUser {self.username} - {self.rol}>"
