"""
Utilidades para manejo de zona horaria de Chile
"""
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo

# Zona horaria de Chile
CHILE_TZ = ZoneInfo("America/Santiago")


def get_chile_now() -> datetime:
    """Obtener fecha y hora actual en Chile"""
    return datetime.now(CHILE_TZ)


def get_chile_today() -> date:
    """Obtener fecha actual en Chile"""
    return get_chile_now().date()


def get_chile_time() -> str:
    """Obtener hora actual en Chile como string HH:MM"""
    return get_chile_now().strftime("%H:%M")


def get_chile_datetime_str() -> str:
    """Obtener fecha y hora actual en Chile como string"""
    return get_chile_now().strftime("%Y-%m-%d %H:%M:%S")
