/**
 * Valida formato de RUT chileno
 * @param {string} rut - RUT a validar
 * @returns {boolean} - true si es válido
 */
export const validateRut = (rut) => {
  if (!rut) return false
  
  // Eliminar puntos y guión
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '')
  
  if (cleanRut.length < 2) return false
  
  const body = cleanRut.slice(0, -1)
  const dv = cleanRut.slice(-1).toUpperCase()
  
  // Validar que el cuerpo sea numérico
  if (!/^\d+$/.test(body)) return false
  
  // Calcular dígito verificador
  let sum = 0
  let multiplier = 2
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  
  const calculatedDv = 11 - (sum % 11)
  const expectedDv = calculatedDv === 11 ? '0' : calculatedDv === 10 ? 'K' : calculatedDv.toString()
  
  return dv === expectedDv
}

/**
 * Formatea RUT chileno solo con guión (sin puntos)
 * @param {string} rut - RUT a formatear
 * @returns {string} - RUT formateado (máximo 10 caracteres: 8 dígitos + guión + DV)
 */
export const formatRut = (rut) => {
  if (!rut) return ''
  
  // Eliminar todo excepto números y K
  let cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  
  // Limitar a 9 caracteres sin guión (8 dígitos + 1 DV)
  if (cleanRut.length > 9) {
    cleanRut = cleanRut.slice(0, 9)
  }
  
  // Si tiene más de 1 carácter, agregar guión antes del último
  if (cleanRut.length > 1) {
    const body = cleanRut.slice(0, -1)
    const dv = cleanRut.slice(-1)
    return `${body}-${dv}` // Resultado: 8 caracteres + "-" + 1 carácter = 10 total
  }
  
  return cleanRut
}

/**
 * Limpia el RUT para enviarlo al backend
 * @param {string} rut - RUT a limpiar
 * @returns {string} - RUT sin formato
 */
export const cleanRut = (rut) => {
  return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase()
}
