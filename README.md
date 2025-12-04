# Sistema de Asistencia - Casino

Sistema completo de registro de asistencia para comedor de casino con panel administrativo, gestión de empleados e invitados, recetario digital y generación de reportes.

## 📋 Características

### Funcionalidades Principales
- ✅ **Registro de Asistencia**: Registro rápido por RUT chileno con validación Módulo 11
- 👥 **Gestión de Empleados**: CRUD completo con importación masiva desde Excel/CSV
- 🎫 **Gestión de Invitados**: Registro y seguimiento de visitantes externos con empresa y región
- 📖 **Recetario Digital**: Base de datos de recetas con búsqueda avanzada por ingredientes, categorías y alérgenos
- 📊 **Dashboard Estadístico**: Visualización de métricas diarias, semanales y mensuales
- 📈 **Reportes Exportables**: Generación de reportes en Excel y CSV con pandas
- 🔐 **Autenticación JWT**: Sistema de login seguro para administradores con roles
- 📸 **Gestión de Fotos**: Carga y optimización automática de fotos de empleados/invitados
- 🍽️ **Horarios y Menús**: Configuración de horarios de comida y menús diarios

### Tecnologías

**Backend:**
- Python 3.13 + FastAPI 0.115.5
- SQLAlchemy 2.0.36 (ORM)
- SQLite (migrable a PostgreSQL/MySQL)
- Pandas 2.2.3+ (análisis y reportes)
- JWT/Bcrypt (autenticación segura)
- Pillow 11.0.0+ (procesamiento imágenes)
- rut-chile 2.0.1+ (validación RUT chileno)
- openpyxl (Excel)

**Frontend:**
- React 18 + Vite 5
- TailwindCSS 3.4
- React Router 6
- Fetch API

## 🚀 Instalación

### Prerrequisitos
- Python 3.13 o superior
- Node.js 18 o superior
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone https://github.com/FelipeAE/sistema-asistencia.git
cd sistema-asistencia
```

### 2. Configurar Backend

```bash
# Ir a directorio backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual (Windows)
.\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Volver a la raíz del proyecto
cd ..

# Inicializar base de datos
python scripts/init_db.py

# Crear usuario admin por defecto (usuario: admin, contraseña: admin)
python scripts/create_default_admin.py

# (Opcional) Cargar datos de ejemplo
python scripts/seed_data.py
```

### 3. Configurar Frontend

```bash
# Ir a directorio frontend
cd ../frontend

# Instalar dependencias
npm install
```

## 🎯 Uso

### Modo Desarrollo

**Iniciar Backend:**
```bash
cd backend
.\venv\Scripts\activate  # Windows
python run.py
```
El backend estará disponible en: http://localhost:8000  
Documentación API: http://localhost:8000/docs

**Iniciar Frontend:**
```bash
cd frontend
npm run dev
```
El frontend estará disponible en: http://localhost:5173

### Credenciales por Defecto
- **Usuario**: `admin`
- **Contraseña**: `admin`

⚠️ **Importante**: Cambiar estas credenciales en producción

## 📚 Rutas del Sistema

- `/` - Página de registro de asistencia
- `/recipes` - Recetario digital
- `/login` - Inicio de sesión administrador
- `/admin` - Dashboard administrativo
- `/admin/employees` - Gestión de empleados
- `/admin/guests` - Gestión de invitados
- `/admin/reports` - Reportes y exportación

## 🔧 API Endpoints

Ver documentación completa en: http://localhost:8000/docs

**Públicos:**
- `GET /api/employees/{rut}` - Buscar empleado
- `POST /api/attendance/employee` - Registrar asistencia
- `GET /api/recipes/search` - Buscar recetas
- `GET /api/menus/today` - Menú del día

**Protegidos (requieren token JWT):**
- `POST /api/auth/login` - Login
- `GET /api/dashboard/stats/*` - Estadísticas
- `GET/POST/PUT/DELETE /api/employees` - CRUD empleados
- `POST /api/import/employees` - Importar Excel/CSV
- `GET /api/reports/*` - Reportes exportables

## 📊 Características Especiales

### Validación RUT Chileno
- Módulo 11 completo
- Formateo automático
- Soporte dígito verificador K

### Importación Masiva
- Excel (.xlsx, .xls) y CSV
- Validación automática
- Plantilla descargable
- Reporte de errores

### Reportes
- Excel y CSV
- Múltiples hojas
- Filtros avanzados
- Estadísticas agrupadas

## 🧪 Testing

```bash
cd backend
.\venv\Scripts\activate
pytest
```

## 🔒 Seguridad

- Bcrypt para contraseñas
- JWT tokens (24h)
- CORS configurado
- Validación de entrada

## 🚢 Deployment

```bash
# Build frontend
cd frontend
npm run build

# Backend (cambia ENVIRONMENT=production en .env)
cd ../backend
python run.py
```

Sistema en: http://localhost:8000

## 📄 Licencia

MIT License

---

Desarrollado con ❤️ usando Python FastAPI y React
