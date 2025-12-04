"""
Modelo de Horarios de Comida
"""
from sqlalchemy import Column, Integer, String, Boolean, Time
from ..database import Base


class MealSchedule(Base):
    __tablename__ = "meal_schedules"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo_comida = Column(String(20), unique=True, nullable=False)  # desayuno, almuerzo, cena
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    dias_semana = Column(String(50))  # JSON array: ["lunes", "martes", ...]
    activo = Column(Boolean, default=True)
    permite_excepciones = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<MealSchedule {self.tipo_comida} {self.hora_inicio}-{self.hora_fin}>"
