/**
 * Valida si la hora actual está dentro del rango permitido
 * @param {string} horaInicio - Hora de inicio en formato HH:mm
 * @param {string} horaFin - Hora de fin en formato HH:mm
 * @returns {boolean} - true si está dentro del rango
 */
export const isTimeInRange = (horaInicio, horaFin) => {
  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  const [startHour, startMin] = horaInicio.split(':').map(Number)
  const [endHour, endMin] = horaFin.split(':').map(Number)

  const startTime = startHour * 60 + startMin
  const endTime = endHour * 60 + endMin

  // Si hora_inicio > hora_fin, el horario cruza la medianoche (ej: 21:00 a 06:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime
  }

  return currentTime >= startTime && currentTime <= endTime
}

/**
 * Determina el tipo de comida según la hora actual y los horarios configurados
 * @param {Array} schedules - Array de horarios del backend
 * @returns {string|null} - 'desayuno', 'almuerzo', 'cena' o null
 */
export const getCurrentMealType = (schedules = []) => {
  if (!schedules || schedules.length === 0) {
    // Fallback a horarios por defecto
    const now = new Date()
    const hour = now.getHours()
    
    if (hour >= 7 && hour < 10) return 'desayuno'
    if (hour >= 12 && hour < 15) return 'almuerzo'
    if (hour >= 19 && hour < 22) return 'cena'
    
    return null
  }

  // Usar horarios del backend
  for (const schedule of schedules) {
    if (schedule.activo && isTimeInRange(schedule.hora_inicio, schedule.hora_fin)) {
      return schedule.tipo_comida
    }
  }
  
  return null
}

/**
 * Obtiene el mensaje de error si la hora está fuera del rango
 * @param {Array} schedules - Array de horarios del backend
 * @returns {string|null} - Mensaje de error o null si está en rango
 */
export const getTimeValidationMessage = (schedules = []) => {
  const mealType = getCurrentMealType(schedules)
  
  if (!mealType) {
    if (schedules && schedules.length > 0) {
      const hours = schedules
        .map(s => `${s.tipo_comida.charAt(0).toUpperCase() + s.tipo_comida.slice(1)}: ${s.hora_inicio}-${s.hora_fin}`)
        .join(', ')
      return `No hay horario de comida disponible en este momento. ${hours}`
    }
    return 'No hay horario de comida disponible en este momento. Desayuno: 7:00-9:30, Almuerzo: 12:00-14:30, Cena: 19:00-21:00'
  }
  
  return null
}
