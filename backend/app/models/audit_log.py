"""
Modelo de Auditoría
"""
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base


class AuditLog(Base):
    __tablename__ = "audit_log"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario = Column(String(50))
    accion = Column(String(50), index=True)  # login, import, delete, update, etc.
    entidad = Column(String(50))  # employee, guest, attendance, etc.
    entidad_id = Column(Integer)
    detalles = Column(Text)  # JSON con detalles adicionales
    ip_address = Column(String(45))
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<AuditLog {self.usuario} {self.accion} {self.entidad}>"
