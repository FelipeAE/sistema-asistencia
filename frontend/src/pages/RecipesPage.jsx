import { useState, useEffect } from 'react'
import RecipeCard from '../components/RecipeCard'
import RecipeDetail from '../components/RecipeDetail'
import { recipesAPI } from '../services/api'

const CATEGORIAS = [
  { value: '', label: 'Todas' },
  { value: 'entradas', label: 'Entradas' },
  { value: 'principales', label: 'Principales' },
  { value: 'ensaladas', label: 'Ensaladas' },
  { value: 'sopas', label: 'Sopas' },
  { value: 'postres', label: 'Postres' },
  { value: 'bebidas', label: 'Bebidas' }
]

const ALERGENOS_COMUNES = [
  'gluten',
  'lácteos',
  'lactosa',
  'huevo',
  'pescado',
  'mariscos',
  'palta',
  'queso',
  'soya'
]

function RecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRecipe, setSelectedRecipe] = useState(null)

  // Filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedAllergens, setSelectedAllergens] = useState([])
  const [maxTime, setMaxTime] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Cargar categorías y recetas al montar
  useEffect(() => {
    loadCategories()
    loadRecipes()
  }, [])

  // Recargar recetas cuando cambian los filtros
  useEffect(() => {
    loadRecipes()
  }, [selectedCategory, selectedAllergens, maxTime])

  const loadCategories = async () => {
    try {
      const data = await recipesAPI.getCategories()
      setCategories(data.categories || [])
    } catch (err) {
      console.error('Error cargando categorías:', err)
    }
  }

  const loadRecipes = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await recipesAPI.search(
        searchQuery,
        selectedCategory || null,
        selectedAllergens.length > 0 ? selectedAllergens : null,
        maxTime ? parseInt(maxTime) : null
      )
      setRecipes(data)
    } catch (err) {
      setError('Error al cargar recetas. Por favor intenta de nuevo.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadRecipes()
  }

  const toggleAllergen = (allergen) => {
    setSelectedAllergens(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedAllergens([])
    setMaxTime('')
  }

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe)
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedAllergens.length > 0 || maxTime

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Recetario Digital</h1>
          <p className="text-gray-600">
            Explora nuestro catálogo de recetas con información detallada de ingredientes y alérgenos
          </p>
        </div>

        {/* Búsqueda y filtros */}
        <div className="card mb-8">
          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar recetas por nombre, ingredientes o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input flex-1"
              />
              <button type="submit" className="btn-primary px-6">
                Buscar
              </button>
            </div>
          </form>

          {/* Botón mostrar/ocultar filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
          >
            <span className="text-lg">{showFilters ? '▼' : '▶'}</span>
            <span className="font-medium">Filtros avanzados</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                Activos
              </span>
            )}
          </button>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="space-y-6 pt-4 border-t border-gray-200">
              {/* Categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === cat.value
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alérgenos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sin alérgenos (excluir recetas que contengan)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALERGENOS_COMUNES.map(allergen => (
                    <button
                      key={allergen}
                      onClick={() => toggleAllergen(allergen)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedAllergens.includes(allergen)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiempo máximo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo máximo de preparación (minutos)
                </label>
                <input
                  type="number"
                  placeholder="Ej: 30"
                  value={maxTime}
                  onChange={(e) => setMaxTime(e.target.value)}
                  className="input max-w-xs"
                  min="0"
                />
              </div>

              {/* Limpiar filtros */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Limpiar todos los filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Cargando recetas...</p>
          </div>
        ) : error ? (
          <div className="card bg-red-50 border border-red-200">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadRecipes}
              className="btn-primary mt-4"
            >
              Reintentar
            </button>
          </div>
        ) : recipes.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No se encontraron recetas
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar los filtros de búsqueda
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Contador de resultados */}
            <div className="mb-4 text-gray-600">
              {recipes.length} {recipes.length === 1 ? 'receta encontrada' : 'recetas encontradas'}
            </div>

            {/* Grid de recetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => handleRecipeClick(recipe)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  )
}

export default RecipesPage
