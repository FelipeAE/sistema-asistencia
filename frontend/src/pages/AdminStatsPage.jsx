import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// Funciones para obtener fecha local en formato YYYY-MM-DD (evita problemas de zona horaria UTC)
const getLocalDate = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getLocalDateDaysAgo = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return getLocalDate(date)
}

function AdminStatsPage() {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: getLocalDateDaysAgo(30),
    end: getLocalDate()
  })
  const [monthYear, setMonthYear] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })

  const [dailyStats, setDailyStats] = useState([])
  const [mealTypeStats, setMealTypeStats] = useState([])
  const [departmentStats, setDepartmentStats] = useState([])

  const navigate = useNavigate()

  // Colores para los gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  const MEAL_COLORS = {
    'Desayuno': '#f59e0b',
    'Almuerzo': '#3b82f6',
    'Cena': '#8b5cf6'
  }

  useEffect(() => {
    loadDailyStats()
    loadMealTypeStats()
  }, [dateRange])

  useEffect(() => {
    loadDepartmentStats()
  }, [monthYear])

  const loadDailyStats = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `http://localhost:8000/api/reports/stats/daily?start_date=${dateRange.start}&end_date=${dateRange.end}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Error al cargar estadísticas diarias')

      const result = await response.json()

      // Agrupar por fecha para mostrar en gráfico de línea
      const grouped = {}
      result.data.forEach(item => {
        if (!grouped[item.Fecha]) {
          grouped[item.Fecha] = { fecha: item.Fecha }
        }
        grouped[item.Fecha][item['Tipo Comida']] = item.Total
      })

      setDailyStats(Object.values(grouped))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const loadMealTypeStats = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `http://localhost:8000/api/reports/stats/by-meal-type?start_date=${dateRange.start}&end_date=${dateRange.end}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Error al cargar estadísticas por tipo de comida')

      const result = await response.json()
      setMealTypeStats(result.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const loadDepartmentStats = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `http://localhost:8000/api/reports/stats/top-departments?month=${monthYear.month}&year=${monthYear.year}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Error al cargar estadísticas por departamento')

      const result = await response.json()
      setDepartmentStats(result.data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Estadísticas Visuales</h1>
              <p className="text-gray-600 mt-1">Análisis gráfico de asistencias</p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Filtros de Rango de Fechas */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Filtros de Fecha</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Gráfico de Línea - Asistencias Diarias */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Asistencias Diarias por Tipo de Comida
          </h2>
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="fecha"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Desayuno"
                  stroke={MEAL_COLORS.Desayuno}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Almuerzo"
                  stroke={MEAL_COLORS.Almuerzo}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Cena"
                  stroke={MEAL_COLORS.Cena}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No hay datos para el período seleccionado
            </div>
          )}
        </div>

        {/* Gráfico de Pastel - Distribución por Tipo de Comida */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Distribución por Tipo de Comida
            </h2>
            {mealTypeStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mealTypeStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mealTypeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MEAL_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No hay datos para el período seleccionado
              </div>
            )}
          </div>

          {/* Filtros de Mes/Año para Departamentos */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Filtros para Departamentos</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mes
                </label>
                <select
                  value={monthYear.month}
                  onChange={(e) => setMonthYear({...monthYear, month: parseInt(e.target.value)})}
                  className="input-field"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>
                      {new Date(2024, m - 1).toLocaleDateString('es-ES', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <input
                  type="number"
                  value={monthYear.year}
                  onChange={(e) => setMonthYear({...monthYear, year: parseInt(e.target.value)})}
                  className="input-field"
                  min="2020"
                  max="2030"
                />
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Período seleccionado:</strong><br/>
                {new Date(monthYear.year, monthYear.month - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico de Barras - Top Departamentos */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Top 10 Departamentos con Más Asistencias
          </h2>
          {departmentStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="departamento"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" name="Asistencias">
                  {departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No hay datos para el período seleccionado
            </div>
          )}
        </div>

        {/* Enlace a reportes */}
        <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                ¿Necesitas exportar datos?
              </h2>
              <p className="text-gray-600 mb-4">
                Descarga reportes completos en Excel o CSV
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/reports')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-md"
            >
              Ir a Reportes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminStatsPage
