import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await authAPI.login(username, password)

      // Guardar token
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirigir al dashboard
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="card max-w-md w-full border border-gray-200">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Panel Administrativo
          </h1>
          <p className="text-gray-600">
            Sistema de Asistencia Casino
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuario */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-field"
              autoFocus
              disabled={loading}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Link volver */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Volver al registro de asistencia
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
