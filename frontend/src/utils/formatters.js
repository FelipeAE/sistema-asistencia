import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea una fecha al formato DD/MM/YYYY
 */
export const formatDate = (date) => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd/MM/yyyy', { locale: es })
}

/**
 * Formatea una hora al formato HH:mm
 */
export const formatTime = (time) => {
  if (!time) return ''
  const timeObj = typeof time === 'string' ? parseISO(time) : time
  return format(timeObj, 'HH:mm')
}

/**
 * Formatea una fecha y hora completa
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const dateObj = typeof dateTime === 'string' ? parseISO(dateTime) : dateTime
  return format(dateObj, "dd/MM/yyyy 'a las' HH:mm", { locale: es })
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
export const getCurrentDate = () => {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Obtiene la hora actual en formato HH:mm:ss
 */
export const getCurrentTime = () => {
  return format(new Date(), 'HH:mm:ss')
}
