"""
Modelo de Receta
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Index
from sqlalchemy.sql import func
from ..database import Base


class Recipe(Base):
    __tablename__ = "recipes"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(150), nullable=False, index=True)
    descripcion = Column(Text)
    ingredientes = Column(Text, nullable=False)  # JSON array
    preparacion = Column(Text, nullable=False)
    tiempo_preparacion = Column(Integer)  # Minutos
    porciones = Column(Integer)
    alergenos = Column(Text)  # JSON array: ["gluten", "lactosa", "maní"]
    categoria = Column(String(50), index=True)  # entrada, principal, postre, acompañamiento, bebida
    foto_url = Column(String(255))
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_actualizacion = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_recipe_nombre', 'nombre'),
        Index('idx_recipe_categoria', 'categoria'),
    )
    
    def __repr__(self):
        return f"<Recipe {self.nombre} - {self.categoria}>"
