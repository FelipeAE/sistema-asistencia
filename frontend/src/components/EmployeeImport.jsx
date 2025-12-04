import { useState } from 'react'
import PropTypes from 'prop-types'

function EmployeeImport({ onImportComplete }) {
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validar tipo de archivo
      const validExtensions = ['xlsx', 'xls', 'csv']
      const fileExt = selectedFile.name.split('.').pop().toLowerCase()
      
      if (!validExtensions.includes(fileExt)) {
        alert('Formato de archivo no válido. Use .xlsx, .xls o .csv')
        e.target.value = ''
        return
      }
      
      setFile(selectedFile)
      setResult(null)
      setShowResults(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/api/import/employees/template', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al descargar plantilla')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plantilla_empleados.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Error al descargar plantilla: ' + error.message)
    }
  }

  const handleImport = async () => {
    if (!file) {
      alert('Seleccione un archivo primero')
      return
    }

    setImporting(true)
    setResult(null)

    try {
      const token = localStorage.getItem('access_token')
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/api/import/employees', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al importar archivo')
      }

      const data = await response.json()
      setResult(data)
      setShowResults(true)
      
      // Si fue exitoso, notificar al padre
      if (data.success && data.imported > 0 && onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      alert('Error al importar: ' + error.message)
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setShowResults(false)
    // Reset file input
    const fileInput = document.getElementById('file-import')
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Importación Masiva de Empleados
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Importa empleados desde un archivo Excel o CSV
          </p>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          📥 Descargar Plantilla
        </button>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Descarga la plantilla Excel haciendo clic en el botón de arriba</li>
          <li>2. Completa los datos de los empleados en la plantilla</li>
          <li>3. Las columnas requeridas son: <strong>RUT, Nombre, Apellido</strong></li>
          <li>4. Las columnas opcionales son: Cargo, Departamento, Email, Teléfono</li>
          <li>5. Guarda el archivo y súbelo usando el botón de abajo</li>
        </ul>
      </div>

      {/* Selección de archivo */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <div className="text-5xl mb-3">📄</div>
          <label htmlFor="file-import" className="btn-primary cursor-pointer inline-block mb-2">
            Seleccionar Archivo
          </label>
          <input
            id="file-import"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-2">
              Archivo seleccionado: <strong>{file.name}</strong>
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Formatos permitidos: .xlsx, .xls, .csv
          </p>
        </div>
      </div>

      {/* Botones de acción */}
      {file && !showResults && (
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={importing}
            className="btn-primary flex-1"
          >
            {importing ? 'Importando...' : '📤 Importar Empleados'}
          </button>
          <button
            onClick={handleReset}
            disabled={importing}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Resultados */}
      {showResults && result && (
        <div className="space-y-4">
          {/* Resumen */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="card bg-blue-50">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-2xl font-bold text-blue-900">{result.summary?.total || 0}</div>
              <div className="text-sm text-blue-700">Total filas</div>
            </div>
            <div className="card bg-green-50">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-2xl font-bold text-green-900">{result.imported || 0}</div>
              <div className="text-sm text-green-700">Importados</div>
            </div>
            <div className="card bg-yellow-50">
              <div className="text-2xl mb-1">⏭️</div>
              <div className="text-2xl font-bold text-yellow-900">{result.skipped || 0}</div>
              <div className="text-sm text-yellow-700">Ya existían</div>
            </div>
            <div className="card bg-red-50">
              <div className="text-2xl mb-1">❌</div>
              <div className="text-2xl font-bold text-red-900">{result.errors?.length || 0}</div>
              <div className="text-sm text-red-700">Errores</div>
            </div>
          </div>

          {/* Errores */}
          {result.errors && result.errors.length > 0 && (
            <div className="card bg-red-50 border border-red-200">
              <h4 className="font-semibold text-red-900 mb-3">
                Errores encontrados ({result.errors.length})
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {result.errors.slice(0, 20).map((error, idx) => (
                  <div key={idx} className="text-sm bg-white p-2 rounded border border-red-100">
                    <span className="font-medium text-red-800">
                      Fila {error.row || error.rut}:
                    </span>
                    <span className="text-red-700 ml-2">{error.error}</span>
                  </div>
                ))}
                {result.errors.length > 20 && (
                  <p className="text-sm text-red-700 italic">
                    ... y {result.errors.length - 20} errores más
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botón para nueva importación */}
          <button
            onClick={handleReset}
            className="btn-primary w-full"
          >
            Nueva Importación
          </button>
        </div>
      )}
    </div>
  )
}

EmployeeImport.propTypes = {
  onImportComplete: PropTypes.func
}

export default EmployeeImport
