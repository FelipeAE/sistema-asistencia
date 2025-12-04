"""
Tests de integración para API de empleados
"""
import pytest
from app.models.employee import Employee


class TestEmployeesAPI:
    """Tests para endpoints de empleados"""
    
    def test_create_employee(self, client, sample_employee_data):
        """Test crear empleado"""
        response = client.post("/api/employees", json=sample_employee_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data['rut'] == sample_employee_data['rut']
        assert data['nombre'] == sample_employee_data['nombre']
        assert 'id' in data
    
    def test_create_employee_duplicate_rut(self, client, sample_employee_data):
        """Test crear empleado con RUT duplicado"""
        # Crear primero
        client.post("/api/employees", json=sample_employee_data)
        
        # Intentar crear de nuevo
        response = client.post("/api/employees", json=sample_employee_data)
        
        assert response.status_code == 400
    
    def test_get_employee_by_rut(self, client, sample_employee_data):
        """Test obtener empleado por RUT"""
        # Crear empleado
        client.post("/api/employees", json=sample_employee_data)
        
        # Obtener por RUT
        rut = sample_employee_data['rut']
        response = client.get(f"/api/employees/{rut}")
        
        assert response.status_code == 200
        data = response.json()
        assert data['rut'] == rut
    
    def test_get_employee_not_found(self, client):
        """Test obtener empleado inexistente"""
        response = client.get("/api/employees/99999999-9")
        
        assert response.status_code == 404
    
    def test_list_employees(self, client, sample_employee_data):
        """Test listar empleados"""
        # Crear algunos empleados
        client.post("/api/employees", json=sample_employee_data)
        
        # Listar
        response = client.get("/api/employees")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_update_employee(self, client, sample_employee_data):
        """Test actualizar empleado"""
        # Crear empleado
        create_response = client.post("/api/employees", json=sample_employee_data)
        employee_id = create_response.json()['id']
        
        # Actualizar
        update_data = {"cargo": "Chef Principal"}
        response = client.put(f"/api/employees/{employee_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data['cargo'] == "Chef Principal"
    
    def test_delete_employee(self, client, sample_employee_data):
        """Test eliminar (desactivar) empleado"""
        # Crear empleado
        create_response = client.post("/api/employees", json=sample_employee_data)
        employee_id = create_response.json()['id']
        
        # Eliminar
        response = client.delete(f"/api/employees/{employee_id}")
        
        assert response.status_code == 200
        
        # Verificar que está inactivo
        get_response = client.get(f"/api/employees/{sample_employee_data['rut']}")
        assert get_response.json()['activo'] is False


class TestAttendanceAPI:
    """Tests para endpoints de asistencia"""
    
    def test_register_employee_attendance(self, client, sample_employee_data):
        """Test registrar asistencia de empleado"""
        # Crear empleado primero
        client.post("/api/employees", json=sample_employee_data)
        
        # Registrar asistencia
        attendance_data = {
            "rut": sample_employee_data['rut'],
            "tipo_comida": "almuerzo"
        }
        response = client.post("/api/attendance/employee", json=attendance_data)
        
        assert response.status_code == 201
        data = response.json()
        assert 'id' in data
        assert data['tipo_comida'] == 'almuerzo'
    
    def test_get_attendance_today(self, client):
        """Test obtener asistencias del día"""
        response = client.get("/api/attendance/today")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
