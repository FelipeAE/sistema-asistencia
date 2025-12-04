"""
Modelo de Menú Diario
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Text, UniqueConstraint
from sqlalchemy.sql import func
from ..database import Base


class DailyMenu(Base):
    __tablename__ = "daily_menus"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha = Column(Date, nullable=False, index=True)
    tipo_comida = Column(String(20), nullable=False)  # desayuno, almuerzo, cena
    
    # Campos del menú
    entrada = Column(String(200))
    plato_principal = Column(String(200))
    postre = Column(String(200))
    ensalada = Column(String(200))
    bebida = Column(String(200))
    
    descripcion = Column(Text)  # Descripción adicional/notas
    opciones_dieteticas = Column(Text)  # JSON con opciones vegetarianas, celiacas, etc.
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_actualizacion = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        UniqueConstraint('fecha', 'tipo_comida', name='unique_menu_fecha_tipo'),
    )
    
    def __repr__(self):
        return f"<DailyMenu {self.fecha} {self.tipo_comida}>"
