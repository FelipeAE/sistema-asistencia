import PropTypes from 'prop-types'
import { photosAPI } from '../services/api'

function RecipeCard({ recipe, onClick }) {
  const photoUrl = recipe.foto_url 
    ? photosAPI.getPhotoUrl(recipe.foto_url)
    : null

  const parseAllergens = (allergensJson) => {
    try {
      return JSON.parse(allergensJson || '[]')
    } catch {
      return []
    }
  }

  const allergens = parseAllergens(recipe.alergenos)

  return (
    <div
      onClick={onClick}
      className="card hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      {/* Imagen */}
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-teal-100">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={recipe.nombre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className={`absolute inset-0 flex items-center justify-center text-6xl ${
            photoUrl ? 'hidden' : ''
          }`}
        >
          🍳
        </div>
        
        {/* Badge de categoría */}
        {recipe.categoria && (
          <div className="absolute top-2 right-2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {recipe.categoria.charAt(0).toUpperCase() + recipe.categoria.slice(1)}
          </div>
        )}
      </div>

      {/* Información */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">
          {recipe.nombre}
        </h3>
        
        {recipe.descripcion && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {recipe.descripcion}
          </p>
        )}

        {/* Meta información */}
        <div className="flex items-center gap-3 text-xs text-gray-500 pt-2">
          {recipe.tiempo_preparacion && (
            <div className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{recipe.tiempo_preparacion} min</span>
            </div>
          )}
          {recipe.porciones && (
            <div className="flex items-center gap-1">
              <span>👥</span>
              <span>{recipe.porciones} porciones</span>
            </div>
          )}
        </div>

        {/* Alérgenos */}
        {allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {allergens.slice(0, 3).map((allergen, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full"
              >
                {allergen}
              </span>
            ))}
            {allergens.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{allergens.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    categoria: PropTypes.string,
    tiempo_preparacion: PropTypes.number,
    porciones: PropTypes.number,
    alergenos: PropTypes.string,
    foto_url: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired
}

export default RecipeCard
