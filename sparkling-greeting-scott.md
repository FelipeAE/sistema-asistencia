# Plan de Implementación: Sistema de Asistencia para Casino

## Resumen Ejecutivo

Sistema de asistencia para casino (comedor) que permite registrar asistencia diaria mediante RUT chileno, con panel administrativo y gestión de menús. Diseñado para funcionar en red local sin internet, con capacidad de migración futura a cloud.

**Contexto:**
- Sin conexión a internet actualmente (posible a futuro)
- PC básico como servidor local
- 50-200 personas/día
- Base de datos de empleados existente en Excel/CSV
- Presupuesto limitado: $5-20/mes para cloud futuro

## Stack Tecnológico Recomendado

### Backend: Python + FastAPI

**Justificación:**
- Ligero y eficiente (~100-200MB RAM)
- Python 3.13.1 ya instalado en el sistema
- Excelente soporte para validación de RUT chileno (librería `python-rut`)
- Procesamiento de Excel/CSV nativo con `pandas`
- Fácil migración a cloud (Railway, Render, AWS, etc.)
- API auto-documentada con Swagger

### Frontend: React + Vite

**Justificación:**
- Mejor UX para funcionalidades complejas (recetario, búsqueda, fotos)
- Componentes reutilizables (tarjetas de empleados, búsqueda de recetas)
- Estado centralizado para manejo de invitados y empleados
- Ecosistema robusto (bibliotecas de UI, charts, búsqueda)
- Vite: build rápido y desarrollo ágil
- Producción: archivos estáticos servidos por FastAPI
- Responsive con TailwindCSS o Material-UI

### Base de Datos: SQLite

**Justificación:**
- Cero configuración (archivo único)
- No requiere servidor de base de datos separado
- Ideal para 200 usuarios/día (soporta 100k+ registros)
- ACID compliant (transacciones confiables)
- Fácil backup (copiar archivo)
- Migración simple a PostgreSQL cuando se vaya a cloud

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│              RED LOCAL (192.168.x.x)                    │
│                                                         │
│  PCs Cliente (Navegador) ──────┐                       │
│                                 │                       │
│                                 ▼                       │
│                    ┌──────────────────────┐            │
│                    │    PC Servidor       │            │
│                    │  (http://192.168.    │            │
│                    │     x.x:8000)        │            │
│                    │                      │            │
│                    │  ┌────────────────┐ │            │
│                    │  │ FastAPI App    │ │            │
│                    │  │ (Python)       │ │            │
│                    │  └────────┬───────┘ │            │
│                    │           │          │            │
│                    │  ┌────────▼───────┐ │            │
│                    │  │  SQLite DB     │ │            │
│                    │  │ (asistencia.db)│ │            │
│                    │  └────────────────┘ │            │
│                    └──────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

## Esquema de Base de Datos

### Tabla: employees
- `id`: Autoincremental
- `rut`: VARCHAR(12) UNIQUE NOT NULL - RUT chileno
- `nombre`: VARCHAR(100) NOT NULL
- `email`: VARCHAR(100)
- `telefono`: VARCHAR(20)
- `departamento`: VARCHAR(50)
- `cargo`: VARCHAR(50)
- `restricciones_alimentarias`: TEXT - Alergias/dietas
- `foto_url`: VARCHAR(255) - URL o path a foto del empleado
- `activo`: BOOLEAN DEFAULT TRUE
- `fecha_creacion`, `fecha_actualizacion`: TIMESTAMP

### Tabla: guests (Invitados)
- `id`: Autoincremental
- `nombre`: VARCHAR(100) NOT NULL
- `apellido`: VARCHAR(100) NOT NULL
- `empresa`: VARCHAR(100) - Empresa u origen
- `region`: VARCHAR(50) - Región de procedencia
- `motivo_visita`: TEXT - Razón de la visita
- `email`: VARCHAR(100)
- `telefono`: VARCHAR(20)
- `restricciones_alimentarias`: TEXT
- `foto_url`: VARCHAR(255)
- `fecha_registro`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `activo`: BOOLEAN DEFAULT TRUE

### Tabla: attendance_records
- `id`: Autoincremental
- `employee_id`: FK a employees (NULL si es invitado)
- `guest_id`: FK a guests (NULL si es empleado)
- `fecha`: DATE NOT NULL
- `hora`: TIME NOT NULL
- `tipo_comida`: VARCHAR(20) - "desayuno", "almuerzo", "cena"
- `menu_id`: FK a daily_menus (opcional)
- `observaciones`: TEXT
- `es_invitado`: BOOLEAN DEFAULT FALSE
- `fecha_creacion`: TIMESTAMP
- **Constraint**: CHECK(employee_id IS NOT NULL OR guest_id IS NOT NULL) - Debe ser empleado o invitado
- **Constraint**: UNIQUE(employee_id, fecha, tipo_comida) WHERE employee_id IS NOT NULL
- **Constraint**: UNIQUE(guest_id, fecha, tipo_comida) WHERE guest_id IS NOT NULL

### Tabla: daily_menus
- `id`: Autoincremental
- `fecha`: DATE NOT NULL
- `tipo_comida`: VARCHAR(20)
- `descripcion`: TEXT - Descripción del menú
- `opciones_dieteticas`: TEXT - JSON con opciones vegetarianas, celiacas, etc.
- `activo`: BOOLEAN
- `fecha_creacion`, `fecha_actualizacion`: TIMESTAMP
- **Constraint**: UNIQUE(fecha, tipo_comida)

### Tabla: recipes (Recetario)
- `id`: Autoincremental
- `nombre`: VARCHAR(150) NOT NULL - Nombre del plato
- `descripcion`: TEXT - Descripción breve
- `ingredientes`: TEXT NOT NULL - Lista de ingredientes (JSON array)
- `preparacion`: TEXT NOT NULL - Pasos de preparación
- `tiempo_preparacion`: INTEGER - Minutos
- `porciones`: INTEGER - Número de porciones
- `alergenos`: TEXT - Alérgenos (JSON array: ["gluten", "lactosa", "maní"])
- `categoria`: VARCHAR(50) - "entrada", "principal", "postre", "acompañamiento", "bebida"
- `foto_url`: VARCHAR(255)
- `activo`: BOOLEAN DEFAULT TRUE
- `fecha_creacion`, `fecha_actualizacion`: TIMESTAMP
- **Index**: nombre (para búsqueda)
- **Index**: categoria

### Tabla: meal_schedules (Horarios de Comida)
- `id`: Autoincremental
- `tipo_comida`: VARCHAR(20) UNIQUE - "desayuno", "almuerzo", "cena"
- `hora_inicio`: TIME NOT NULL - Hora de inicio permitida
- `hora_fin`: TIME NOT NULL - Hora de fin permitida
- `dias_semana`: VARCHAR(50) - JSON array de días permitidos: ["lunes", "martes", ...]
- `activo`: BOOLEAN DEFAULT TRUE
- `permite_excepciones`: BOOLEAN DEFAULT TRUE - Si admins pueden registrar fuera de horario

### Tabla: admin_users
- `id`: Autoincremental
- `username`: VARCHAR(50) UNIQUE
- `password_hash`: VARCHAR(255) - Bcrypt
- `nombre_completo`: VARCHAR(100)
- `rol`: VARCHAR(20) - "admin", "super_admin"
- `activo`: BOOLEAN
- `ultimo_acceso`: TIMESTAMP

### Tabla: audit_log
- `id`: Autoincremental
- `usuario`: VARCHAR(50)
- `accion`: VARCHAR(50) - "login", "import", "delete", etc.
- `entidad`: VARCHAR(50)
- `entidad_id`: INTEGER
- `detalles`: TEXT (JSON)
- `ip_address`: VARCHAR(45)
- `fecha_creacion`: TIMESTAMP

## Estructura del Proyecto

```
sistema-asistencia/
│
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app entry point
│   │   ├── config.py                  # Configuración
│   │   ├── database.py                # Conexión DB
│   │   │
│   │   ├── models/                    # SQLAlchemy models
│   │   │   ├── employee.py
│   │   │   ├── attendance.py
│   │   │   ├── menu.py
│   │   │   └── admin_user.py
│   │   │
│   │   ├── schemas/                   # Pydantic schemas
│   │   │   ├── employee.py
│   │   │   ├── attendance.py
│   │   │   └── menu.py
│   │   │
│   │   ├── api/                       # API endpoints
│   │   │   ├── employees.py
│   │   │   ├── attendance.py
│   │   │   ├── menus.py
│   │   │   ├── reports.py
│   │   │   └── admin.py
│   │   │
│   │   ├── services/                  # Lógica de negocio
│   │   │   ├── rut_validator.py       # Validación RUT chileno
│   │   │   ├── import_service.py      # Importación Excel/CSV
│   │   │   ├── attendance_service.py
│   │   │   ├── report_service.py
│   │   │   └── auth_service.py
│   │   │
│   │   └── utils/
│   │       ├── security.py            # Password hashing, JWT
│   │       └── validators.py
│   │
│   ├── data/
│   │   ├── asistencia.db              # SQLite DB
│   │   ├── uploads/                   # Archivos Excel temporales
│   │   └── exports/                   # Reportes generados
│   │
│   ├── tests/
│   │   ├── test_rut_validator.py
│   │   ├── test_attendance.py
│   │   └── test_import.py
│   │
│   ├── requirements.txt
│   └── run.py                         # Script de inicio
│
├── frontend/                          # React + Vite
│   ├── public/
│   │   └── assets/                    # Imágenes estáticas
│   │
│   ├── src/
│   │   ├── main.jsx                   # Entry point React
│   │   ├── App.jsx                    # Componente principal
│   │   │
│   │   ├── components/                # Componentes reutilizables
│   │   │   ├── EmployeeCard.jsx
│   │   │   ├── GuestForm.jsx
│   │   │   ├── RecipeCard.jsx
│   │   │   ├── RecipeSearch.jsx
│   │   │   ├── MenuDisplay.jsx
│   │   │   └── PhotoUpload.jsx
│   │   │
│   │   ├── pages/                     # Páginas/vistas
│   │   │   ├── AttendancePage.jsx     # Registro asistencia
│   │   │   ├── LoginPage.jsx          # Login admin
│   │   │   ├── AdminDashboard.jsx     # Dashboard admin
│   │   │   ├── RecipesPage.jsx        # Recetario
│   │   │   └── ReportsPage.jsx        # Reportes
│   │   │
│   │   ├── services/                  # API calls
│   │   │   ├── api.js                 # Cliente API
│   │   │   ├── employeeService.js
│   │   │   ├── guestService.js
│   │   │   ├── attendanceService.js
│   │   │   └── recipeService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── rutValidator.js        # Validación RUT frontend
│   │   │   ├── formatters.js          # Formato fechas, RUT
│   │   │   └── timeValidator.js       # Validación horarios
│   │   │
│   │   └── styles/
│   │       └── index.css              # Estilos globales (TailwindCSS)
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── scripts/
│   ├── init_db.py                     # Inicializar BD
│   ├── create_admin.py                # Crear primer admin
│   ├── backup_db.sh                   # Script de backup
│   └── migrate_to_cloud.py            # Migración cloud
│
├── docs/
│   ├── INSTALLATION.md
│   └── USER_GUIDE.md
│
├── .env.example
├── .gitignore
└── README.md
```

## Funcionalidades Principales

### 1. Registro de Asistencia (Usuario Final)

**Para Empleados:**
- Empleado ingresa RUT en pantalla
- Sistema valida formato RUT chileno
- Muestra información del empleado con foto (nombre, departamento, cargo)
- Valida horario permitido según tipo de comida (desayuno/almuerzo/cena)
- Guarda registro de asistencia con fecha/hora/tipo de comida
- Previene registros duplicados (mismo día/comida)
- Muestra menú del día con link al recetario

**Para Invitados:**
- Botón "Registrar Invitado"
- Formulario rápido: nombre, apellido, empresa, región
- Foto opcional (cámara web o upload)
- Registro de asistencia sin RUT
- Restricciones alimentarias opcionales

### 2. Panel Administrativo
- Login con usuario/contraseña
- Dashboard con estadísticas:
  - Asistencia del día (empleados vs invitados)
  - Gráficos de tendencias
  - Asistencia por departamento
  - Restricciones alimentarias
  - Conteo de invitados por empresa/región

**Gestión de Empleados:**
- CRUD completo (crear, editar, desactivar)
- Upload de fotos (individual o batch)
- Importación desde Excel/CSV

**Gestión de Invitados:**
- Ver historial de invitados
- Buscar por nombre/empresa/región
- Editar restricciones alimentarias
- Marcar como inactivos

**Gestión de Menús:**
- Crear menú del día
- Asociar recetas al menú
- Opciones dietéticas
- Calendario de menús

**Control de Horarios:**
- Configurar horarios permitidos por tipo de comida
- Desayuno: 07:00 - 09:30
- Almuerzo: 12:00 - 14:30
- Cena: 19:00 - 21:00
- Excepciones para admins/invitados

**Reportes:**
- Reporte diario/semanal/mensual
- Exportación a Excel/CSV/PDF
- Histórico de asistencia por empleado
- Reportes de invitados
- Reportes de restricciones alimentarias

### 3. Recetario Interactivo

**Funcionalidades:**
- Búsqueda por nombre de plato
- Búsqueda por ingrediente (ej: "tomate", "pollo")
- Filtros por categoría (entrada, principal, postre, etc.)
- Filtros por alérgenos (sin gluten, sin lactosa, etc.)
- Vista detallada de receta:
  - Nombre y descripción
  - Lista de ingredientes
  - Pasos de preparación
  - Tiempo de preparación
  - Porciones
  - Foto del plato
  - Alérgenos

**Gestión (Admin):**
- CRUD de recetas
- Upload de fotos de platos
- Categorización
- Marcado de alérgenos

**Integración:**
- Link desde menú del día a recetas
- Búsqueda rápida en pantalla de asistencia
- Sugerencias basadas en restricciones alimentarias del empleado

### 4. Importación de Datos
- Carga archivo Excel (.xlsx) o CSV
- Validación de RUTs
- Detección de duplicados (actualiza en lugar de crear)
- Reporte de errores detallado
- Formato esperado: RUT, Nombre, Email, Telefono, Departamento, Cargo, Restricciones, Foto_URL (opcional)

## Plan de Implementación (Fases)

### Fase 1: Setup del Proyecto (1 día)

**Backend:**
- Crear estructura de directorios
- Configurar entorno virtual Python
- Crear `requirements.txt` con dependencias
- Configurar `.env` y variables de entorno
- Inicializar Git

**Frontend:**
- Crear proyecto React con Vite
- Configurar TailwindCSS
- Configurar estructura de carpetas (components, pages, services)
- Configurar React Router
- Configurar proxy para desarrollo

**Archivos clave:**
- `backend/requirements.txt`
- `backend/.env`
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/tailwind.config.js`
- `.gitignore`

### Fase 2: Base de Datos (1.5 días)
- Crear TODOS los modelos SQLAlchemy (employees, guests, attendance, menus, recipes, meal_schedules, admin_users, audit_log)
- Configurar conexión a SQLite
- Script de inicialización de BD
- Script para crear primer usuario admin
- Datos de ejemplo (seed data) para testing

**Archivos clave:**
- `backend/app/database.py`
- `backend/app/models/employee.py`
- `backend/app/models/guest.py`
- `backend/app/models/attendance.py`
- `backend/app/models/menu.py`
- `backend/app/models/recipe.py`
- `backend/app/models/meal_schedule.py`
- `backend/app/models/admin_user.py`
- `backend/app/models/audit_log.py`
- `scripts/init_db.py`
- `scripts/create_admin.py`
- `scripts/seed_data.py`

### Fase 3: Backend API - Core (2 días)
- Configurar FastAPI
- Implementar validación de RUT chileno
- Endpoints de empleados (CRUD)
- Endpoint de registro de asistencia
- Pruebas con Swagger

**Archivos clave:**
- `backend/app/main.py`
- `backend/app/services/rut_validator.py`
- `backend/app/api/employees.py`
- `backend/app/api/attendance.py`

**Endpoints principales:**
```
POST /api/attendance/register    # Registrar asistencia
GET  /api/employees/{rut}        # Buscar empleado por RUT
GET  /api/employees              # Listar empleados
POST /api/employees              # Crear empleado
```

### Fase 4: Backend API - Invitados y Fotos (1.5 días)
- Endpoints de invitados (CRUD)
- Endpoint para upload de fotos (empleados e invitados)
- Servicio de almacenamiento de fotos
- Validación de tamaños/formatos
- Endpoint de registro de asistencia actualizado para invitados

**Archivos clave:**
- `backend/app/api/guests.py`
- `backend/app/api/photos.py`
- `backend/app/services/photo_service.py`
- `backend/app/api/attendance.py` (actualizar)

**Endpoints adicionales:**
```
POST /api/guests                 # Crear invitado
GET  /api/guests                 # Listar invitados
PUT  /api/guests/{id}            # Actualizar invitado
POST /api/upload/photo           # Upload foto
```

### Fase 5: Backend API - Recetario y Horarios (1.5 días)
- Endpoints del recetario (CRUD)
- Búsqueda de recetas por nombre/ingredientes
- Filtros por categoría/alérgenos
- Endpoints de horarios de comida
- Validación de horarios en asistencia

**Archivos clave:**
- `backend/app/api/recipes.py`
- `backend/app/services/recipe_search_service.py`
- `backend/app/api/meal_schedules.py`
- `backend/app/services/time_validation_service.py`

**Endpoints:**
```
POST /api/recipes                       # Crear receta
GET  /api/recipes                       # Listar/buscar recetas
GET  /api/recipes/search?q=tomate       # Búsqueda
PUT  /api/recipes/{id}                  # Actualizar
GET  /api/meal-schedules                # Horarios configurados
PUT  /api/meal-schedules/{id}           # Actualizar horarios
```

### Fase 6: Frontend React - Página de Asistencia (2 días)
- Componente de entrada RUT
- Componente EmployeeCard con foto
- Formulario de registro de invitados (GuestForm)
- Validación de horarios en frontend
- Componente de confirmación
- Mostrar menú del día con link a recetas

**Archivos clave:**
- `frontend/src/pages/AttendancePage.jsx`
- `frontend/src/components/EmployeeCard.jsx`
- `frontend/src/components/GuestForm.jsx`
- `frontend/src/components/MenuDisplay.jsx`
- `frontend/src/components/PhotoUpload.jsx`
- `frontend/src/services/attendanceService.js`
- `frontend/src/utils/rutValidator.js`

### Fase 7: Frontend React - Recetario (1.5 días)
- Página de recetario
- Componente de búsqueda
- Tarjetas de recetas (RecipeCard)
- Vista detallada de receta
- Filtros por categoría/alérgenos

**Archivos clave:**
- `frontend/src/pages/RecipesPage.jsx`
- `frontend/src/components/RecipeSearch.jsx`
- `frontend/src/components/RecipeCard.jsx`
- `frontend/src/services/recipeService.js`

### Fase 8: Autenticación y Panel Admin Base (1.5 días)
- Servicio de autenticación (JWT)
- Hash de contraseñas (bcrypt)
- Página de login React
- Middleware de autenticación
- Rutas protegidas
- Dashboard base con estadísticas

**Archivos clave:**
- `backend/app/services/auth_service.py`
- `backend/app/utils/security.py`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/AdminDashboard.jsx`
- `frontend/src/services/api.js` (auth headers)

### Fase 9: Panel Admin - Gestión Completa (2 días)
- Gestión de empleados (CRUD con fotos)
- Gestión de invitados
- Gestión de menús
- Gestión de recetas
- Configuración de horarios
- Importación de empleados desde Excel/CSV

**Archivos clave:**
- `frontend/src/pages/AdminDashboard.jsx`
- `backend/app/services/import_service.py`
- `backend/app/api/import.py`
- `backend/app/api/menus.py`

### Fase 10: Reportes y Estadísticas (1.5 días)
- Servicio de reportes
- Endpoints de estadísticas
- Página de reportes React
- Exportación a Excel/CSV/PDF
- Gráficos (Chart.js o Recharts)
- Reportes de invitados

**Archivos clave:**
- `backend/app/services/report_service.py`
- `backend/app/api/reports.py`
- `frontend/src/pages/ReportsPage.jsx`

**Reportes:**
- Asistencia diaria/semanal/mensual
- Por departamento
- Por tipo de comida
- Restricciones alimentarias
- Histórico por empleado

### Fase 11: Testing (1.5 días)
- Tests unitarios backend (RUT, validaciones)
- Tests de integración (API endpoints)
- Tests unitarios frontend (React components)
- Pruebas end-to-end (registro empleados e invitados)
- Pruebas con datos reales
- Performance testing (200 usuarios/día)
- Tests en PC básico
- Testing de búsqueda de recetas
- Validación de horarios

**Archivos clave:**
- `backend/tests/test_rut_validator.py`
- `backend/tests/test_attendance.py`
- `backend/tests/test_recipes.py`
- `frontend/src/components/__tests__/`

### Fase 12: Build y Deployment (1.5 días)
- Build de producción del frontend React
- Configurar FastAPI para servir archivos estáticos de React
- Script de deployment completo
- Guía de instalación detallada
- Manual de usuario
- Configuración de Windows Firewall
- Auto-inicio en Windows (Task Scheduler)
- Script de backup automático
- Documentación de endpoints API

**Archivos clave:**
- `backend/app/main.py` (servir archivos estáticos)
- `docs/INSTALLATION.md`
- `docs/USER_GUIDE.md`
- `docs/API.md`
- `scripts/deploy.bat`
- `scripts/backup_db.sh`

## Deployment en Red Local

### Requisitos del Servidor PC
- CPU: Intel Celeron o equivalente (2+ GHz)
- RAM: 2GB mínimo (4GB recomendado)
- Almacenamiento: 5GB libres
- SO: Windows 7+ (64-bit)
- Red: Conexión Ethernet o WiFi

### Instalación

1. **Instalar Python** (ya instalado: 3.13.1)

2. **Instalar Node.js** (v18 o superior)
   - Descargar de https://nodejs.org/
   - Instalar con configuración predeterminada

3. **Clonar/copiar proyecto**
```bash
cd C:\Users\fiae\sistema-asistencia
```

4. **Backend Setup**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

5. **Frontend Setup**
```bash
cd frontend
npm install
npm run build
```

6. **Configurar variables de entorno** (`.env`):
```
DATABASE_URL=sqlite:///./data/asistencia.db
SECRET_KEY=cambiar-por-clave-segura
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8000
UPLOAD_DIR=./data/uploads
PHOTOS_DIR=./data/photos
```

6. **Inicializar base de datos**
```bash
python scripts\init_db.py
python scripts\create_admin.py
```

7. **Ejecutar aplicación**
```bash
python backend\run.py
```

8. **Configurar Windows Firewall**
- Abrir puerto 8000 TCP
- Permitir conexiones en red privada

9. **Obtener IP local del servidor**
```bash
ipconfig
# Buscar IPv4 Address (ej: 192.168.1.100)
```

10. **Acceder desde PCs clientes**
- Navegador: `http://192.168.1.100:8000`

### Auto-inicio (Opcional)
- Configurar tarea en Windows Task Scheduler
- Trigger: Al iniciar sistema
- Acción: Ejecutar `run.py`

## Dependencias Python

```
fastapi==0.109.0          # Framework web
uvicorn==0.27.0           # Servidor ASGI
sqlalchemy==2.0.25        # ORM
pydantic==2.5.3           # Validación datos
pandas==2.2.0             # Excel/CSV
openpyxl==3.1.2           # Soporte Excel
python-rut==0.3.0         # Validación RUT chileno
python-multipart==0.0.6   # Upload archivos
bcrypt==4.1.2             # Hash contraseñas
pyjwt==2.8.0              # Tokens JWT
```

**Tamaño total:** ~150MB
**RAM en ejecución:** ~200-300MB

## Estrategia de Backup

### Backup Automático Diario
```bash
# scripts/backup_db.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp data/asistencia.db backups/asistencia_$TIMESTAMP.db
# Mantener últimos 30 días
find backups/ -name "asistencia_*.db" -mtime +30 -delete
```

### Backup Manual
- Copiar `data/asistencia.db` a USB o carpeta compartida

## Migración Futura a Cloud

### Cambios Mínimos Requeridos

**1. Cambiar URL de base de datos:**
```python
# backend/app/config.py
import os
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/asistencia.db")
```

**2. Migrar datos SQLite → PostgreSQL:**
```bash
python scripts/migrate_to_cloud.py
```

**3. Deploy a plataforma cloud:**

**Opción A: Railway (Recomendada - $5/mes)**
- Crear cuenta en Railway
- Conectar repositorio GitHub
- PostgreSQL incluido automáticamente
- Deploy automático

**Opción B: Render (Free tier disponible)**
- Similar a Railway
- Tier gratuito con limitaciones
- $7/mes tier pagado

**Opción C: AWS/GCP ($10-20/mes)**
- Más control
- Requiere más configuración

## Costos

### Actual (Red Local): $0/mes
- Hardware existente
- Software open-source
- Red local existente

### Futuro (Cloud): $5-20/mes
- Railway: $5/mes (recomendado)
- Render: $7-14/mes
- AWS/GCP: $10-20/mes

## Seguridad

### En Red Local
- Aislamiento de red (no expuesto a internet)
- Autenticación admin (usuario/contraseña)
- Hash de contraseñas (bcrypt)
- Protección SQL injection (ORM)
- CORS restringido a IPs locales

### En Cloud (Futuro)
- HTTPS (SSL/TLS)
- Rate limiting
- Two-factor authentication
- Encriptación de datos sensibles
- Actualizaciones de seguridad regulares

## Timeline Estimado

| Fase | Duración | Entregable |
|------|----------|------------|
| 1. Setup Proyecto | 1 día | Backend + Frontend React configurados |
| 2. Base de Datos | 1.5 días | Todos los modelos creados |
| 3. Backend Core | 2 días | APIs empleados y asistencia |
| 4. Backend Invitados/Fotos | 1.5 días | APIs invitados y upload fotos |
| 5. Backend Recetario/Horarios | 1.5 días | APIs recetas y validación horarios |
| 6. Frontend Asistencia | 2 días | Página registro empleados e invitados |
| 7. Frontend Recetario | 1.5 días | Búsqueda y visualización de recetas |
| 8. Auth y Admin Base | 1.5 días | Login y dashboard |
| 9. Panel Admin Completo | 2 días | Gestión completa y importación |
| 10. Reportes | 1.5 días | Reportes y exportación |
| 11. Testing | 1.5 días | Tests completos |
| 12. Deploy & Docs | 1.5 días | Build producción y deployment |

**Total: 18-19 días de desarrollo**

## Dependencias

### Backend (Python)
```
# requirements.txt
fastapi==0.109.0          # Framework web
uvicorn==0.27.0           # Servidor ASGI
sqlalchemy==2.0.25        # ORM
pydantic==2.5.3           # Validación datos
pandas==2.2.0             # Excel/CSV
openpyxl==3.1.2           # Soporte Excel
python-rut==0.3.0         # Validación RUT chileno
python-multipart==0.0.6   # Upload archivos
bcrypt==4.1.2             # Hash contraseñas
pyjwt==2.8.0              # Tokens JWT
pillow==10.2.0            # Procesamiento imágenes
python-dateutil==2.8.2    # Utilidades fechas
```

**Tamaño total backend:** ~150MB
**RAM en ejecución:** ~300-400MB

### Frontend (React)
```json
// package.json dependencies
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.0",
  "axios": "^1.6.5",
  "tailwindcss": "^3.4.1",
  "recharts": "^2.10.3",
  "date-fns": "^3.0.6"
}
```

**Tamaño build producción:** ~500KB (gzipped)

## Archivos Críticos para Implementación

### Backend
1. **`backend/app/main.py`** - Entry point FastAPI, rutas y middleware, servir archivos estáticos
2. **`backend/app/api/attendance.py`** - Registro de asistencia (empleados e invitados)
3. **`backend/app/api/guests.py`** - Gestión de invitados
4. **`backend/app/api/recipes.py`** - Recetario con búsqueda
5. **`backend/app/services/rut_validator.py`** - Validación RUT chileno
6. **`backend/app/services/photo_service.py`** - Upload y gestión de fotos
7. **`backend/app/services/time_validation_service.py`** - Validación de horarios
8. **`backend/app/models/employee.py`** - Modelo empleados con foto
9. **`backend/app/models/guest.py`** - Modelo invitados
10. **`backend/app/models/recipe.py`** - Modelo recetario

### Frontend
1. **`frontend/src/App.jsx`** - Componente principal y routing
2. **`frontend/src/pages/AttendancePage.jsx`** - Página de registro
3. **`frontend/src/components/EmployeeCard.jsx`** - Tarjeta empleado con foto
4. **`frontend/src/components/GuestForm.jsx`** - Formulario invitados
5. **`frontend/src/pages/RecipesPage.jsx`** - Página recetario
6. **`frontend/src/components/RecipeSearch.jsx`** - Búsqueda de recetas
7. **`frontend/src/services/attendanceService.js`** - Cliente API asistencia
8. **`frontend/src/utils/rutValidator.js`** - Validación RUT frontend

## Riesgos y Mitigación

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| PC básico insuficiente | Alto | Test temprano en hardware real; optimizar queries |
| Pérdida de datos | Alto | Backups automáticos diarios |
| Errores validación RUT | Medio | Librería probada (python-rut); override manual |
| Conflictos concurrencia | Bajo | SQLite maneja locking; test multi-usuario |
| Variaciones formato Excel | Medio | Parser flexible; documentación clara |

## Resumen de Funcionalidades Clave

### Funcionalidades Core
1. **Registro de Asistencia Dual:** Empleados (con RUT) e Invitados (sin RUT)
2. **Gestión de Fotos:** Upload y visualización de fotos para empleados e invitados
3. **Recetario Interactivo:** Búsqueda por nombre, ingredientes, categoría, alérgenos
4. **Control de Horarios:** Validación de horarios permitidos por tipo de comida
5. **Panel Admin Completo:** Gestión de empleados, invitados, menús, recetas, reportes

### Diferencias vs Plan Inicial
- **Frontend:** React + Vite en lugar de HTML/JS vanilla (mejor UX, componentes reutilizables)
- **Nuevas tablas DB:** guests, recipes, meal_schedules (además de las originales)
- **Upload de fotos:** Sistema completo de gestión de imágenes
- **Recetario:** Sistema completo de búsqueda y visualización de recetas
- **Timeline:** 18-19 días en lugar de 9-10 días (funcionalidades adicionales)

## Próximos Pasos

1. **Revisión y Aprobación:** Usuario revisa y aprueba el plan
2. **Instalar Node.js:** Descargar e instalar Node.js v18+
3. **Fase 1 - Setup:** Configurar backend Python + frontend React con Vite
4. **Fase 2 - Base de Datos:** Crear todos los modelos (employees, guests, recipes, etc.)
5. **Desarrollo Incremental:** Seguir fases 3-12 según timeline
6. **Testing Continuo:** Probar en PC básico durante desarrollo
7. **Deployment:** Build de producción y configuración en red local
