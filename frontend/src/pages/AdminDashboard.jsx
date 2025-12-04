import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardAPI } from '../services/api'

function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    today: null,
    employees: null,
    guests: null
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    loadStats()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      navigate('/login')
      return
    }

    setUser(JSON.parse(userData))
  }

  const loadStats = async () => {
    const token = localStorage.getItem('access_token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      // Cargar estadísticas en paralelo
      const [todayData, employeesData, guestsData] = await Promise.all([
        dashboardAPI.getStatsToday(),
        dashboardAPI.getStatsEmployees(),
        dashboardAPI.getStatsGuests()
      ])

      setStats({
        today: todayData,
        employees: employeesData,
        guests: guestsData
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-gradient-to-r from-indigo-800 to-indigo-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <span className="font-bold text-xl text-white">
                Dashboard Administrativo
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-indigo-100">
                <span className="font-medium text-white">{user?.nombre_completo}</span>
                <span className="text-indigo-200 ml-2">({user?.rol})</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Vista general del sistema</p>
        </div>

        {/* Stats Cards - Hoy */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-4xl font-bold mb-1 text-white">
              {stats.today?.total_asistencias || 0}
            </div>
            <div className="text-white font-medium text-lg">Asistencias Hoy</div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-green-600 to-green-700 shadow-lg">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-4xl font-bold mb-1 text-white">
              {stats.today?.empleados || 0}
            </div>
            <div className="text-white font-medium text-lg">Empleados</div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg">
            <div className="text-3xl mb-2">🎫</div>
            <div className="text-4xl font-bold mb-1 text-white">
              {stats.today?.invitados || 0}
            </div>
            <div className="text-white font-medium text-lg">Invitados</div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 shadow-lg">
            <div className="text-3xl mb-2">🏢</div>
            <div className="text-4xl font-bold mb-1 text-white">
              {stats.employees?.total_activos || 0}
            </div>
            <div className="text-white font-medium text-lg">Empleados Activos</div>
          </div>
        </div>

        {/* Asistencias por Tipo de Comida */}
        {stats.today?.por_tipo_comida && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Asistencias por Tipo de Comida (Hoy)
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(stats.today.por_tipo_comida).map(([tipo, count]) => {
                const icons = { desayuno: '🌅', almuerzo: '🍽️', cena: '🌙' }
                return (
                  <div key={tipo} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl mb-1">{icons[tipo]}</div>
                        <div className="text-sm text-gray-600 capitalize">{tipo}</div>
                      </div>
                      <div className="text-3xl font-bold text-gray-800">{count}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Top Empleados del Mes */}
        {stats.employees?.top_asistencias_mes && stats.employees.top_asistencias_mes.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Top Empleados del Mes
            </h2>
            <div className="space-y-2">
              {stats.employees.top_asistencias_mes.slice(0, 5).map((emp, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{emp.nombre}</div>
                      <div className="text-sm text-gray-500">{emp.area || 'Sin área'}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{emp.asistencias}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estadísticas de Invitados */}
        {stats.guests && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Por Empresa */}
            {stats.guests.top_empresas && stats.guests.top_empresas.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Invitados por Empresa
                </h2>
                <div className="space-y-2">
                  {stats.guests.top_empresas.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-gray-700">{item.empresa || 'Sin empresa'}</span>
                      <span className="font-semibold text-gray-800">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Por Región */}
            {stats.guests.por_region && stats.guests.por_region.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Invitados por Región
                </h2>
                <div className="space-y-2">
                  {stats.guests.por_region.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-gray-700">{item.region || 'Sin región'}</span>
                      <span className="font-semibold text-gray-800">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Links rápidos */}
        <div className="card mt-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Gestión del Sistema
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/employees')}
              className="p-4 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-left border border-blue-200"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-bold text-blue-900">Gestión de Empleados</div>
              <div className="text-sm text-blue-700 mt-1">CRUD completo de empleados</div>
            </button>
            
            <button
              onClick={() => navigate('/admin/guests')}
              className="p-4 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors text-left border border-purple-200"
            >
              <div className="text-2xl mb-2">🎫</div>
              <div className="font-bold text-purple-900">Gestión de Invitados</div>
              <div className="text-sm text-purple-700 mt-1">CRUD completo de invitados</div>
            </button>

            <button
              onClick={() => navigate('/admin/menus')}
              className="p-4 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors text-left border border-yellow-200"
            >
              <div className="text-2xl mb-2">🍽️</div>
              <div className="font-bold text-yellow-900">Gestión de Menús</div>
              <div className="text-sm text-yellow-700 mt-1">Menús diarios del casino</div>
            </button>

            <button
              onClick={() => navigate('/admin/recipes')}
              className="p-4 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors text-left border border-orange-200"
            >
              <div className="text-2xl mb-2">📖</div>
              <div className="font-bold text-orange-900">Gestión de Recetas</div>
              <div className="text-sm text-orange-700 mt-1">CRUD completo de recetas</div>
            </button>
            
            <button
              onClick={() => navigate('/admin/reports')}
              className="p-4 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors text-left border border-indigo-200"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-bold text-indigo-900">Reportes</div>
              <div className="text-sm text-indigo-700 mt-1">Exportar datos y estadísticas</div>
            </button>

            <button
              onClick={() => navigate('/admin/stats')}
              className="p-4 bg-pink-100 hover:bg-pink-200 rounded-lg transition-colors text-left border border-pink-200"
            >
              <div className="text-2xl mb-2">📈</div>
              <div className="font-bold text-pink-900">Estadísticas Visuales</div>
              <div className="text-sm text-pink-700 mt-1">Gráficos y análisis visual</div>
            </button>
          </div>
        </div>

        {/* Enlaces públicos */}
        <div className="card mt-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Acceso Rápido
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-4 bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-left border border-green-200"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-bold text-green-900">Registro de Asistencia</div>
              <div className="text-sm text-green-700 mt-1">Ir a la página principal</div>
            </button>
            
            <button
              onClick={() => navigate('/recipes')}
              className="p-4 bg-teal-100 hover:bg-teal-200 rounded-lg transition-colors text-left border border-teal-200"
            >
              <div className="text-2xl mb-2">📖</div>
              <div className="font-bold text-teal-900">Recetario</div>
              <div className="text-sm text-teal-700 mt-1">Ver recetas disponibles</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
