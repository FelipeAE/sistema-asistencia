import { useState, useEffect, useCallback } from 'react'
import { validateRut, formatRut } from '../utils/rutValidator'
import { getCurrentMealType } from '../utils/timeValidator'
import { employeesAPI, attendanceAPI, mealSchedulesAPI } from '../services/api'
import EmployeeCard from '../components/EmployeeCard'
import GuestForm from '../components/GuestForm'
import MenuDisplay from '../components/MenuDisplay'

function AttendancePage() {
  const [rut, setRut] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [employee, setEmployee] = useState(null)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [currentMealType, setCurrentMealType] = useState(null)
  const [schedules, setSchedules] = useState([])

  const loadSchedules = async () => {
    try {
      const data = await mealSchedulesAPI.getInfo()
      setSchedules(data.schedules || [])
    } catch (err) {
      console.error('Error cargando horarios:', err)
    }
  }

  const updateCurrentMeal = useCallback(() => {
    const mealType = getCurrentMealType(schedules)
    setCurrentMealType(mealType)
  }, [schedules])

  // Determinar tipo de comida actual
  useEffect(() => {
    loadSchedules()
  }, [])

  useEffect(() => {
    if (schedules.length > 0) {
      updateCurrentMeal()
      // Actualizar cada minuto
      const interval = setInterval(updateCurrentMeal, 60000)
      return () => clearInterval(interval)
    }
  }, [schedules, updateCurrentMeal])

  const handleRutChange = (e) => {
    const value = e.target.value
    setRut(formatRut(value))
    setError('')
    setSuccess('')
    setEmployee(null)
  }

  const handleRutSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validar RUT
      if (!validateRut(rut)) {
        throw new Error('RUT inválido. Por favor verifica el formato.')
      }

      // Validar horario
      if (!currentMealType) {
        throw new Error('Fuera de horario. No hay comida disponible en este momento.')
      }

      // Buscar empleado (enviar con guión)
      const employeeData = await employeesAPI.getByRut(rut)
      
      setEmployee(employeeData)
    } catch (err) {
      setError(err.message || 'Error al buscar empleado')
      setEmployee(null)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAttendance = async () => {
    setLoading(true)
    setError('')

    try {
      await attendanceAPI.registerEmployee(
        rut,
        currentMealType
      )
      
      setSuccess(`¡Asistencia registrada! Bienvenido/a ${employee.nombre}`)
      setEmployee(null)
      setRut('')
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Error al registrar asistencia')
      setEmployee(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEmployee = () => {
    setEmployee(null)
    setRut('')
  }

  const handleGuestSuccess = (guest) => {
    setSuccess(`¡Invitado registrado! Bienvenido/a ${guest.nombre} ${guest.apellido}`)
    setShowGuestForm(false)
    
    setTimeout(() => setSuccess(''), 3000)
  }

  const getTimeMessage = () => {
    if (!currentMealType) {
      return '⏰ Fuera de horario de comida'
    }
    
    const labels = {
      'desayuno': 'Desayuno',
      'almuerzo': 'Almuerzo',
      'cena': 'Cena',
      'testing': 'Testing'
    }
    
    return `✅ Horario actual: ${labels[currentMealType]}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Mejorado */}
        <div className="text-center mb-12">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl mb-4 shadow-lg">
              <span className="text-4xl">🍽️</span>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">
            Sistema de Asistencia
          </h1>
          <p className="text-purple-200 text-lg mb-6">Casino - Registro de Comida</p>
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full font-semibold shadow-lg backdrop-blur-sm ${
            currentMealType 
              ? 'bg-emerald-500/90 text-white ring-2 ring-emerald-300/50' 
              : 'bg-amber-500/90 text-white ring-2 ring-amber-300/50'
          }`}>
            <span className="text-xl">
              {currentMealType ? '✅' : '⏰'}
            </span>
            {getTimeMessage()}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Columna izquierda: Formulario */}
          <div>
            {/* Card Principal Mejorado */}
            {!employee ? (
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-purple-100">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                    <span className="text-3xl">👤</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Registrar Asistencia
                  </h2>
                </div>

                {/* Formulario RUT Mejorado */}
                <form onSubmit={handleRutSubmit} className="mb-8">
                  <div className="mb-6">
                    <label htmlFor="rut" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                      Ingresa tu RUT
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="rut"
                        value={rut}
                        onChange={handleRutChange}
                        placeholder="12345678-9"
                        className="w-full px-6 py-4 text-xl font-semibold border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50"
                        maxLength="10"
                        autoFocus
                        disabled={!currentMealType || loading}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        🆔
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={!currentMealType || loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Buscando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        🔍 Buscar Empleado
                      </span>
                    )}
                  </button>
                </form>

                {/* Divisor Mejorado */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-gray-500 font-semibold">o</span>
                  </div>
                </div>

                {/* Botón Invitado Mejorado */}
                <button
                  onClick={() => setShowGuestForm(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={!currentMealType}
                >
                  <span className="flex items-center justify-center gap-2">
                    ✨ Registrar Invitado
                  </span>
                </button>
              </div>
            ) : (
              <EmployeeCard
                employee={employee}
                onConfirm={handleConfirmAttendance}
                onCancel={handleCancelEmployee}
              />
            )}

            {/* Mensajes Mejorados */}
            {error && (
              <div className="mt-6 p-5 bg-red-50 border-2 border-red-300 text-red-800 rounded-2xl animate-fade-in shadow-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mt-6 p-5 bg-emerald-50 border-2 border-emerald-300 text-emerald-800 rounded-2xl animate-fade-in shadow-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">¡Éxito!</p>
                    <p className="text-sm">{success}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha: Info Mejorada */}
          <div className="space-y-8">
            {/* Menú del día - Siempre mostrar almuerzo (único activo) */}
            <MenuDisplay tipoComida={currentMealType || 'almuerzo'} />

            {/* Información de Horarios Mejorada */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Horarios de Comida
                </h3>
              </div>
              <div className="space-y-3">
                {schedules
                  .filter(schedule => schedule.tipo_comida === 'almuerzo' || schedule.tipo_comida === currentMealType)
                  .map((schedule) => {
                  const icons = {
                    'desayuno': '🌅',
                    'almuerzo': '🍽️',
                    'cena': '🌙',
                    'testing': '🧪'
                  }
                  const isActive = schedule.tipo_comida === currentMealType

                  return (
                    <div
                      key={schedule.tipo_comida}
                      className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                          isActive ? 'bg-white/20' : 'bg-white'
                        }`}>
                          <span className="text-xl">{icons[schedule.tipo_comida]}</span>
                        </div>
                        <span className={`font-bold capitalize text-lg ${
                          isActive ? 'text-white' : 'text-gray-800'
                        }`}>
                          {schedule.tipo_comida}
                        </span>
                      </div>
                      <span className={`font-semibold ${
                        isActive ? 'text-white' : 'text-gray-600'
                      }`}>
                        {schedule.hora_inicio} - {schedule.hora_fin}
                      </span>
                    </div>
                  )
                })
                }
                {schedules.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No hay horarios configurados
                  </div>
                )}
                {schedules.length > 0 && schedules.filter(s => s.tipo_comida === 'almuerzo').length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    Almuerzo no disponible actualmente
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de invitado */}
      {showGuestForm && (
        <GuestForm
          onClose={() => setShowGuestForm(false)}
          onSuccess={handleGuestSuccess}
          tipoComida={currentMealType}
        />
      )}
    </div>
  )
}

export default AttendancePage
