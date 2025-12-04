"""
Modelo de Invitado
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base


class Guest(Base):
    __tablename__ = "guests"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    empresa = Column(String(100))
    region = Column(String(50))
    motivo_visita = Column(Text)
    email = Column(String(100))
    telefono = Column(String(20))
    restricciones_alimentarias = Column(Text)
    foto_url = Column(String(255))
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())
    activo = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<Guest {self.nombre} {self.apellido} - {self.empresa}>"
