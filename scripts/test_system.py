# Script de Testing Manual - Sistema de Asistencia Casino
# Ejecutar con: python scripts/test_system.py
# Requiere: Backend corriendo en http://localhost:8000

import requests
import json
from datetime import datetime, date

BASE_URL = "http://localhost:8000/api"
TOKEN = None

def print_header(text):
    print("\n" + "="*60)
    print(f" {text}")
    print("="*60)

def print_result(test_name, success, details=""):
    status = "[OK]" if success else "[FAIL]"
    print(f"  {status} {test_name}")
    if details and not success:
        print(f"       -> {details}")

def test_login():
    """Test login y obtener token"""
    print_header("TEST: Autenticacion")
    global TOKEN
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"username": "admin", "password": "admin"}
        )
        
        if response.status_code == 200:
            data = response.json()
            TOKEN = data.get("access_token")
            print_result("Login admin/admin", True)
            return True
        else:
            print_result("Login admin/admin", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_result("Login admin/admin", False, str(e))
        return False

def test_employees():
    """Test endpoints de empleados"""
    print_header("TEST: Empleados")
    
    headers = {"Authorization": f"Bearer {TOKEN}"} if TOKEN else {}
    
    # Listar empleados
    try:
        response = requests.get(f"{BASE_URL}/employees", headers=headers)
        print_result("GET /employees", response.status_code == 200, f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /employees", False, str(e))
    
    # Buscar por RUT
    try:
        response = requests.get(f"{BASE_URL}/employees/12.345.678-5")
        if response.status_code == 200:
            print_result("GET /employees/12.345.678-5", True)
        elif response.status_code == 404:
            print_result("GET /employees/12.345.678-5", True, "No encontrado (esperado si no hay datos)")
        else:
            print_result("GET /employees/12.345.678-5", False, f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /employees/{rut}", False, str(e))

def test_guests():
    """Test endpoints de invitados"""
    print_header("TEST: Invitados")
    
    headers = {"Authorization": f"Bearer {TOKEN}"} if TOKEN else {}
    
    try:
        response = requests.get(f"{BASE_URL}/guests", headers=headers)
        print_result("GET /guests", response.status_code == 200, f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /guests", False, str(e))

def test_recipes():
    """Test endpoints de recetas"""
    print_header("TEST: Recetas")
    
    # Listar recetas (publico)
    try:
        response = requests.get(f"{BASE_URL}/recipes")
        print_result("GET /recipes (publico)", response.status_code == 200, f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /recipes", False, str(e))
    
    # Buscar recetas
    try:
        response = requests.get(f"{BASE_URL}/recipes/search?q=cazuela")
        print_result("GET /recipes/search?q=cazuela", response.status_code == 200)
    except Exception as e:
        print_result("GET /recipes/search", False, str(e))
    
    # Categorias
    try:
        response = requests.get(f"{BASE_URL}/recipes/categories")
        print_result("GET /recipes/categories", response.status_code == 200)
    except Exception as e:
        print_result("GET /recipes/categories", False, str(e))

def test_menus():
    """Test endpoints de menus"""
    print_header("TEST: Menus")
    
    # Menu del dia (publico)
    try:
        response = requests.get(f"{BASE_URL}/menus/today")
        print_result("GET /menus/today (publico)", response.status_code == 200)
    except Exception as e:
        print_result("GET /menus/today", False, str(e))
    
    # Listar menus
    try:
        response = requests.get(f"{BASE_URL}/menus")
        print_result("GET /menus", response.status_code == 200)
    except Exception as e:
        print_result("GET /menus", False, str(e))

def test_meal_schedules():
    """Test endpoints de horarios"""
    print_header("TEST: Horarios de Comida")
    
    try:
        response = requests.get(f"{BASE_URL}/meal-schedules")
        if response.status_code == 200:
            data = response.json()
            print_result("GET /meal-schedules", True)
            for schedule in data:
                print(f"       -> {schedule.get('tipo_comida', 'N/A')}: {schedule.get('hora_inicio', 'N/A')} - {schedule.get('hora_fin', 'N/A')}")
        else:
            print_result("GET /meal-schedules", False, f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /meal-schedules", False, str(e))

def test_dashboard():
    """Test endpoints del dashboard"""
    print_header("TEST: Dashboard (requiere auth)")
    
    if not TOKEN:
        print("  [SKIP] No hay token de autenticacion")
        return
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    
    # Stats hoy
    try:
        response = requests.get(f"{BASE_URL}/dashboard/stats/today", headers=headers)
        print_result("GET /dashboard/stats/today", response.status_code == 200, f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /dashboard/stats/today", False, str(e))
    
    # Stats empleados
    try:
        response = requests.get(f"{BASE_URL}/dashboard/stats/employees", headers=headers)
        print_result("GET /dashboard/stats/employees", response.status_code == 200)
    except Exception as e:
        print_result("GET /dashboard/stats/employees", False, str(e))
    
    # Stats invitados
    try:
        response = requests.get(f"{BASE_URL}/dashboard/stats/guests", headers=headers)
        print_result("GET /dashboard/stats/guests", response.status_code == 200)
    except Exception as e:
        print_result("GET /dashboard/stats/guests", False, str(e))

def test_reports():
    """Test endpoints de reportes"""
    print_header("TEST: Reportes (requiere auth)")
    
    if not TOKEN:
        print("  [SKIP] No hay token de autenticacion")
        return
    
    headers = {"Authorization": f"Bearer {TOKEN}"}
    today = date.today()
    start_date = f"{today.year}-{today.month:02d}-01"
    end_date = today.strftime("%Y-%m-%d")
    
    # Stats por tipo de comida
    try:
        response = requests.get(
            f"{BASE_URL}/reports/stats/by-meal-type?start_date={start_date}&end_date={end_date}",
            headers=headers
        )
        print_result("GET /reports/stats/by-meal-type", response.status_code == 200)
    except Exception as e:
        print_result("GET /reports/stats/by-meal-type", False, str(e))
    
    # Stats diarias
    try:
        response = requests.get(
            f"{BASE_URL}/reports/stats/daily?start_date={start_date}&end_date={end_date}",
            headers=headers
        )
        print_result("GET /reports/stats/daily", response.status_code == 200)
    except Exception as e:
        print_result("GET /reports/stats/daily", False, str(e))
    
    # Top departamentos
    try:
        response = requests.get(
            f"{BASE_URL}/reports/stats/top-departments?month={today.month}&year={today.year}",
            headers=headers
        )
        print_result("GET /reports/stats/top-departments", response.status_code == 200)
    except Exception as e:
        print_result("GET /reports/stats/top-departments", False, str(e))
    
    # Reporte mensual empleados
    try:
        response = requests.get(
            f"{BASE_URL}/reports/employees/monthly?month={today.month}&year={today.year}&format=excel",
            headers=headers
        )
        # Puede ser 200 (con datos) o retornar JSON con mensaje si no hay datos
        success = response.status_code == 200 or (response.status_code == 200 and "message" in response.text)
        print_result("GET /reports/employees/monthly", success, f"Status: {response.status_code}")
    except Exception as e:
        print_result("GET /reports/employees/monthly", False, str(e))

def test_attendance():
    """Test endpoint de asistencia"""
    print_header("TEST: Asistencia")
    
    # Este test solo verifica que el endpoint responda
    try:
        response = requests.get(f"{BASE_URL}/attendance/today")
        print_result("GET /attendance/today", response.status_code in [200, 404])
    except Exception as e:
        print_result("GET /attendance/today", False, str(e))

def main():
    print("\n" + "#"*60)
    print("#  TESTING SISTEMA DE ASISTENCIA CASINO")
    print("#  Fecha: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("#"*60)
    
    # Verificar que el servidor este corriendo
    try:
        response = requests.get(f"{BASE_URL.replace('/api', '')}/docs", timeout=5)
        if response.status_code != 200:
            print("\n[ERROR] El servidor no esta respondiendo correctamente")
            print("        Asegurate de que el backend este corriendo en http://localhost:8000")
            return
    except requests.exceptions.ConnectionError:
        print("\n[ERROR] No se puede conectar al servidor")
        print("        Ejecuta: cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000")
        return
    except Exception as e:
        print(f"\n[ERROR] Error de conexion: {e}")
        return
    
    print("\n[OK] Servidor backend detectado")
    
    # Ejecutar tests
    test_login()
    test_employees()
    test_guests()
    test_recipes()
    test_menus()
    test_meal_schedules()
    test_attendance()
    test_dashboard()
    test_reports()
    
    print("\n" + "="*60)
    print(" TESTING COMPLETADO")
    print("="*60)
    print("\nPara probar el frontend, abre: http://localhost:5173")
    print("Ejecuta: cd frontend && npm run dev")

if __name__ == "__main__":
    main()
