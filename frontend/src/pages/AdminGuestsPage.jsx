import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { guestsAPI, photosAPI } from '../services/api'

const REGIONES_CHILE = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
  'Valparaíso', 'Metropolitana', 'O\'Higgins', 'Maule', 'Ñuble',
  'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
]

function AdminGuestsPage() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGuest, setEditingGuest] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [filterEmpresa, setFilterEmpresa] = useState('')
  const [filterRegion, setFilterRegion] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    empresa: '',
    region: '',
    motivo_visita: '',
    email: '',
    telefono: '',
    restricciones_alimentarias: '',
    foto_url: '',
    activo: true
  })
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    loadGuests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
    }
  }

  const loadGuests = async () => {
    setLoading(true)
    try {
      const data = await guestsAPI.list()
      setGuests(data)
    } catch (error) {
      console.error('Error loading guests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingGuest(null)
    setFormData({
      nombre: '',
      apellido: '',
      empresa: '',
      region: '',
      motivo_visita: '',
      email: '',
      telefono: '',
      restricciones_alimentarias: '',
      foto_url: '',
      activo: true
    })
    setPhotoFile(null)
    setPhotoPreview(null)
    setShowModal(true)
  }

  const handleEdit = (guest) => {
    setEditingGuest(guest)
    setFormData({
      nombre: guest.nombre || '',
      apellido: guest.apellido || '',
      empresa: guest.empresa || '',
      region: guest.region || '',
      motivo_visita: guest.motivo_visita || '',
      email: guest.email || '',
      telefono: guest.telefono || '',
      restricciones_alimentarias: guest.restricciones_alimentarias || '',
      foto_url: guest.foto_url || '',
      activo: guest.activo !== undefined ? guest.activo : true
    })
    setPhotoFile(null)
    setPhotoPreview(guest.foto_url ? `http://localhost:8000/api/photos/${guest.foto_url}` : null)
    setShowModal(true)
  }

  const handleToggleActive = async (guest) => {
    const action = guest.activo ? 'desactivar' : 'activar'
    if (!confirm(`¿Estás seguro de ${action} a ${guest.nombre} ${guest.apellido}?`)) return

    try {
      await guestsAPI.update(guest.id, { activo: !guest.activo })
      await loadGuests()
    } catch (error) {
      alert(`Error al ${action} invitado: ` + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de desactivar permanentemente este invitado?')) return

    try {
      await guestsAPI.delete(id)
      await loadGuests()
    } catch (error) {
      alert('Error al desactivar invitado: ' + error.message)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida')
        return
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar 5MB')
        return
      }

      setPhotoFile(file)

      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      let savedGuest

      if (editingGuest) {
        savedGuest = await guestsAPI.update(editingGuest.id, formData)
      } else {
        savedGuest = await guestsAPI.create(formData)
      }

      // Si hay una foto nueva, subirla
      if (photoFile && savedGuest.id) {
        try {
          await photosAPI.uploadGuestPhoto(savedGuest.id, photoFile)
        } catch (photoError) {
          console.error('Error al subir foto:', photoError)
          alert('Invitado guardado, pero hubo un error al subir la foto')
        }
      }

      setShowModal(false)
      await loadGuests()
    } catch (error) {
      alert('Error al guardar invitado: ' + error.message)
    }
  }

  // Obtener listas únicas de empresas y regiones
  const empresas = [...new Set(guests.map(g => g.empresa).filter(Boolean))]
  const regiones = [...new Set(guests.map(g => g.region).filter(Boolean))]

  const filteredGuests = guests.filter(guest => {
    // Filtro de búsqueda
    const search = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || (
      guest.nombre?.toLowerCase().includes(search) ||
      guest.apellido?.toLowerCase().includes(search) ||
      guest.empresa?.toLowerCase().includes(search) ||
      guest.region?.toLowerCase().includes(search)
    )

    // Filtro de empresa
    const matchesEmpresa = !filterEmpresa || guest.empresa === filterEmpresa

    // Filtro de región
    const matchesRegion = !filterRegion || guest.region === filterRegion

    // Filtro de estado
    const matchesEstado = filterEstado === 'todos' ||
      (filterEstado === 'activos' && guest.activo) ||
      (filterEstado === 'inactivos' && !guest.activo)

    return matchesSearch && matchesEmpresa && matchesRegion && matchesEstado
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando invitados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Invitados</h1>
              <p className="text-gray-600 mt-1">Administrar invitados del casino</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Volver al Dashboard
              </button>
              <button
                onClick={handleCreate}
                className="btn-primary flex items-center gap-2"
              >
                <span className="text-xl">➕</span>
                Nuevo Invitado
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Búsqueda y Filtros */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔍</span>
                <input
                  type="text"
                  placeholder="Nombre, empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field flex-1"
                />
              </div>
            </div>

            {/* Filtro Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <select
                value={filterEmpresa}
                onChange={(e) => setFilterEmpresa(e.target.value)}
                className="input-field"
              >
                <option value="">Todas</option>
                {empresas.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            {/* Filtro Región */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Región
              </label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="input-field"
              >
                <option value="">Todas</option>
                {regiones.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            {/* Filtro Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="input-field"
              >
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Región</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No se encontraron invitados
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {guest.nombre} {guest.apellido}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {guest.empresa || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {guest.region || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {guest.email || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {guest.fecha_registro ? new Date(guest.fecha_registro).toLocaleDateString('es-CL') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          guest.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {guest.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(guest)}
                            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleToggleActive(guest)}
                            className={`px-3 py-1 rounded transition-colors ${
                              guest.activo
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={guest.activo ? 'Desactivar' : 'Activar'}
                          >
                            {guest.activo ? '🚫' : '✅'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-6">
          <div className="card bg-purple-50">
            <div className="text-2xl mb-2">🎫</div>
            <div className="text-2xl font-bold text-purple-900">{guests.length}</div>
            <div className="text-sm text-purple-700">Total Invitados</div>
          </div>
          <div className="card bg-green-50">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-900">
              {guests.filter(g => g.activo).length}
            </div>
            <div className="text-sm text-green-700">Activos</div>
          </div>
          <div className="card bg-red-50">
            <div className="text-2xl mb-2">❌</div>
            <div className="text-2xl font-bold text-red-900">
              {guests.filter(g => !g.activo).length}
            </div>
            <div className="text-sm text-red-700">Inactivos</div>
          </div>
          <div className="card bg-indigo-50">
            <div className="text-2xl mb-2">🏢</div>
            <div className="text-2xl font-bold text-indigo-900">
              {new Set(guests.map(g => g.empresa).filter(Boolean)).size}
            </div>
            <div className="text-sm text-indigo-700">Empresas Registradas</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingGuest ? 'Editar Invitado' : 'Nuevo Invitado'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Foto del Invitado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto del Invitado
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl text-gray-400">👤</div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="guest-photo-upload"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="guest-photo-upload"
                        className="btn-secondary cursor-pointer inline-block"
                      >
                        📷 Seleccionar Foto
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos: JPG, PNG. Máximo 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nombre y Apellido */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Empresa y Región */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      value={formData.empresa}
                      onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                      required
                      className="input-field"
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Región *
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      required
                      className="input-field"
                    >
                      <option value="">Seleccione una región</option>
                      {REGIONES_CHILE.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Email y Teléfono */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input-field"
                      placeholder="ejemplo@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      className="input-field"
                      placeholder="+56912345678"
                    />
                  </div>
                </div>

                {/* Motivo de Visita */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo de Visita
                  </label>
                  <textarea
                    value={formData.motivo_visita}
                    onChange={(e) => setFormData({...formData, motivo_visita: e.target.value})}
                    className="input-field"
                    rows="2"
                    placeholder="Reunión de negocios, visita técnica..."
                  />
                </div>

                {/* Restricciones Alimentarias */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restricciones Alimentarias
                  </label>
                  <textarea
                    value={formData.restricciones_alimentarias}
                    onChange={(e) => setFormData({...formData, restricciones_alimentarias: e.target.value})}
                    className="input-field"
                    rows="2"
                    placeholder="Alergias, intolerancias, dietas especiales..."
                  />
                </div>

                {/* Estado (solo en edición) */}
                {editingGuest && (
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Invitado activo
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
                    {editingGuest ? 'Guardar Cambios' : 'Crear Invitado'}
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

export default AdminGuestsPage
