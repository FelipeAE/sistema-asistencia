import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Función para obtener fecha local en formato YYYY-MM-DD
const getLocalDate = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function AdminReportsPage() {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: getLocalDate(),
    end: getLocalDate()
  })
  const [monthYear, setMonthYear] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })
  const navigate = useNavigate()

  const handleDownloadReport = async (endpoint, params = {}) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      
      // Construir query string
      const queryParams = new URLSearchParams(params).toString()
      const url = `http://localhost:8000/api/reports/${endpoint}?${queryParams}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || 'Error al generar reporte')
      }

      // Descargar archivo
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      
      // Extraer nombre de archivo del header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename=(.+)/)
      a.download = filenameMatch ? filenameMatch[1] : 'reporte.xlsx'
      
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      alert('Error al descargar reporte: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceReport = (format = 'excel') => {
    handleDownloadReport('attendance', {
      start_date: dateRange.start,
      end_date: dateRange.end,
      format
    })
  }

  const handleEmployeesReport = (format = 'excel') => {
    handleDownloadReport('employees/monthly', {
      month: monthYear.month,
      year: monthYear.year,
      format
    })
  }

  const handleGuestsReport = (format = 'excel') => {
    handleDownloadReport('guests', {
      start_date: dateRange.start,
      end_date: dateRange.end,
      format
    })
  }

  const handleCompleteReport = () => {
    handleDownloadReport('complete', {
      month: monthYear.month,
      year: monthYear.year
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Reportes y Exportación</h1>
              <p className="text-gray-600 mt-1">Descarga reportes en Excel o CSV</p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Volver al Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Enlace a Estadísticas Visuales */}
        <div className="card bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📈</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  Ver Estadísticas Visuales
                </h2>
                <p className="text-gray-600 text-sm">
                  Gráficos interactivos de asistencias, tipos de comida y departamentos
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/stats')}
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all font-medium shadow-md"
            >
              Ir a Estadísticas
            </button>
          </div>
        </div>
        {/* Reporte de Asistencia por Rango de Fechas */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📋</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Reporte de Asistencia por Fechas
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Exporta el detalle de todas las asistencias en un rango de fechas
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
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

              <div className="flex gap-3">
                <button
                  onClick={() => handleAttendanceReport('excel')}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  📊 Descargar Excel
                </button>
                <button
                  onClick={() => handleAttendanceReport('csv')}
                  disabled={loading}
                  className="btn-secondary flex items-center gap-2"
                >
                  📄 Descargar CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reporte Mensual de Empleados */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="text-4xl">👥</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Resumen Mensual de Empleados
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Asistencias de empleados agrupadas por mes con desglose por tipo de comida
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
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

              <div className="flex gap-3">
                <button
                  onClick={() => handleEmployeesReport('excel')}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  📊 Descargar Excel
                </button>
                <button
                  onClick={() => handleEmployeesReport('csv')}
                  disabled={loading}
                  className="btn-secondary flex items-center gap-2"
                >
                  📄 Descargar CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reporte de Invitados */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎫</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Reporte de Invitados
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Lista de invitados con total de visitas por empresa y región
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
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

              <div className="flex gap-3">
                <button
                  onClick={() => handleGuestsReport('excel')}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  📊 Descargar Excel
                </button>
                <button
                  onClick={() => handleGuestsReport('csv')}
                  disabled={loading}
                  className="btn-secondary flex items-center gap-2"
                >
                  📄 Descargar CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reporte Completo del Mes */}
        <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📑</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Reporte Completo del Mes
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Archivo Excel con múltiples hojas: empleados, invitados, estadísticas diarias y detalle de asistencias
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
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

              <button
                onClick={handleCompleteReport}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 font-medium shadow-md"
              >
                📊 Descargar Reporte Completo
              </button>
            </div>
          </div>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-5xl mb-4">⏳</div>
              <p className="text-gray-800 font-medium">Generando reporte...</p>
              <p className="text-sm text-gray-600 mt-2">Por favor espere</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminReportsPage
