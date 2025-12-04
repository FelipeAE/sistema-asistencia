import { useState } from 'react'
import PropTypes from 'prop-types'
import { guestsAPI, attendanceAPI } from '../services/api'

function GuestForm({ onClose, onSuccess, tipoComida }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    empresa: '',
    region: '',
    motivo_visita: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Crear invitado
      const guest = await guestsAPI.create(formData)
      
      // Registrar asistencia
      await attendanceAPI.registerGuest(guest.id, tipoComida)
      
      onSuccess(guest)
    } catch (err) {
      setError(err.message || 'Error al registrar invitado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-semibold mb-4">Registrar Invitado</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="input-field"
              maxLength="50"
            />
          </div>

          {/* Apellido */}
          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
            </label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
              className="input-field"
              maxLength="50"
            />
          </div>

          {/* Empresa */}
          <div>
            <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <input
              type="text"
              id="empresa"
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              className="input-field"
              maxLength="100"
            />
          </div>

          {/* Región */}
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
              Región
            </label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Seleccionar región</option>
              <option value="Arica y Parinacota">Arica y Parinacota</option>
              <option value="Tarapacá">Tarapacá</option>
              <option value="Antofagasta">Antofagasta</option>
              <option value="Atacama">Atacama</option>
              <option value="Coquimbo">Coquimbo</option>
              <option value="Valparaíso">Valparaíso</option>
              <option value="Metropolitana">Metropolitana</option>
              <option value="O'Higgins">O'Higgins</option>
              <option value="Maule">Maule</option>
              <option value="Ñuble">Ñuble</option>
              <option value="Biobío">Biobío</option>
              <option value="Araucanía">Araucanía</option>
              <option value="Los Ríos">Los Ríos</option>
              <option value="Los Lagos">Los Lagos</option>
              <option value="Aysén">Aysén</option>
              <option value="Magallanes">Magallanes</option>
            </select>
          </div>

          {/* Motivo de Visita */}
          <div>
            <label htmlFor="motivo_visita" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de Visita *
            </label>
            <textarea
              id="motivo_visita"
              name="motivo_visita"
              value={formData.motivo_visita}
              onChange={handleChange}
              required
              rows="3"
              className="input-field resize-none"
              maxLength="200"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

GuestForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  tipoComida: PropTypes.string.isRequired
}

export default GuestForm
