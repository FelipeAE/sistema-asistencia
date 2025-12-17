# Guía de Instalación - Sistema Asistencia Casino

## Requisitos del Sistema

### Software Requerido
- **Python 3.13+** (recomendado 3.13.1)
- **Node.js 18+** (recomendado 20.x LTS)
- **Git** (opcional, para control de versiones)

### Hardware Mínimo (Servidor)
- CPU: Intel Celeron o equivalente (2+ GHz)
- RAM: 2GB mínimo (4GB recomendado)
- Almacenamiento: 5GB libres
- Red: Conexión Ethernet o WiFi

### Sistema Operativo
- Windows 10/11 (64-bit)
- Windows Server 2016+

---

## Instalación Paso a Paso

### 1. Verificar Python
```bash
python --version
# Debe mostrar Python 3.13.x
```

Si no está instalado, descargar desde: https://python.org/downloads

### 2. Verificar Node.js
```bash
node --version
# Debe mostrar v18.x o superior
```

Si no está instalado, descargar desde: https://nodejs.org

### 3. Clonar/Descargar el Proyecto
```bash
cd C:\Users\[usuario]
git clone [url-repositorio] sistema-asistencia
# O descomprimir el archivo ZIP en C:\Users\[usuario]\sistema-asistencia
```

### 4. Instalar Backend (Python)
```bash
cd C:\Users\[usuario]\sistema-asistencia\backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 5. Instalar Frontend (React)
```bash
cd C:\Users\[usuario]\sistema-asistencia\frontend

# Instalar dependencias
npm install
```

### 6. Configurar Variables de Entorno

Crear archivo `.env` en `backend/`:
```env
DATABASE_URL=sqlite:///./data/asistencia.db
SECRET_KEY=cambiar-por-clave-segura-de-32-caracteres
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8000
UPLOAD_DIR=./data/uploads
PHOTOS_DIR=./data/photos
```

**IMPORTANTE:** Cambiar `SECRET_KEY` por una clave segura y única.

### 7. Inicializar Base de Datos
```bash
cd C:\Users\[usuario]\sistema-asistencia

# Activar entorno virtual
backend\venv\Scripts\activate

# Inicializar base de datos
python scripts\init_db.py

# Crear usuario administrador por defecto
python scripts\create_default_admin.py

# (Opcional) Cargar datos de ejemplo
python scripts\seed_data.py
python scripts\seed_recipes.py
python scripts\seed_menus.py
```

### 8. Compilar Frontend para Producción
```bash
cd C:\Users\[usuario]\sistema-asistencia\frontend
npm run build
```

---

## Ejecutar el Sistema

### Opción A: Modo Desarrollo (Frontend y Backend separados)

**Terminal 1 - Backend:**
```bash
cd C:\Users\[usuario]\sistema-asistencia\backend
venv\Scripts\activate
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\[usuario]\sistema-asistencia\frontend
npm run dev
```

- Backend: http://localhost:8000
- Frontend: http://localhost:5173

### Opción B: Modo Producción (Todo desde Backend)

```bash
cd C:\Users\[usuario]\sistema-asistencia\backend
venv\Scripts\activate
python run.py
```

Acceder a: http://localhost:8000

---

## Configuración de Red Local

### 1. Obtener IP del Servidor
```bash
ipconfig
# Buscar "IPv4 Address" (ej: 192.168.1.100)
```

### 2. Configurar Firewall de Windows

1. Abrir "Firewall de Windows con seguridad avanzada"
2. Ir a "Reglas de entrada" → "Nueva regla"
3. Seleccionar "Puerto" → "TCP" → Puerto: `8000`
4. Permitir la conexión
5. Aplicar a redes "Privadas"
6. Nombre: "Sistema Asistencia Casino"

### 3. Acceder desde otros equipos

En cualquier PC de la red local, abrir navegador:
```
http://192.168.1.100:8000
```
(Reemplazar con la IP real del servidor)

---

## Auto-inicio en Windows

### Opción 1: Usar IniciarSistema.bat
Ejecutar `IniciarSistema.bat` en la raíz del proyecto.

### Opción 2: Programador de Tareas

1. Abrir "Programador de tareas"
2. Crear tarea básica
3. Nombre: "Sistema Asistencia Casino"
4. Desencadenador: "Al iniciar el equipo"
5. Acción: Iniciar programa
   - Programa: `C:\Users\[usuario]\sistema-asistencia\IniciarSistema.bat`
6. Marcar: "Ejecutar con los privilegios más altos"

---

## Solución de Problemas

### Error: "Python no reconocido"
- Reinstalar Python marcando "Add to PATH"
- O agregar manualmente a las variables de entorno

### Error: "Node no reconocido"
- Reinstalar Node.js
- Reiniciar la terminal

### Error: "Puerto 8000 en uso"
```bash
# Encontrar proceso usando el puerto
netstat -ano | findstr :8000
# Terminar proceso
taskkill /PID [numero] /F
```

### Error: "No se puede conectar desde otro PC"
- Verificar que el firewall permite el puerto 8000
- Verificar que ambos PC están en la misma red
- Verificar la IP del servidor con `ipconfig`

### Error de base de datos
```bash
# Eliminar y recrear la base de datos
del backend\data\asistencia.db
python scripts\init_db.py
python scripts\create_default_admin.py
```

### Limpiar caché de Node
```bash
cd frontend
rm -rf node_modules
npm install
```

---

## Credenciales por Defecto

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin   | admin      | Administrador |

**IMPORTANTE:** Cambiar la contraseña del administrador después de la primera instalación.

---

## Estructura de Carpetas

```
sistema-asistencia/
├── backend/
│   ├── app/           # Código fuente
│   ├── data/          # Base de datos y archivos
│   ├── venv/          # Entorno virtual Python
│   └── requirements.txt
├── frontend/
│   ├── src/           # Código fuente React
│   ├── public/        # Archivos estáticos
│   └── dist/          # Build de producción
├── scripts/           # Scripts de utilidad
├── docs/              # Documentación
└── IniciarSistema.bat # Script de inicio
```

---

## Soporte

Para reportar problemas o solicitar ayuda:
1. Revisar esta guía de instalación
2. Consultar el archivo `USER_GUIDE.md`
3. Contactar al administrador del sistema
