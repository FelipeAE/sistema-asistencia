import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { menusAPI } from '../services/api'

const TIPOS_COMIDA = ['desayuno', 'almuerzo', 'cena']

// Función para obtener fecha local en formato YYYY-MM-DD
const getLocalDate = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function AdminMenusPage() {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [selectedDate, setSelectedDate] = useState(getLocalDate())
  const [formData, setFormData] = useState({
    fecha: getLocalDate(),
    tipo_comida: 'almuerzo',
    entrada: '',
    plato_principal: '',
    postre: '',
    ensalada: '',
    bebida: '',
    descripcion: '',
    opciones_dieteticas: '',
    activo: true
  })
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    loadMenus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const checkAuth = () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
    }
  }

  const loadMenus = async () => {
    setLoading(true)
    try {
      const data = await menusAPI.list()
      setMenus(data)
    } catch (error) {
      console.error('Error loading menus:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingMenu(null)
    setFormData({
      fecha: selectedDate,
      tipo_comida: 'almuerzo',
      entrada: '',
      plato_principal: '',
      postre: '',
      ensalada: '',
      bebida: '',
      descripcion: '',
      opciones_dieteticas: '',
      activo: true
    })
    setShowModal(true)
  }

  const handleEdit = (menu) => {
    setEditingMenu(menu)
    setFormData({
      fecha: menu.fecha,
      tipo_comida: menu.tipo_comida,
      entrada: menu.entrada || '',
      plato_principal: menu.plato_principal || '',
      postre: menu.postre || '',
      ensalada: menu.ensalada || '',
      bebida: menu.bebida || '',
      descripcion: menu.descripcion || '',
      opciones_dieteticas: menu.opciones_dieteticas || '',
      activo: menu.activo !== undefined ? menu.activo : true
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de desactivar este menú?')) return

    try {
      await menusAPI.delete(id)
      await loadMenus()
    } catch (error) {
      alert('Error al desactivar menú: ' + error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingMenu) {
        await menusAPI.update(editingMenu.id, {
          entrada: formData.entrada,
          plato_principal: formData.plato_principal,
          postre: formData.postre,
          ensalada: formData.ensalada,
          bebida: formData.bebida,
          descripcion: formData.descripcion,
          opciones_dieteticas: formData.opciones_dieteticas,
          activo: formData.activo
        })
      } else {
        await menusAPI.create(formData)
      }

      setShowModal(false)
      await loadMenus()
    } catch (error) {
      alert('Error al guardar menú: ' + error.message)
    }
  }

  // Agrupar menús por fecha
  const menusByDate = menus.reduce((acc, menu) => {
    const fecha = menu.fecha
    if (!acc[fecha]) {
      acc[fecha] = []
    }
    acc[fecha].push(menu)
    return acc
  }, {})

  // Ordenar fechas descendentes
  const sortedDates = Object.keys(menusByDate).sort((a, b) => new Date(b) - new Date(a))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando menús...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Gestión de Menús</h1>
              <p className="text-yellow-100 mt-1">Administrar menús diarios del casino</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 text-white hover:bg-yellow-500 rounded-lg transition-colors"
              >
                ← Volver al Dashboard
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-white text-yellow-700 hover:bg-yellow-50 rounded-lg font-medium flex items-center gap-2"
              >
                <span>➕</span>
                Nuevo Menú
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtro de Fecha */}
        <div className="card border border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-xl">📅</span>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field max-w-xs"
              />
            </div>
          </div>
        </div>

        {/* Listado de Menús Agrupados por Fecha */}
        {sortedDates.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-600 text-lg">No hay menús registrados</p>
            <button
              onClick={handleCreate}
              className="btn-primary mt-4"
            >
              Crear Primer Menú
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(fecha => {
              const menusDelDia = menusByDate[fecha]
              const fechaObj = new Date(fecha + 'T12:00:00')
              const isToday = fecha === getLocalDate()

              return (
                <div key={fecha} className={`card ${isToday ? 'border-2 border-blue-500' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {fechaObj.toLocaleDateString('es-CL', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {isToday && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            HOY
                          </span>
                        )}
                      </h2>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {TIPOS_COMIDA.map(tipo => {
                      const menu = menusDelDia.find(m => m.tipo_comida === tipo)

                      if (!menu) {
                        return (
                          <div key={tipo} className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                            <div className="text-center text-gray-400">
                              <p className="font-medium text-sm uppercase mb-2">{tipo}</p>
                              <p className="text-xs">No configurado</p>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div
                          key={menu.id}
                          className={`rounded-lg p-4 border-2 ${
                            menu.activo
                              ? 'bg-white border-green-200'
                              : 'bg-gray-100 border-gray-300 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-gray-800 uppercase text-sm">
                              {getIcon(tipo)} {tipo}
                            </h3>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEdit(menu)}
                                className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors text-xs"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(menu.id)}
                                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors text-xs"
                                title="Desactivar"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          {/* Mostrar platos en formato vertical */}
                          <div className="space-y-1 text-sm">
                            {menu.entrada && (
                              <p className="text-gray-700">
                                <span className="text-gray-500">🥗 Entrada:</span> {menu.entrada}
                              </p>
                            )}
                            {menu.plato_principal && (
                              <p className="text-gray-700">
                                <span className="text-gray-500">🍽️ Principal:</span> {menu.plato_principal}
                              </p>
                            )}
                            {menu.ensalada && (
                              <p className="text-gray-700">
                                <span className="text-gray-500">🥬 Ensalada:</span> {menu.ensalada}
                              </p>
                            )}
                            {menu.postre && (
                              <p className="text-gray-700">
                                <span className="text-gray-500">🍨 Postre:</span> {menu.postre}
                              </p>
                            )}
                            {menu.bebida && (
                              <p className="text-gray-700">
                                <span className="text-gray-500">🥤 Bebida:</span> {menu.bebida}
                              </p>
                            )}
                          </div>

                          {menu.descripcion && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                              {menu.descripcion}
                            </p>
                          )}

                          {menu.opciones_dieteticas && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600">
                                <strong>Opciones dietéticas:</strong> {menu.opciones_dieteticas}
                              </p>
                            </div>
                          )}

                          {!menu.activo && (
                            <div className="mt-2 pt-2 border-t border-red-200">
                              <span className="text-xs text-red-600 font-medium">Desactivado</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="card bg-blue-50">
            <div className="text-2xl mb-2">🍽️</div>
            <div className="text-2xl font-bold text-blue-900">{menus.length}</div>
            <div className="text-sm text-blue-700">Total Menús</div>
          </div>
          <div className="card bg-green-50">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-900">
              {menus.filter(m => m.activo).length}
            </div>
            <div className="text-sm text-green-700">Menús Activos</div>
          </div>
          <div className="card bg-purple-50">
            <div className="text-2xl mb-2">📅</div>
            <div className="text-2xl font-bold text-purple-900">
              {sortedDates.length}
            </div>
            <div className="text-sm text-purple-700">Días Configurados</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingMenu ? 'Editar Menú' : 'Nuevo Menú'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Fecha y Tipo de Comida */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      required
                      disabled={!!editingMenu}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Comida *
                    </label>
                    <select
                      value={formData.tipo_comida}
                      onChange={(e) => setFormData({...formData, tipo_comida: e.target.value})}
                      required
                      disabled={!!editingMenu}
                      className="input-field"
                    >
                      {TIPOS_COMIDA.map(tipo => (
                        <option key={tipo} value={tipo}>
                          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Campos del Menú */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🥗 Entrada
                    </label>
                    <input
                      type="text"
                      value={formData.entrada}
                      onChange={(e) => setFormData({...formData, entrada: e.target.value})}
                      className="input-field"
                      placeholder="Ej: Sopa de verduras"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🍽️ Plato Principal *
                    </label>
                    <input
                      type="text"
                      value={formData.plato_principal}
                      onChange={(e) => setFormData({...formData, plato_principal: e.target.value})}
                      className="input-field"
                      placeholder="Ej: Pollo al horno con papas"
                      required
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🥬 Ensalada
                    </label>
                    <input
                      type="text"
                      value={formData.ensalada}
                      onChange={(e) => setFormData({...formData, ensalada: e.target.value})}
                      className="input-field"
                      placeholder="Ej: Ensalada mixta"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🍨 Postre
                    </label>
                    <input
                      type="text"
                      value={formData.postre}
                      onChange={(e) => setFormData({...formData, postre: e.target.value})}
                      className="input-field"
                      placeholder="Ej: Fruta de estación"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🥤 Bebida
                    </label>
                    <input
                      type="text"
                      value={formData.bebida}
                      onChange={(e) => setFormData({...formData, bebida: e.target.value})}
                      className="input-field"
                      placeholder="Ej: Jugo natural"
                      maxLength={200}
                    />
                  </div>
                </div>

                {/* Notas adicionales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas / Descripción adicional
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="input-field"
                    rows="2"
                    placeholder="Notas adicionales sobre el menú..."
                  />
                </div>

                {/* Opciones Dietéticas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opciones Dietéticas
                  </label>
                  <textarea
                    value={formData.opciones_dieteticas}
                    onChange={(e) => setFormData({...formData, opciones_dieteticas: e.target.value})}
                    className="input-field"
                    rows="2"
                    placeholder="Ej: Vegetariano, Sin gluten, Diabético"
                  />
                </div>

                {/* Estado (solo en edición) */}
                {editingMenu && (
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Menú activo
                      </span>
                    </label>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingMenu ? 'Guardar Cambios' : 'Crear Menú'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function para iconos
function getIcon(tipo) {
  switch(tipo) {
    case 'desayuno': return '☀️'
    case 'almuerzo': return '🍽️'
    case 'cena': return '🌙'
    default: return '🍴'
  }
}

export default AdminMenusPage
