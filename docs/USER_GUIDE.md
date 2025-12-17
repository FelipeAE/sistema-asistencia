# Manual de Usuario - Sistema Asistencia Casino

## Introducción

El Sistema de Asistencia Casino permite registrar la asistencia de empleados e invitados al comedor/casino de la empresa. Este manual explica cómo usar todas las funcionalidades del sistema.

---

## 1. Registro de Asistencia (Empleados)

### Cómo registrar asistencia

1. En la pantalla principal, ingresa tu **RUT** (sin puntos, con guión)
   - Ejemplo: `12345678-9`
2. Presiona **Enter** o haz clic en **Buscar**
3. Si tienes PIN configurado, ingresa tu **PIN de 4 dígitos**
4. Verifica que tus datos sean correctos (nombre, departamento, foto)
5. Haz clic en **Registrar Asistencia**

### Información mostrada
- Tu nombre completo
- Departamento y cargo
- Foto (si está registrada)
- Restricciones alimentarias (alergias, dietas)
- Menú del día actual

### Errores comunes
- **"RUT no encontrado"**: Contacta al administrador para registrarte
- **"Ya registrado hoy"**: Solo puedes registrarte una vez por comida
- **"Fuera de horario"**: El registro está fuera del horario permitido

---

## 2. Registro de Invitados

### Cómo registrar un invitado

1. En la pantalla principal, haz clic en **Registrar Invitado**
2. Completa el formulario:
   - **Nombre** (obligatorio)
   - **Apellido** (obligatorio)
   - **Empresa** (opcional)
   - **Región de procedencia** (opcional)
   - **Restricciones alimentarias** (opcional)
3. Opcionalmente, toma o sube una foto
4. Haz clic en **Registrar**

---

## 3. Recetario

### Ver recetas disponibles

1. Haz clic en **Recetario** en el menú
2. Usa los filtros para buscar:
   - **Por nombre**: Escribe el nombre del plato
   - **Por ingrediente**: Busca "pollo", "tomate", etc.
   - **Por categoría**: Entrada, Principal, Postre, etc.
   - **Por alérgenos**: Filtra recetas sin gluten, sin lactosa, etc.
   - **Por tiempo**: Filtra por tiempo de preparación

### Ver detalle de una receta

1. Haz clic en cualquier tarjeta de receta
2. Se mostrará:
   - Ingredientes completos
   - Pasos de preparación
   - Tiempo de preparación
   - Número de porciones
   - Alérgenos

---

## 4. Panel de Administración

### Acceder al panel

1. Haz clic en **Admin** o ve a `/login`
2. Ingresa tu usuario y contraseña
3. Credenciales por defecto: `admin` / `admin`

### Dashboard

El dashboard muestra:
- **Asistencia del día**: Total de empleados e invitados
- **Estadísticas por departamento**
- **Restricciones alimentarias del día**
- **Gráficos de tendencias**

---

## 5. Gestión de Empleados (Admin)

### Ver lista de empleados
1. Ir a **Admin → Empleados**
2. Usa los filtros para buscar:
   - Por nombre o RUT
   - Por departamento
   - Por estado (activo/inactivo)

### Agregar nuevo empleado
1. Clic en **Nuevo Empleado**
2. Completa los campos:
   - RUT (obligatorio, formato: 12345678-9)
   - Nombre completo
   - Email
   - Teléfono
   - Departamento
   - Cargo
   - Restricciones alimentarias
   - PIN (4 dígitos, opcional)
3. Opcionalmente, sube una foto
4. Clic en **Guardar**

### Editar empleado
1. Haz clic en el icono de editar (lápiz)
2. Modifica los campos necesarios
3. Clic en **Guardar**

### Desactivar/Activar empleado
1. Haz clic en el toggle de "Activo"
2. Los empleados inactivos no pueden registrar asistencia

### Importar desde Excel/CSV
1. Clic en **Importar**
2. Selecciona un archivo Excel (.xlsx) o CSV
3. El archivo debe tener columnas:
   - RUT, Nombre, Email, Telefono, Departamento, Cargo, Restricciones
4. Revisa el resumen de importación
5. Confirma la importación

---

## 6. Gestión de Invitados (Admin)

### Ver lista de invitados
1. Ir a **Admin → Invitados**
2. Filtra por:
   - Nombre
   - Empresa
   - Región

### Editar invitado
1. Clic en el icono de editar
2. Modifica los datos
3. Guardar cambios

---

## 7. Gestión de Menús (Admin)

### Ver menús
1. Ir a **Admin → Menús**
2. Los menús se muestran por fecha
3. El menú de hoy aparece marcado

### Crear menú del día
1. Clic en **Nuevo Menú**
2. Selecciona:
   - Fecha
   - Tipo de comida (Almuerzo, Cena, etc.)
3. Escribe la descripción del menú
4. Clic en **Guardar**

### Editar menú
1. Clic en el icono de editar
2. Modifica la descripción
3. Guardar

---

## 8. Gestión de Recetas (Admin)

### Agregar nueva receta
1. Ir a **Admin → Recetas**
2. Clic en **Nueva Receta**
3. Completa:
   - Nombre del plato
   - Descripción
   - Ingredientes (uno por línea)
   - Pasos de preparación
   - Tiempo de preparación (minutos)
   - Porciones
   - Categoría
   - Alérgenos (selección múltiple)
4. Opcionalmente, sube una foto
5. Guardar

### Editar receta
1. Clic en editar
2. Modifica los campos
3. Guardar

---

## 9. Reportes y Estadísticas (Admin)

### Generar reportes
1. Ir a **Admin → Reportes**
2. Selecciona el tipo de reporte:
   - **Asistencia**: Por fecha o rango de fechas
   - **Empleados**: Lista completa con datos
   - **Invitados**: Historial de invitados
3. Selecciona formato: **Excel** o **CSV**
4. Clic en **Descargar**

### Ver estadísticas
1. Ir a **Admin → Estadísticas**
2. Visualiza gráficos de:
   - Asistencia diaria/semanal/mensual
   - Distribución por departamento
   - Tendencias históricas
   - Comparativas

---

## 10. Horarios de Comida

El sistema valida automáticamente los horarios permitidos:

| Comida    | Horario        |
|-----------|----------------|
| Desayuno  | 07:00 - 09:30  |
| Almuerzo  | 12:00 - 15:00  |
| Cena      | 19:00 - 21:00  |

Los administradores pueden registrar asistencia fuera de horario si es necesario.

---

## 11. Preguntas Frecuentes (FAQ)

### ¿Qué pasa si olvido mi PIN?
Contacta al administrador para que lo resetee o desactive.

### ¿Puedo registrar asistencia dos veces el mismo día?
No, solo se permite un registro por tipo de comida (desayuno, almuerzo, cena).

### ¿Cómo actualizo mi foto?
Contacta al administrador para que actualice tu foto.

### ¿Qué formato de RUT debo usar?
Sin puntos, con guión. Ejemplo: `12345678-9`

### ¿Cómo reporto un error en mis datos?
Contacta al administrador para corregir cualquier información incorrecta.

### ¿Los invitados necesitan RUT?
No, los invitados se registran con nombre y apellido.

---

## 12. Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| Enter | Buscar empleado / Confirmar |
| Esc   | Cerrar modal / Cancelar |
| Tab   | Navegar entre campos |

---

## Soporte

Si necesitas ayuda adicional:
1. Consulta el botón de **Ayuda (?)** en la aplicación
2. Contacta al administrador del sistema
3. Revisa la documentación técnica en `docs/INSTALLATION.md`
