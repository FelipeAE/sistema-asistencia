import PropTypes from 'prop-types'
import { photosAPI } from '../services/api'

function RecipeDetail({ recipe, onClose }) {
  const photoUrl = recipe.foto_url 
    ? photosAPI.getPhotoUrl(recipe.foto_url)
    : null

  const parseJson = (data) => {
    if (!data) return []

    // Si ya es un array, retornarlo
    if (Array.isArray(data)) return data

    // Si es string, intentar parsear como JSON
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) return parsed
        // Si el JSON parseado no es array, tratar como texto
        return data.split('\n').filter(line => line.trim())
      } catch {
        // Si no es JSON válido, dividir por líneas
        return data.split('\n').filter(line => line.trim())
      }
    }

    return []
  }

  const ingredientes = parseJson(recipe.ingredientes)
  const preparacion = parseJson(recipe.preparacion)
  const allergens = parseJson(recipe.alergenos)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="card max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header con botón cerrar */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {recipe.nombre}
            </h2>
            {recipe.categoria && (
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                {recipe.categoria.charAt(0).toUpperCase() + recipe.categoria.slice(1)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Imagen */}
        {photoUrl && (
          <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
            <img
              src={photoUrl}
              alt={recipe.nombre}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Descripción */}
        {recipe.descripcion && (
          <p className="text-gray-700 mb-6 text-lg">
            {recipe.descripcion}
          </p>
        )}

        {/* Meta información */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          {recipe.tiempo_preparacion && (
            <div className="text-center">
              <div className="text-2xl mb-1">⏱️</div>
              <div className="text-sm text-gray-600">Tiempo</div>
              <div className="font-semibold">{recipe.tiempo_preparacion} min</div>
            </div>
          )}
          {recipe.porciones && (
            <div className="text-center">
              <div className="text-2xl mb-1">👥</div>
              <div className="text-sm text-gray-600">Porciones</div>
              <div className="font-semibold">{recipe.porciones}</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-2xl mb-1">📋</div>
            <div className="text-sm text-gray-600">Ingredientes</div>
            <div className="font-semibold">{ingredientes.length}</div>
          </div>
        </div>

        {/* Alérgenos */}
        {allergens.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
              <span>⚠️</span>
              Contiene alérgenos
            </h3>
            <div className="flex flex-wrap gap-2">
              {allergens.map((allergen, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ingredientes */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>🛒</span>
            Ingredientes
          </h3>
          <ul className="space-y-2">
            {ingredientes.map((ingrediente, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-gray-700"
              >
                <span className="text-green-500 mt-1">✓</span>
                <span>{ingrediente}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Preparación */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>👨‍🍳</span>
            Preparación
          </h3>
          <ol className="space-y-3">
            {preparacion.map((paso, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-gray-700"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <span>{paso}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="btn-primary w-full py-3"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

RecipeDetail.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    categoria: PropTypes.string,
    tiempo_preparacion: PropTypes.number,
    porciones: PropTypes.number,
    ingredientes: PropTypes.string.isRequired,
    preparacion: PropTypes.string.isRequired,
    alergenos: PropTypes.string,
    foto_url: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired
}

export default RecipeDetail
