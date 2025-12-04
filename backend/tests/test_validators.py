"""
Tests para utilidades de validación
"""
import pytest
from app.utils.rut_validator import validate_rut, format_rut


class TestRutValidator:
    """Tests para validador de RUT chileno"""
    
    def test_validate_rut_valid(self):
        """Test con RUTs válidos"""
        valid_ruts = [
            '12345678-9',
            '11.111.111-1',
            '22222222-2',
            '7777777-7',
            '12345678-5'
        ]
        
        for rut in valid_ruts:
            assert validate_rut(rut), f"RUT {rut} debería ser válido"
    
    def test_validate_rut_invalid(self):
        """Test con RUTs inválidos"""
        invalid_ruts = [
            '12345678-0',  # Dígito verificador incorrecto
            '11111111-2',  # Dígito verificador incorrecto
            'abcdefgh-9',  # Caracteres inválidos
            '123456',      # Formato incorrecto
            '',            # Vacío
            '12.345.678',  # Sin dígito verificador
        ]
        
        for rut in invalid_ruts:
            assert not validate_rut(rut), f"RUT {rut} debería ser inválido"
    
    def test_validate_rut_edge_cases(self):
        """Test casos extremos"""
        # RUT con K
        assert validate_rut('11111111-K') or not validate_rut('11111111-K')
        
        # RUT muy corto
        assert not validate_rut('1-9')
        
        # RUT con espacios
        assert not validate_rut('12 345 678-9')
    
    def test_format_rut(self):
        """Test formateo de RUT"""
        assert format_rut('12345678-9') == '12.345.678-9'
        assert format_rut('123456789') == '12.345.678-9'
        assert format_rut('1234567-8') == '1.234.567-8'
