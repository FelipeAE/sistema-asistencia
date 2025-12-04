"""
Servicio de validación de RUT chileno
Utiliza la librería rut-chile para validación robusta de RUTs chilenos
"""
from rut_chile import rut_chile


class RUTValidator:
    """
    Clase para validación y formateo de RUTs chilenos
    """

    @staticmethod
    def validate(rut_str: str) -> bool:
        """
        Valida un RUT chileno usando la librería rut-chile

        Args:
            rut_str: RUT en formato 12345678-9 o 12.345.678-9 o 123456789

        Returns:
            bool: True si el RUT es válido, False en caso contrario

        Examples:
            >>> RUTValidator.validate("12.345.678-9")
            True
            >>> RUTValidator.validate("12345678-9")
            True
            >>> RUTValidator.validate("123456789")
            True
            >>> RUTValidator.validate("00000000-0")
            False
        """
        if not rut_str:
            return False

        try:
            # Usar rut_chile para validar
            return rut_chile.is_valid_rut(rut_str)
        except Exception:
            return False

    @staticmethod
    def format(rut_str: str) -> str:
        """
        Formatea un RUT con puntos y guión usando rut-chile

        Args:
            rut_str: RUT sin formato o con formato

        Returns:
            str: RUT formateado (ej: 12.345.678-9)

        Examples:
            >>> RUTValidator.format("123456789")
            "12.345.678-9"
            >>> RUTValidator.format("12345678-9")
            "12.345.678-9"
        """
        if not rut_str:
            return rut_str

        try:
            # Usar rut_chile para formatear
            return rut_chile.format_rut_with_dots(rut_str)
        except Exception:
            return rut_str

    @staticmethod
    def clean(rut_str: str) -> str:
        """
        Limpia un RUT eliminando puntos y guiones

        Args:
            rut_str: RUT con o sin formato

        Returns:
            str: RUT sin formato (solo números y dígito verificador)

        Examples:
            >>> RUTValidator.clean("12.345.678-9")
            "123456789"
            >>> RUTValidator.clean("12345678-9")
            "123456789"
        """
        if not rut_str:
            return ""

        return rut_str.replace('.', '').replace('-', '').strip().upper()


# Funciones de compatibilidad con código existente
def validate_rut(rut_str: str) -> bool:
    """
    Función de compatibilidad que llama a RUTValidator.validate()

    Args:
        rut_str: RUT a validar

    Returns:
        bool: True si el RUT es válido
    """
    return RUTValidator.validate(rut_str)


def format_rut(rut_str: str) -> str:
    """
    Función de compatibilidad que llama a RUTValidator.format()

    Args:
        rut_str: RUT a formatear

    Returns:
        str: RUT formateado
    """
    return RUTValidator.format(rut_str)


def clean_rut(rut_str: str) -> str:
    """
    Función de compatibilidad que llama a RUTValidator.clean()

    Args:
        rut_str: RUT a limpiar

    Returns:
        str: RUT limpio
    """
    return RUTValidator.clean(rut_str)
