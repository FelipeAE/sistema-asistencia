import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeesAPI, photosAPI } from '../services/api'
import EmployeeImport from '../components/EmployeeImport'

function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [filterDepartamento, setFilterDepartamento] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    cargo: '',
    departamento: '',
    email: '',
    telefono: '',
    restricciones_alimentarias: '',
    foto_url: '',
    pin: '',
    activo: true
  })
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    loadEmployees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
    }
  }

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const data = await employeesAPI.list()
      setEmployees(data)
    } catch (error) {
      console.error('Error loading employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingEmployee(null)
    setFormData({
      rut: '',
      nombre: '',
      cargo: '',
      departamento: '',
      email: '',
      telefono: '',
      restricciones_alimentarias: '',
      foto_url: '',
      pin: '',
      activo: true
    })
    setPhotoFile(null)
    setPhotoPreview(null)
    setShowModal(true)
  }

  const handleEdit = (employee) => {
    setEditingEmployee(employee)
    setFormData({
      rut: employee.rut || '',
      nombre: employee.nombre || '',
      cargo: employee.cargo || '',
      departamento: employee.departamento || '',
      email: employee.email || '',
      telefono: employee.telefono || '',
      restricciones_alimentarias: employee.restricciones_alimentarias || '',
      foto_url: employee.foto_url || '',
      pin: '', // No cargamos el PIN existente por seguridad
      activo: employee.activo !== undefined ? employee.activo : true
    })
    setPhotoFile(null)
    // La foto_url ya viene como /photos/filename.jpg, solo agregar el host del backend
    setPhotoPreview(employee.foto_url ? `http://localhost:8000${employee.foto_url}` : null)
    setShowModal(true)
  }

  const handleToggleActive = async (employee) => {
    const action = employee.activo ? 'desactivar' : 'activar'
    if (!confirm(`¿Estás seguro de ${action} a ${employee.nombre}?`)) return

    try {
      await employeesAPI.update(employee.id, { activo: !employee.activo })
      await loadEmployees()
    } catch (error) {
      alert(`Error al ${action} empleado: ` + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de desactivar permanentemente este empleado?')) return

    try {
      await employeesAPI.delete(id)
      await loadEmployees()
    } catch (error) {
      alert('Error al desactivar empleado: ' + error.message)
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
      let savedEmployee

      // Preparar datos para enviar (excluir PIN vacío en edición para no borrarlo)
      const dataToSend = { ...formData }
      if (editingEmployee && !formData.pin) {
        delete dataToSend.pin // No enviar PIN vacío al editar
      }

      if (editingEmployee) {
        savedEmployee = await employeesAPI.update(editingEmployee.id, dataToSend)
      } else {
        savedEmployee = await employeesAPI.create(dataToSend)
      }

      // Si hay una foto nueva, subirla
      if (photoFile && savedEmployee.id) {
        try {
          await photosAPI.uploadEmployeePhoto(savedEmployee.id, photoFile)
        } catch (photoError) {
          console.error('Error al subir foto:', photoError)
          alert('Empleado guardado, pero hubo un error al subir la foto')
        }
      }

      setShowModal(false)
      await loadEmployees()
    } catch (error) {
      alert('Error al guardar empleado: ' + error.message)
    }
  }

  // Obtener lista única de departamentos
  const departamentos = [...new Set(employees.map(emp => emp.departamento).filter(Boolean))]

  const filteredEmployees = employees.filter(emp => {
    // Filtro de búsqueda
    const search = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || (
      emp.nombre?.toLowerCase().includes(search) ||
      emp.rut?.toLowerCase().includes(search) ||
      emp.cargo?.toLowerCase().includes(search) ||
      emp.departamento?.toLowerCase().includes(search)
    )

    // Filtro de departamento
    const matchesDepartamento = !filterDepartamento || emp.departamento === filterDepartamento

    // Filtro de estado
    const matchesEstado = filterEstado === 'todos' ||
      (filterEstado === 'activos' && emp.activo) ||
      (filterEstado === 'inactivos' && !emp.activo)

    return matchesSearch && matchesDepartamento && matchesEstado
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando empleados...</p>
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
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Empleados</h1>
              <p className="text-gray-600 mt-1">Administrar empleados del casino</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Volver al Dashboard
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <span className="text-xl">📥</span>
                Importar Excel
              </button>
              <button
                onClick={handleCreate}
                className="btn-primary flex items-center gap-2"
              >
                <span className="text-xl">➕</span>
                Nuevo Empleado
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Búsqueda y Filtros */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔍</span>
                <input
                  type="text"
                  placeholder="Nombre, RUT, cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field flex-1"
                />
              </div>
            </div>

            {/* Filtro Departamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento
              </label>
              <select
                value={filterDepartamento}
                onChange={(e) => setFilterDepartamento(e.target.value)}
                className="input-field"
              >
                <option value="">Todos</option>
                {departamentos.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      No se encontraron empleados
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {employee.foto_url ? (
                          <img 
                            src={`http://localhost:8000${employee.foto_url}`}
                            alt={employee.nombre}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg">
                            👤
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {employee.rut}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {employee.nombre}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {employee.cargo || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {employee.departamento || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {employee.email || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleToggleActive(employee)}
                            className={`px-3 py-1 rounded transition-colors ${
                              employee.activo
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={employee.activo ? 'Desactivar' : 'Activar'}
                          >
                            {employee.activo ? '🚫' : '✅'}
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
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="card bg-blue-50">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-2xl font-bold text-blue-900">{employees.length}</div>
            <div className="text-sm text-blue-700">Total Empleados</div>
          </div>
          <div className="card bg-green-50">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-900">
              {employees.filter(e => e.activo).length}
            </div>
            <div className="text-sm text-green-700">Activos</div>
          </div>
          <div className="card bg-red-50">
            <div className="text-2xl mb-2">❌</div>
            <div className="text-2xl font-bold text-red-900">
              {employees.filter(e => !e.activo).length}
            </div>
            <div className="text-sm text-red-700">Inactivos</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* RUT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RUT *
                  </label>
                  <input
                    type="text"
                    value={formData.rut}
                    onChange={(e) => setFormData({...formData, rut: e.target.value})}
                    required
                    className="input-field"
                    placeholder="12345678-9"
                    disabled={!!editingEmployee}
                  />
                </div>

                {/* Foto del Empleado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto del Empleado
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
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="photo-upload"
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

                {/* Nombre Completo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                    className="input-field"
                    placeholder="Juan Pérez González"
                  />
                </div>

                {/* Cargo y Departamento */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo
                    </label>
                    <input
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                      className="input-field"
                      placeholder="Ej: Chef, Cajero, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={formData.departamento}
                      onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                      className="input-field"
                      placeholder="Ej: Cocina, Administración, etc."
                    />
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
                      placeholder="ejemplo@casino.com"
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

                {/* PIN de Seguridad */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔒</span>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-amber-900 mb-1">
                        PIN de Seguridad (4 dígitos)
                      </label>
                      <input
                        type="text"
                        value={formData.pin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setFormData({...formData, pin: value})
                        }}
                        className="input-field w-32 text-center tracking-widest font-mono text-lg"
                        placeholder="****"
                        maxLength="4"
                        inputMode="numeric"
                      />
                      <p className="text-xs text-amber-700 mt-2">
                        {editingEmployee
                          ? 'Deja vacío para mantener el PIN actual. Ingresa un nuevo PIN para cambiarlo.'
                          : 'Opcional. Si no asignas PIN, el empleado podrá registrar asistencia solo con su RUT.'}
                      </p>
                    </div>
                  </div>
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
                    placeholder="Ej: Intolerancia al gluten, alérgico a mariscos..."
                    rows="3"
                  />
                </div>

                {/* Estado (solo en edición) */}
                {editingEmployee && (
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Empleado activo
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
                    {editingEmployee ? 'Guardar Cambios' : 'Crear Empleado'}
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

      {/* Modal Importación */}
      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Importar Empleados</h2>
                <button
                  onClick={() => setShowImport(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <EmployeeImport 
                onImportComplete={() => {
                  loadEmployees()
                  setShowImport(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEmployeesPage
