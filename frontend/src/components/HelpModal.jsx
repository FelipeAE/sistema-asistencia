import { useState } from 'react'
import PropTypes from 'prop-types'

function HelpModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('inicio')

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: '🏠' },
    { id: 'asistencia', label: 'Asistencia', icon: '📋' },
    { id: 'admin', label: 'Administración', icon: '⚙️' },
    { id: 'faq', label: 'FAQ', icon: '❓' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📚</span>
              <div>
                <h2 className="text-2xl font-bold">Centro de Ayuda</h2>
                <p className="text-blue-100 text-sm">Sistema de Asistencia Casino</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'inicio' && <TabInicio />}
          {activeTab === 'asistencia' && <TabAsistencia />}
          {activeTab === 'admin' && <TabAdmin />}
          {activeTab === 'faq' && <TabFAQ />}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <p className="text-center text-gray-500 text-sm">
            Sistema de Asistencia Casino v1.0 - ¿Necesitas más ayuda? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  )
}

function TabInicio() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <span className="text-6xl">🍽️</span>
        <h3 className="text-2xl font-bold text-gray-800 mt-4">Bienvenido al Sistema de Asistencia</h3>
        <p className="text-gray-600 mt-2">Este sistema permite registrar la asistencia de empleados e invitados al casino.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📋</span>
            <h4 className="font-bold text-blue-900">Registro de Asistencia</h4>
          </div>
          <p className="text-blue-700 text-sm">
            Página principal donde empleados e invitados registran su asistencia ingresando su RUT.
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📖</span>
            <h4 className="font-bold text-green-900">Recetario</h4>
          </div>
          <p className="text-green-700 text-sm">
            Consulta las recetas disponibles con ingredientes, alérgenos y preparación.
          </p>
        </div>

        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔐</span>
            <h4 className="font-bold text-purple-900">Panel Admin</h4>
          </div>
          <p className="text-purple-700 text-sm">
            Acceso exclusivo para administradores. Gestión completa del sistema.
          </p>
        </div>

        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📊</span>
            <h4 className="font-bold text-orange-900">Reportes</h4>
          </div>
          <p className="text-orange-700 text-sm">
            Genera reportes Excel de asistencia por día, mes o rango de fechas.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-amber-900">Consejo</h4>
            <p className="text-amber-700 text-sm">
              El sistema solo permite registrar asistencia durante los horarios de comida configurados.
              Verás el horario actual en la pantalla principal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabAsistencia() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <span>📋</span> Cómo Registrar Asistencia
      </h3>

      {/* Para Empleados */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span>👤</span> Para Empleados
        </h4>
        <ol className="space-y-3 text-blue-800">
          <li className="flex items-start gap-3">
            <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
            <span>Ingresa tu RUT en el campo de texto (formato: 12345678-9)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
            <span>Haz clic en &quot;Buscar Empleado&quot;</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
            <span>Verifica que tus datos sean correctos (nombre, área, foto)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
            <span>Confirma tu asistencia haciendo clic en el botón verde</span>
          </li>
        </ol>
      </div>

      {/* Para Invitados */}
      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
        <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
          <span>✨</span> Para Invitados
        </h4>
        <ol className="space-y-3 text-emerald-800">
          <li className="flex items-start gap-3">
            <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
            <span>Haz clic en &quot;Registrar Invitado&quot;</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
            <span>Completa el formulario con tus datos personales</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
            <span>Indica la empresa de donde vienes y motivo de visita</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
            <span>Confirma tu registro</span>
          </li>
        </ol>
      </div>

      {/* Horarios */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>⏰</span> Horarios de Comida
        </h4>
        <p className="text-gray-600 mb-3">
          El sistema solo permite registrar asistencia durante los horarios configurados:
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border">
            <span className="text-2xl">🌅</span>
            <p className="font-medium text-gray-800">Desayuno</p>
            <p className="text-sm text-gray-500">Mañana</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <span className="text-2xl">🍽️</span>
            <p className="font-medium text-gray-800">Almuerzo</p>
            <p className="text-sm text-gray-500">Mediodía</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <span className="text-2xl">🌙</span>
            <p className="font-medium text-gray-800">Cena</p>
            <p className="text-sm text-gray-500">Noche</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Los horarios exactos se muestran en la pantalla principal.
        </p>
      </div>
    </div>
  )
}

function TabAdmin() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <span>⚙️</span> Panel de Administración
      </h3>

      <p className="text-gray-600">
        El panel de administración permite gestionar todos los aspectos del sistema.
        Accede haciendo clic en &quot;Admin&quot; en la barra de navegación.
      </p>

      <div className="grid gap-4">
        <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-3xl">👥</span>
            <div>
              <h4 className="font-bold text-gray-800">Gestión de Empleados</h4>
              <p className="text-gray-600 text-sm mt-1">
                Agregar, editar y eliminar empleados. Importar desde Excel. Subir fotos.
              </p>
              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                <li>• Importación masiva desde archivos Excel</li>
                <li>• Gestión de fotos de perfil</li>
                <li>• Filtros por área y estado</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🎫</span>
            <div>
              <h4 className="font-bold text-gray-800">Gestión de Invitados</h4>
              <p className="text-gray-600 text-sm mt-1">
                Ver historial de invitados, editar información y gestionar registros.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-yellow-300 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🍽️</span>
            <div>
              <h4 className="font-bold text-gray-800">Gestión de Menús</h4>
              <p className="text-gray-600 text-sm mt-1">
                Configurar el menú del día que se muestra en la pantalla de asistencia.
              </p>
              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                <li>• Entrada, plato principal, postre y ensalada</li>
                <li>• Menú vegetariano</li>
                <li>• Se muestra automáticamente a los usuarios</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-3xl">📖</span>
            <div>
              <h4 className="font-bold text-gray-800">Gestión de Recetas</h4>
              <p className="text-gray-600 text-sm mt-1">
                Crear y editar recetas con ingredientes, preparación y alérgenos.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-3xl">📊</span>
            <div>
              <h4 className="font-bold text-gray-800">Reportes</h4>
              <p className="text-gray-600 text-sm mt-1">
                Exportar datos de asistencia a Excel.
              </p>
              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                <li>• Reporte diario</li>
                <li>• Reporte mensual</li>
                <li>• Reporte por rango de fechas</li>
                <li>• Incluye empleados e invitados</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-pink-300 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-3xl">📈</span>
            <div>
              <h4 className="font-bold text-gray-800">Estadísticas</h4>
              <p className="text-gray-600 text-sm mt-1">
                Visualiza gráficos y análisis de la asistencia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabFAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: '¿Qué hago si mi RUT no aparece en el sistema?',
      answer: 'Contacta al administrador del sistema para que te agregue a la base de datos de empleados. Necesitarás proporcionar tu RUT, nombre completo y área de trabajo.'
    },
    {
      question: '¿Puedo registrar asistencia fuera del horario de comida?',
      answer: 'No, el sistema solo permite registrar asistencia durante los horarios de comida configurados. Esto asegura que los registros sean precisos.'
    },
    {
      question: '¿Qué pasa si ya registré mi asistencia hoy?',
      answer: 'El sistema detectará que ya tienes un registro para el tipo de comida actual y te mostrará un mensaje indicándolo. Solo se permite un registro por persona por cada tipo de comida.'
    },
    {
      question: '¿Cómo registro a un invitado?',
      answer: 'Haz clic en el botón "Registrar Invitado" en la pantalla principal y completa el formulario con los datos del visitante.'
    },
    {
      question: '¿Dónde puedo ver el menú del día?',
      answer: 'El menú del día se muestra automáticamente en la pantalla principal de asistencia, al lado derecho del formulario de registro.'
    },
    {
      question: '¿Cómo importo empleados desde Excel?',
      answer: 'En el panel de administración, ve a "Gestión de Empleados" y usa el botón de importar. El archivo Excel debe tener las columnas: RUT, Nombre, Apellido, Área.'
    },
    {
      question: '¿Cómo genero un reporte de asistencia?',
      answer: 'En el panel de administración, ve a "Reportes", selecciona el tipo de reporte (diario, mensual o por fechas) y haz clic en descargar. Se generará un archivo Excel.'
    },
    {
      question: '¿Qué información contienen los reportes Excel?',
      answer: 'Los reportes incluyen: fecha, tipo de comida, nombre del empleado/invitado, RUT, área/empresa, hora de registro y tipo de persona (empleado o invitado).'
    },
    {
      question: '¿Cómo cambio los horarios de comida?',
      answer: 'Los horarios de comida se configuran directamente en el backend del sistema. Contacta al desarrollador para modificarlos.'
    },
    {
      question: '¿El sistema funciona sin internet?',
      answer: 'El sistema funciona en red local. Mientras el servidor esté encendido y el dispositivo esté conectado a la misma red, funcionará correctamente.'
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <span>❓</span> Preguntas Frecuentes
      </h3>

      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full p-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-800">{faq.question}</span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="p-4 bg-white border-t border-gray-100">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

HelpModal.propTypes = {
  onClose: PropTypes.func.isRequired
}

export default HelpModal
