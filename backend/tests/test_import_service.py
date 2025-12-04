"""
Tests para servicio de importación
"""
import pytest
import pandas as pd
from io import BytesIO
from app.services.import_service import ImportService


class TestImportService:
    """Tests para servicio de importación"""
    
    def test_normalize_columns(self):
        """Test normalización de nombres de columnas"""
        df = pd.DataFrame({
            'RUT': ['12345678-9'],
            'Nombre': ['Juan'],
            'Apellido': ['Pérez'],
            'Email': ['juan@test.com']
        })
        
        normalized = ImportService.normalize_columns(df)
        
        assert 'rut' in normalized.columns
        assert 'nombre' in normalized.columns
        assert 'apellido' in normalized.columns
        assert 'email' in normalized.columns
    
    def test_validate_dataframe_valid(self):
        """Test validación de DataFrame válido"""
        df = pd.DataFrame({
            'rut': ['12345678-9'],
            'nombre': ['Juan'],
            'apellido': ['Pérez']
        })
        
        result = ImportService.validate_dataframe(df)
        
        assert result['valid'] is True
    
    def test_validate_dataframe_missing_columns(self):
        """Test validación de DataFrame con columnas faltantes"""
        df = pd.DataFrame({
            'nombre': ['Juan'],
            'apellido': ['Pérez']
        })
        
        result = ImportService.validate_dataframe(df)
        
        assert result['valid'] is False
        assert 'rut' in result['missing_columns']
    
    def test_process_employees_valid_data(self):
        """Test procesamiento de empleados con datos válidos"""
        df = pd.DataFrame({
            'rut': ['12345678-9', '98765432-1'],
            'nombre': ['Juan', 'María'],
            'apellido': ['Pérez', 'González'],
            'cargo': ['Chef', 'Cajera'],
            'email': ['juan@test.com', 'maria@test.com']
        })
        
        result = ImportService.process_employees(df)
        
        assert result['success'] is True
        assert result['summary']['valid'] == 2
        assert len(result['valid_employees']) == 2
    
    def test_process_employees_invalid_rut(self):
        """Test procesamiento con RUT inválido"""
        df = pd.DataFrame({
            'rut': ['12345678-0'],  # RUT inválido
            'nombre': ['Juan'],
            'apellido': ['Pérez']
        })
        
        result = ImportService.process_employees(df)
        
        assert result['success'] is True
        assert result['summary']['errors'] > 0
        assert len(result['errors']) > 0
    
    def test_process_employees_missing_name(self):
        """Test procesamiento con nombre faltante"""
        df = pd.DataFrame({
            'rut': ['12345678-9'],
            'nombre': [''],
            'apellido': ['Pérez']
        })
        
        result = ImportService.process_employees(df)
        
        assert result['summary']['errors'] > 0
    
    def test_process_employees_invalid_email(self):
        """Test procesamiento con email inválido"""
        df = pd.DataFrame({
            'rut': ['12345678-9'],
            'nombre': ['Juan'],
            'apellido': ['Pérez'],
            'email': ['invalid-email']
        })
        
        result = ImportService.process_employees(df)
        
        assert result['summary']['errors'] > 0
        assert any('Email inválido' in str(e['error']) for e in result['errors'])
