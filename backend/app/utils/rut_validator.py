"""
Validador de RUT chileno usando Módulo 11
"""


def validate_rut(rut: str) -> bool:
    """
    Valida un RUT chileno usando el algoritmo de Módulo 11
    
    Args:
        rut: RUT en formato 12345678-9 o 12.345.678-9
        
    Returns:
        True si el RUT es válido, False en caso contrario
    """
    if not rut:
        return False
    
    # Limpiar el RUT
    rut = rut.replace(".", "").replace("-", "").upper()
    
    # Verificar que tenga al menos 2 caracteres (número + dígito verificador)
    if len(rut) < 2:
        return False
    
    # Separar número y dígito verificador
    rut_num = rut[:-1]
    dv = rut[-1]
    
    # Verificar que la parte numérica sea válida
    if not rut_num.isdigit():
        return False
    
    # Calcular dígito verificador
    calculated_dv = calculate_dv(rut_num)
    
    return calculated_dv == dv


def calculate_dv(rut_num: str) -> str:
    """
    Calcula el dígito verificador de un RUT usando Módulo 11
    
    Args:
        rut_num: Parte numérica del RUT (sin dígito verificador)
        
    Returns:
        Dígito verificador calculado (puede ser 0-9 o K)
    """
    # Invertir el número
    reversed_digits = rut_num[::-1]
    
    # Multiplicadores del 2 al 7 (se repiten cíclicamente)
    multipliers = [2, 3, 4, 5, 6, 7]
    
    # Calcular suma
    total = 0
    for i, digit in enumerate(reversed_digits):
        multiplier = multipliers[i % 6]
        total += int(digit) * multiplier
    
    # Calcular módulo 11
    remainder = total % 11
    dv = 11 - remainder
    
    # Casos especiales
    if dv == 11:
        return "0"
    elif dv == 10:
        return "K"
    else:
        return str(dv)


def format_rut(rut: str) -> str:
    """
    Formatea un RUT al formato estándar 12.345.678-9
    
    Args:
        rut: RUT sin formato o con formato parcial
        
    Returns:
        RUT formateado
    """
    # Limpiar el RUT
    rut = rut.replace(".", "").replace("-", "").upper()
    
    if len(rut) < 2:
        return rut
    
    # Separar número y dígito verificador
    rut_num = rut[:-1]
    dv = rut[-1]
    
    # Formatear con puntos
    formatted = ""
    for i, digit in enumerate(reversed(rut_num)):
        if i > 0 and i % 3 == 0:
            formatted = "." + formatted
        formatted = digit + formatted
    
    return f"{formatted}-{dv}"
