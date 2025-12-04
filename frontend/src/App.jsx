import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import AttendancePage from './pages/AttendancePage'
import RecipesPage from './pages/RecipesPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminEmployeesPage from './pages/AdminEmployeesPage'
import AdminGuestsPage from './pages/AdminGuestsPage'
import AdminReportsPage from './pages/AdminReportsPage'
import AdminStatsPage from './pages/AdminStatsPage'
import AdminMenusPage from './pages/AdminMenusPage'
import AdminRecipesPage from './pages/AdminRecipesPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍽️</span>
                <span className="font-bold text-xl text-white">
                  Casino Sistema
                </span>
              </div>
              
              <div className="flex gap-2">
                <Link
                  to="/"
                  className="px-4 py-2 text-gray-200 hover:text-white hover:bg-slate-700 rounded-lg transition-colors font-medium"
                >
                  📋 Asistencia
                </Link>
                <Link
                  to="/recipes"
                  className="px-4 py-2 text-gray-200 hover:text-white hover:bg-slate-700 rounded-lg transition-colors font-medium"
                >
                  📖 Recetario
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-500 rounded-lg transition-colors font-medium"
                >
                  🔐 Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<AttendancePage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/employees" element={<ProtectedRoute><AdminEmployeesPage /></ProtectedRoute>} />
          <Route path="/admin/guests" element={<ProtectedRoute><AdminGuestsPage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute><AdminReportsPage /></ProtectedRoute>} />
          <Route path="/admin/stats" element={<ProtectedRoute><AdminStatsPage /></ProtectedRoute>} />
          <Route path="/admin/menus" element={<ProtectedRoute><AdminMenusPage /></ProtectedRoute>} />
          <Route path="/admin/recipes" element={<ProtectedRoute><AdminRecipesPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
