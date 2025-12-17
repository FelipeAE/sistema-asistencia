# Pendientes del Proyecto - Sistema Asistencia Casino

## Tareas Pendientes

### 1. Formato Oficial de Excel para Importación
**Estado:** Esperando archivos del cliente

**Descripción:**
Aún no se han recibido los archivos Excel oficiales con el formato real de:
- **Empleados**: Estructura de columnas, campos obligatorios, formato de RUT, etc.
- **Menús**: Formato de descripción, categorías, etc.

**Acción requerida:**
Cuando se reciban los Excel oficiales, revisar y ajustar:
1. `backend/app/services/import_service.py` - Lógica de importación
2. `backend/app/models/employee.py` - Campos del modelo si es necesario
3. `backend/app/models/menu.py` - Campos del modelo si es necesario
4. `backend/app/schemas/` - Schemas de validación
5. Base de datos - Migración si hay nuevos campos

**Notas:**
- El sistema actual espera columnas: RUT, Nombre, Email, Telefono, Departamento, Cargo, Restricciones
- Puede que el formato real sea diferente
- Preparar script de migración de datos si es necesario

---

## Historial de Cambios Pendientes

| Fecha | Descripción | Estado |
|-------|-------------|--------|
| 2024-12-17 | Recibir formato oficial Excel empleados/menús | Pendiente |

---

## Notas Adicionales

- Mantener backup de la base de datos antes de cualquier migración
- Probar importación con datos reales antes de usar en producción
