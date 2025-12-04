import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a /login si no hay token válido
 */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')

  // Si no hay token o usuario, redirigir a login
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  // Verificar si el token parece válido (no ha expirado)
  try {
    // Decodificar el payload del JWT (sin verificar firma)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Convertir a milisegundos
    
    if (Date.now() >= expirationTime) {
      // Token expirado, limpiar y redirigir
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      return <Navigate to="/login" replace />
    }
  } catch (error) {
    // Token mal formado, limpiar y redirigir
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    return <Navigate to="/login" replace />
  }

  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
}

export default ProtectedRoute
