"""
Modelo de Registro de Asistencia
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Time, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=True)
    fecha = Column(Date, nullable=False, index=True)
    hora = Column(Time, nullable=False)
    tipo_comida = Column(String(20), nullable=False)  # desayuno, almuerzo, cena
    menu_id = Column(Integer, ForeignKey("daily_menus.id"), nullable=True)
    observaciones = Column(Text)
    es_invitado = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    employee = relationship("Employee", backref="attendance_records")
    guest = relationship("Guest", backref="attendance_records")
    menu = relationship("DailyMenu", backref="attendance_records")
    
    # Constraints
    __table_args__ = (
        CheckConstraint(
            "(employee_id IS NOT NULL AND guest_id IS NULL) OR (employee_id IS NULL AND guest_id IS NOT NULL)",
            name="check_employee_or_guest"
        ),
    )
    
    def __repr__(self):
        if self.employee_id:
            return f"<AttendanceRecord Employee:{self.employee_id} {self.fecha} {self.tipo_comida}>"
        return f"<AttendanceRecord Guest:{self.guest_id} {self.fecha} {self.tipo_comida}>"
