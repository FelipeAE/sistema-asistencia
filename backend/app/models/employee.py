"""
Modelo de Empleado
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base


class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rut = Column(String(12), unique=True, nullable=False, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100))
    telefono = Column(String(20))
    departamento = Column(String(50))
    cargo = Column(String(50))
    restricciones_alimentarias = Column(Text)
    foto_url = Column(String(255))
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_actualizacion = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Employee {self.nombre} - {self.rut}>"
