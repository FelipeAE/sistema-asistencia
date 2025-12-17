# Sistema Asistencia Casino - Frontend

Frontend React para el Sistema de Asistencia del Casino/Comedor.

## Tecnologías

- **React 19** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **TailwindCSS** - Framework de estilos
- **React Router** - Navegación SPA
- **Recharts** - Gráficos estadísticos
- **Axios** - Cliente HTTP
- **date-fns** - Manejo de fechas

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

## Estructura del Proyecto

```
frontend/
├── public/              # Archivos estáticos (iconos, manifest)
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── EmployeeCard.jsx
│   │   ├── GuestForm.jsx
│   │   ├── RecipeCard.jsx
│   │   ├── RecipeDetail.jsx
│   │   ├── MenuDisplay.jsx
│   │   ├── HelpModal.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/           # Páginas/vistas
│   │   ├── AttendancePage.jsx
│   │   ├── RecipesPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminEmployeesPage.jsx
│   │   ├── AdminGuestsPage.jsx
│   │   ├── AdminMenusPage.jsx
│   │   ├── AdminRecipesPage.jsx
│   │   ├── AdminReportsPage.jsx
│   │   └── AdminStatsPage.jsx
│   ├── services/        # Cliente API
│   │   └── api.js
│   ├── utils/           # Utilidades
│   │   ├── rutValidator.js
│   │   └── timeValidator.js
│   ├── App.jsx          # Componente principal y rutas
│   ├── App.css          # Estilos globales
│   └── main.jsx         # Entry point
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Rutas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | AttendancePage | Registro de asistencia |
| `/recipes` | RecipesPage | Recetario público |
| `/login` | LoginPage | Login administrador |
| `/admin` | AdminDashboard | Panel de control |
| `/admin/employees` | AdminEmployeesPage | Gestión empleados |
| `/admin/guests` | AdminGuestsPage | Gestión invitados |
| `/admin/menus` | AdminMenusPage | Gestión menús |
| `/admin/recipes` | AdminRecipesPage | Gestión recetas |
| `/admin/reports` | AdminReportsPage | Reportes |
| `/admin/stats` | AdminStatsPage | Estadísticas |

## Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo (http://localhost:5173)
npm run build    # Compilar para producción
npm run preview  # Previsualizar build de producción
npm run lint     # Ejecutar ESLint
```

## Configuración

### Proxy API (Desarrollo)

En `vite.config.js`, el proxy redirige `/api` al backend:

```javascript
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

### Variables de Entorno

Crear `.env.local` para configuración local:

```env
VITE_API_URL=http://localhost:8000
```

## Build de Producción

```bash
npm run build
```

Los archivos compilados se generan en `dist/` y son servidos por el backend FastAPI.

## Documentación Adicional

- [Guía de Instalación](../docs/INSTALLATION.md)
- [Manual de Usuario](../docs/USER_GUIDE.md)
