import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { menusAPI, mealSchedulesAPI } from '../services/api'

function MenuDisplay({ tipoComida }) {
  const [menu, setMenu] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMenuData = useCallback(async () => {
    setLoading(true)
    try {
      // Cargar menú del día
      const menuData = await menusAPI.getToday(tipoComida)
      if (menuData.menus && menuData.menus.length > 0) {
        setMenu(menuData.menus[0])
      } else {
        setMenu(null)
      }

      // Cargar horarios
      const scheduleData = await mealSchedulesAPI.get(tipoComida)
      setSchedule(scheduleData)
    } catch (error) {
      console.error('Error cargando menú:', error)
    } finally {
      setLoading(false)
    }
  }, [tipoComida])

  useEffect(() => {
    loadMenuData()
  }, [loadMenuData])

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-purple-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gradient-to-r from-purple-200 to-pink-200 rounded-xl w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg w-1/2"></div>
        </div>
      </div>
    )
  }

  const getMealIcon = (tipo) => {
    const icons = {
      'desayuno': '🌅',
      'almuerzo': '🍽️',
      'cena': '🌙'
    }
    return icons[tipo] || '🍴'
  }

  const getMealLabel = (tipo) => {
    const labels = {
      'desayuno': 'Desayuno',
      'almuerzo': 'Almuerzo',
      'cena': 'Cena'
    }
    return labels[tipo] || tipo
  }

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-purple-100">
      {/* Header con tipo de comida y horario */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg">
            <span className="text-3xl">{getMealIcon(tipoComida)}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {getMealLabel(tipoComida)}
          </h3>
        </div>
        {schedule && (
          <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
            <div className="text-sm font-bold text-purple-700">
              {schedule.hora_inicio} - {schedule.hora_fin}
            </div>
          </div>
        )}
      </div>

      {/* Menú del día */}
      {menu ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 shadow-inner">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🍴</span>
              Menú del día
            </h4>
            
            {/* Lista de platos en formato vertical */}
            <div className="space-y-3">
              {menu.entrada && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">🥗</span>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Entrada</span>
                    <p className="text-gray-800">{menu.entrada}</p>
                  </div>
                </div>
              )}
              
              {menu.plato_principal && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">🍽️</span>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Plato Principal</span>
                    <p className="text-gray-800">{menu.plato_principal}</p>
                  </div>
                </div>
              )}
              
              {menu.ensalada && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">🥬</span>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Ensalada</span>
                    <p className="text-gray-800">{menu.ensalada}</p>
                  </div>
                </div>
              )}
              
              {menu.postre && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">🍨</span>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Postre</span>
                    <p className="text-gray-800">{menu.postre}</p>
                  </div>
                </div>
              )}
              
              {menu.bebida && (
                <div className="flex items-start gap-3">
                  <span className="text-lg">🥤</span>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Bebida</span>
                    <p className="text-gray-800">{menu.bebida}</p>
                  </div>
                </div>
              )}
              
              {menu.descripcion && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-gray-600 text-sm italic">{menu.descripcion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Opciones dietéticas */}
          {menu.opciones_dieteticas && (() => {
            try {
              const opciones = typeof menu.opciones_dieteticas === 'string' 
                ? JSON.parse(menu.opciones_dieteticas) 
                : menu.opciones_dieteticas
              return (
                <div className="flex flex-wrap gap-2">
                  {opciones.vegetariano && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      🌱 Vegetariano
                    </span>
                  )}
                  {opciones.sin_lactosa && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      🥛 Sin lactosa
                    </span>
                  )}
                  {opciones.sin_gluten && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      🌾 Sin gluten
                    </span>
                  )}
                </div>
              )
            } catch {
              return null
            }
          })()}

          {/* Link a recetas */}
          <a
            href="/recipes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <span>📖</span>
            Ver recetas completas
          </a>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-5">
          <p className="text-amber-800 font-semibold flex items-center gap-2">
            <span>ℹ️</span>
            No hay menú configurado para hoy
          </p>
        </div>
      )}
    </div>
  )
}

MenuDisplay.propTypes = {
  tipoComida: PropTypes.string.isRequired
}

export default MenuDisplay
