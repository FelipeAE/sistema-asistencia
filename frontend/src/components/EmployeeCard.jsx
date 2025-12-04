import PropTypes from 'prop-types'
import { photosAPI } from '../services/api'

function EmployeeCard({ employee, onConfirm, onCancel }) {
  const photoUrl = employee.foto_url 
    ? photosAPI.getPhotoUrl(employee.foto_url)
    : null

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-purple-100 animate-fade-in">
      <div className="text-center">
        {/* Foto del empleado */}
        <div className="mb-6 flex justify-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={employee.nombre}
              className="w-40 h-40 rounded-3xl object-cover border-4 border-gradient-to-br from-purple-500 to-pink-500 shadow-2xl ring-4 ring-purple-100"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            className={`w-40 h-40 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl ring-4 ring-purple-100 ${
              photoUrl ? 'hidden' : ''
            }`}
          >
            {employee.nombre.split(' ').map(n => n.charAt(0)).slice(0, 2).join('')}
          </div>
        </div>

        {/* Información del empleado */}
        <h3 className="text-3xl font-extrabold text-gray-800 mb-2">
          {employee.nombre}
        </h3>
        <div className="inline-block px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold text-sm mb-4">
          {employee.cargo || 'Empleado'}
        </div>
        <div className="space-y-2 mb-8">
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <span className="font-bold">🆔</span>
            <span className="font-mono">{employee.rut}</span>
          </p>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <span className="font-bold">🏢</span>
            <span>{employee.departamento || 'No especificado'}</span>
          </p>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            ❌ Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            ✅ Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

EmployeeCard.propTypes = {
  employee: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    rut: PropTypes.string.isRequired,
    cargo: PropTypes.string,
    departamento: PropTypes.string,
    foto_url: PropTypes.string
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}

export default EmployeeCard
