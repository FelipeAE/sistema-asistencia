import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { recipesAPI, photosAPI } from '../services/api'

const CATEGORIAS = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'principal', label: 'Plato Principal' },
  { value: 'ensalada', label: 'Ensalada' },
  { value: 'sopa', label: 'Sopa' },
  { value: 'postre', label: 'Postre' },
  { value: 'bebida', label: 'Bebida' }
]

const ALERGENOS = [
  'gluten', 'lacteos', 'huevo', 'pescado', 'mariscos', 'palta', 'queso', 'soya', 'mani'
]

function AdminRecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [filterActivo, setFilterActivo] = useState('all')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    ingredientes: '',
    preparacion: '',
    tiempo_preparacion: 30,
    porciones: 4,
    categoria: 'principal',
    alergenos: [],
    foto_url: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    loadRecipes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
    }
  }

  const loadRecipes = async () => {
    setLoading(true)
    try {
      const data = await recipesAPI.list(0, 100)
      setRecipes(data || [])
    } catch (error) {
      console.error('Error loading recipes:', error)
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingRecipe(null)
    setFormData({
      nombre: '',
      descripcion: '',
      ingredientes: '',
      preparacion: '',
      tiempo_preparacion: 30,
      porciones: 4,
      categoria: 'principal',
      alergenos: [],
      foto_url: ''
    })
    setPhotoFile(null)
    setPhotoPreview(null)
    setShowModal(true)
  }

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe)

    // Parsear alergenos si es string JSON
    let alergenos = recipe.alergenos || []
    if (typeof alergenos === 'string') {
      try {
        alergenos = JSON.parse(alergenos)
      } catch {
        alergenos = []
      }
    }
    if (!Array.isArray(alergenos)) alergenos = []

    // Parsear ingredientes (puede ser JSON string o array)
    let ingredientesText = ''
    if (recipe.ingredientes) {
      try {
        const parsed = typeof recipe.ingredientes === 'string'
          ? JSON.parse(recipe.ingredientes)
          : recipe.ingredientes
        ingredientesText = Array.isArray(parsed) ? parsed.join('\n') : recipe.ingredientes
      } catch {
        ingredientesText = recipe.ingredientes
      }
    }

    // Parsear preparacion (puede ser JSON string o array)
    let preparacionText = ''
    if (recipe.preparacion) {
      try {
        const parsed = typeof recipe.preparacion === 'string'
          ? JSON.parse(recipe.preparacion)
          : recipe.preparacion
        preparacionText = Array.isArray(parsed) ? parsed.join('\n') : recipe.preparacion
      } catch {
        preparacionText = recipe.preparacion
      }
    }

    setFormData({
      nombre: recipe.nombre || '',
      descripcion: recipe.descripcion || '',
      ingredientes: ingredientesText,
      preparacion: preparacionText,
      tiempo_preparacion: recipe.tiempo_preparacion || 30,
      porciones: recipe.porciones || 4,
      categoria: recipe.categoria || 'principal',
      alergenos: alergenos,
      foto_url: recipe.foto_url || ''
    })
    setPhotoFile(null)
    // Mostrar foto existente si tiene
    if (recipe.foto_url) {
      if (recipe.foto_url.startsWith('/photos/')) {
        setPhotoPreview(photosAPI.getPhotoUrl(recipe.foto_url))
      } else {
        setPhotoPreview(recipe.foto_url)
      }
    } else {
      setPhotoPreview(null)
    }
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de desactivar esta receta?')) return

    try {
      await recipesAPI.delete(id)
      await loadRecipes()
    } catch (error) {
      alert('Error al desactivar receta: ' + error.message)
    }
  }

  const handleToggleAlergeno = (alergeno) => {
    setFormData(prev => ({
      ...prev,
      alergenos: prev.alergenos.includes(alergeno)
        ? prev.alergenos.filter(a => a !== alergeno)
        : [...prev.alergenos, alergeno]
    }))
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

    // Procesar ingredientes y preparación como arrays
    const ingredientesArray = formData.ingredientes
      .split('\n')
      .map(i => i.trim())
      .filter(i => i.length > 0)

    const preparacionArray = formData.preparacion
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)

    // No enviar foto_url si vamos a subir una foto nueva
    // Convertir arrays a JSON string para el backend
    const recipeData = {
      ...formData,
      ingredientes: JSON.stringify(ingredientesArray),
      preparacion: JSON.stringify(preparacionArray),
      alergenos: JSON.stringify(formData.alergenos),
      foto_url: photoFile ? '' : formData.foto_url
    }

    try {
      let savedRecipe
      if (editingRecipe) {
        savedRecipe = await recipesAPI.update(editingRecipe.id, recipeData)
      } else {
        savedRecipe = await recipesAPI.create(recipeData)
      }

      // Si hay una foto nueva, subirla
      if (photoFile && savedRecipe.id) {
        try {
          await photosAPI.uploadRecipePhoto(savedRecipe.id, photoFile)
        } catch (photoError) {
          console.error('Error al subir foto:', photoError)
          alert('Receta guardada, pero hubo un error al subir la foto')
        }
      }

      setShowModal(false)
      await loadRecipes()
    } catch (error) {
      alert('Error al guardar receta: ' + error.message)
    }
  }

  // Helper para parsear alergenos
  const getAlergenos = (alergenos) => {
    if (!alergenos) return []
    if (Array.isArray(alergenos)) return alergenos
    if (typeof alergenos === 'string') {
      try {
        const parsed = JSON.parse(alergenos)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }

  // Filtrar recetas
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = !searchQuery || 
      recipe.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategoria = !filterCategoria || recipe.categoria === filterCategoria
    
    const matchesActivo = filterActivo === 'all' || 
      (filterActivo === 'active' && recipe.activo) ||
      (filterActivo === 'inactive' && !recipe.activo)

    return matchesSearch && matchesCategoria && matchesActivo
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando recetas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-700 to-orange-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Gestión de Recetas</h1>
              <p className="text-orange-100 mt-1">Administrar recetario del casino</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 text-white hover:bg-orange-600 rounded-lg transition-colors"
              >
                ← Volver al Dashboard
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-white text-orange-700 hover:bg-orange-50 rounded-lg font-medium flex items-center gap-2"
              >
                <span>➕</span>
                Nueva Receta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre o descripción..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="input-field"
              >
                <option value="">Todas</option>
                {CATEGORIAS.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterActivo}
                onChange={(e) => setFilterActivo(e.target.value)}
                className="input-field"
              >
                <option value="all">Todos</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterCategoria('')
                  setFilterActivo('all')
                }}
                className="btn-secondary w-full"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="card bg-blue-50">
            <div className="text-2xl mb-2">📖</div>
            <div className="text-2xl font-bold text-blue-900">{recipes.length}</div>
            <div className="text-sm text-blue-700">Total Recetas</div>
          </div>
          <div className="card bg-green-50">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-900">
              {recipes.filter(r => r.activo).length}
            </div>
            <div className="text-sm text-green-700">Recetas Activas</div>
          </div>
          <div className="card bg-orange-50">
            <div className="text-2xl mb-2">🍽️</div>
            <div className="text-2xl font-bold text-orange-900">
              {recipes.filter(r => r.categoria === 'principal').length}
            </div>
            <div className="text-sm text-orange-700">Platos Principales</div>
          </div>
          <div className="card bg-purple-50">
            <div className="text-2xl mb-2">🍰</div>
            <div className="text-2xl font-bold text-purple-900">
              {recipes.filter(r => r.categoria === 'postre').length}
            </div>
            <div className="text-sm text-purple-700">Postres</div>
          </div>
        </div>

        {/* Tabla de Recetas */}
        {filteredRecipes.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-gray-600 text-lg">No hay recetas que coincidan con los filtros</p>
            <button
              onClick={handleCreate}
              className="btn-primary mt-4"
            >
              Crear Primera Receta
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <div
                key={recipe.id}
                className={`card ${!recipe.activo ? 'opacity-60 bg-gray-100' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{recipe.nombre}</h3>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      recipe.categoria === 'principal' ? 'bg-orange-100 text-orange-800' :
                      recipe.categoria === 'entrada' ? 'bg-blue-100 text-blue-800' :
                      recipe.categoria === 'postre' ? 'bg-pink-100 text-pink-800' :
                      recipe.categoria === 'ensalada' ? 'bg-green-100 text-green-800' :
                      recipe.categoria === 'sopa' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {CATEGORIAS.find(c => c.value === recipe.categoria)?.label || recipe.categoria}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(recipe)}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Desactivar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {recipe.descripcion || 'Sin descripción'}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>⏱️ {recipe.tiempo_preparacion} min</span>
                  <span>🍽️ {recipe.porciones} porciones</span>
                </div>

                {getAlergenos(recipe.alergenos).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {getAlergenos(recipe.alergenos).map(a => (
                      <span
                        key={a}
                        className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                {!recipe.activo && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <span className="text-xs text-red-600 font-medium">Desactivada</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingRecipe ? 'Editar Receta' : 'Nueva Receta'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre y Categoría */}
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
                      placeholder="Ej: Cazuela de Vacuno"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                      required
                      className="input-field"
                    >
                      {CATEGORIAS.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="input-field"
                    rows="2"
                    placeholder="Breve descripción del plato..."
                  />
                </div>

                {/* Tiempo y Porciones */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiempo de preparación (min) *
                    </label>
                    <input
                      type="number"
                      value={formData.tiempo_preparacion}
                      onChange={(e) => setFormData({...formData, tiempo_preparacion: parseInt(e.target.value)})}
                      required
                      min="1"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Porciones *
                    </label>
                    <input
                      type="number"
                      value={formData.porciones}
                      onChange={(e) => setFormData({...formData, porciones: parseInt(e.target.value)})}
                      required
                      min="1"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Ingredientes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredientes * (uno por línea)
                  </label>
                  <textarea
                    value={formData.ingredientes}
                    onChange={(e) => setFormData({...formData, ingredientes: e.target.value})}
                    required
                    className="input-field"
                    rows="5"
                    placeholder="500g de carne&#10;2 papas grandes&#10;1 choclo&#10;Sal y pimienta a gusto"
                  />
                </div>

                {/* Preparación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preparación * (un paso por línea)
                  </label>
                  <textarea
                    value={formData.preparacion}
                    onChange={(e) => setFormData({...formData, preparacion: e.target.value})}
                    required
                    className="input-field"
                    rows="5"
                    placeholder="Cortar la carne en trozos&#10;Hervir en agua con sal&#10;Agregar las verduras&#10;Cocinar por 30 minutos"
                  />
                </div>

                {/* Alérgenos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alérgenos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALERGENOS.map(alergeno => (
                      <button
                        key={alergeno}
                        type="button"
                        onClick={() => handleToggleAlergeno(alergeno)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          formData.alergenos.includes(alergeno)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {alergeno}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Foto de la receta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto de la Receta
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
                        <div className="text-4xl text-gray-400">🍽️</div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="recipe-photo-upload"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="recipe-photo-upload"
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

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingRecipe ? 'Guardar Cambios' : 'Crear Receta'}
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

export default AdminRecipesPage
