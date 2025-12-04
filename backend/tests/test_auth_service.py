"""
Tests para servicios de autenticación
"""
import pytest
from datetime import datetime, timedelta
from app.services.auth_service import AuthService


class TestAuthService:
    """Tests para servicio de autenticación"""
    
    def test_hash_password(self):
        """Test de hash de contraseña"""
        password = "test_password123"
        hashed = AuthService.hash_password(password)
        
        # El hash debe ser diferente a la contraseña original
        assert hashed != password
        # El hash debe tener contenido
        assert len(hashed) > 0
        # Dos hashes de la misma contraseña deben ser diferentes (salt)
        hashed2 = AuthService.hash_password(password)
        assert hashed != hashed2
    
    def test_verify_password_correct(self):
        """Test verificación de contraseña correcta"""
        password = "my_secure_password"
        hashed = AuthService.hash_password(password)
        
        assert AuthService.verify_password(password, hashed)
    
    def test_verify_password_incorrect(self):
        """Test verificación de contraseña incorrecta"""
        password = "correct_password"
        wrong_password = "wrong_password"
        hashed = AuthService.hash_password(password)
        
        assert not AuthService.verify_password(wrong_password, hashed)
    
    def test_create_access_token(self):
        """Test creación de token JWT"""
        data = {"sub": "test_user", "user_id": 1}
        token = AuthService.create_access_token(data)
        
        # El token debe tener contenido
        assert len(token) > 0
        # El token debe tener formato JWT (3 partes separadas por punto)
        parts = token.split('.')
        assert len(parts) == 3
    
    def test_decode_token_valid(self):
        """Test decodificación de token válido"""
        data = {"sub": "test_user", "user_id": 1}
        token = AuthService.create_access_token(data)
        
        decoded = AuthService.decode_token(token)
        
        assert decoded is not None
        assert decoded.get('sub') == 'test_user'
        assert decoded.get('user_id') == 1
        assert 'exp' in decoded
    
    def test_decode_token_expired(self):
        """Test decodificación de token expirado"""
        # Crear token con expiración inmediata
        data = {"sub": "test_user"}
        token = AuthService.create_access_token(data, expires_delta=timedelta(seconds=-1))
        
        decoded = AuthService.decode_token(token)
        
        # Token expirado debe retornar None
        assert decoded is None
    
    def test_decode_token_invalid(self):
        """Test decodificación de token inválido"""
        invalid_token = "invalid.token.here"
        
        decoded = AuthService.decode_token(invalid_token)
        
        assert decoded is None
