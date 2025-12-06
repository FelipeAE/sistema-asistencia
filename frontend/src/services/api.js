/**
 * Servicio de API para comunicación con backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    
    // Si es error 401 (no autorizado), limpiar token y redirigir a login
    if (response.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      // Solo redirigir si estamos en una página admin
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login'
      }
    }
    
    throw new ApiError(
      data.detail || 'Error en la solicitud',
      response.status,
      data
    )
  }
  
  // Si es 204 No Content, no hay body
  if (response.status === 204) {
    return null
  }
  
  return response.json()
}

// Employees
export const employeesAPI = {
  async getByRut(rut, pin = null) {
    let url = `${API_BASE_URL}/employees/${rut}`
    if (pin) {
      url += `?pin=${encodeURIComponent(pin)}`
    }
    const response = await fetch(url)
    return handleResponse(response)
  },
  
  async list(skip = 0, limit = 50) {
    const response = await fetch(`${API_BASE_URL}/employees?skip=${skip}&limit=${limit}`)
    return handleResponse(response)
  },
  
  async create(employeeData) {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
    })
    return handleResponse(response)
  },
  
  async update(id, employeeData) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
    })
    return handleResponse(response)
  },
  
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  },
  
  async uploadPhoto(id, file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/photos/employee/${id}`, {
      method: 'POST',
      body: formData
    })
    return handleResponse(response)
  },
  
  async deletePhoto(id) {
    const response = await fetch(`${API_BASE_URL}/photos/employee/${id}/photo`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  }
}

// Attendance
export const attendanceAPI = {
  async registerEmployee(rut, tipoComida, observaciones = null) {
    const response = await fetch(`${API_BASE_URL}/attendance/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rut, tipo_comida: tipoComida, observaciones })
    })
    return handleResponse(response)
  },
  
  async registerGuest(guestId, tipoComida, observaciones = null) {
    const response = await fetch(`${API_BASE_URL}/attendance/register-guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest_id: guestId, tipo_comida: tipoComida, observaciones })
    })
    return handleResponse(response)
  },
  
  async getToday() {
    const response = await fetch(`${API_BASE_URL}/attendance/today`)
    return handleResponse(response)
  },
  
  async getByDate(fecha, tipoComida = null) {
    let url = `${API_BASE_URL}/attendance/date/${fecha}`
    if (tipoComida) {
      url += `?tipo_comida=${tipoComida}`
    }
    const response = await fetch(url)
    return handleResponse(response)
  }
}

// Guests
export const guestsAPI = {
  async list(skip = 0, limit = 50, empresa = null, region = null) {
    let url = `${API_BASE_URL}/guests?skip=${skip}&limit=${limit}`
    if (empresa) url += `&empresa=${empresa}`
    if (region) url += `&region=${region}`
    
    const response = await fetch(url)
    return handleResponse(response)
  },
  
  async get(id) {
    const response = await fetch(`${API_BASE_URL}/guests/${id}`)
    return handleResponse(response)
  },
  
  async create(guestData) {
    const response = await fetch(`${API_BASE_URL}/guests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guestData)
    })
    return handleResponse(response)
  },
  
  async update(id, guestData) {
    const response = await fetch(`${API_BASE_URL}/guests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guestData)
    })
    return handleResponse(response)
  },
  
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/guests/${id}`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  },
  
  async search(query) {
    const response = await fetch(`${API_BASE_URL}/guests/search/?q=${encodeURIComponent(query)}`)
    return handleResponse(response)
  },
  
  async uploadPhoto(id, file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/photos/guest/${id}`, {
      method: 'POST',
      body: formData
    })
    return handleResponse(response)
  },
  
  async deletePhoto(id) {
    const response = await fetch(`${API_BASE_URL}/photos/guest/${id}/photo`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  }
}

// Recipes
export const recipesAPI = {
  async list(skip = 0, limit = 20, categoria = null, activo = null) {
    let url = `${API_BASE_URL}/recipes/?skip=${skip}&limit=${limit}`
    if (categoria) url += `&categoria=${categoria}`
    if (activo === true) url += `&activo=true`
    if (activo === false) url += `&activo=false`
    
    const response = await fetch(url)
    return handleResponse(response)
  },
  
  async get(id) {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`)
    return handleResponse(response)
  },
  
  async search(query, categoria = null, sinAlergenos = null, maxTiempo = null) {
    let url = `${API_BASE_URL}/recipes/search?`
    if (query) url += `q=${encodeURIComponent(query)}&`
    if (categoria) url += `categoria=${categoria}&`
    if (sinAlergenos) url += `sin_alergenos=${sinAlergenos.join(',')}&`
    if (maxTiempo) url += `max_tiempo=${maxTiempo}&`
    
    const response = await fetch(url)
    return handleResponse(response)
  },
  
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/recipes/categories`)
    return handleResponse(response)
  },

  async create(recipeData) {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(recipeData)
    })
    return handleResponse(response)
  },

  async update(id, recipeData) {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(recipeData)
    })
    return handleResponse(response)
  },

  async delete(id) {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return handleResponse(response)
  }
}

// Menus
export const menusAPI = {
  async getToday(tipoComida = null) {
    let url = `${API_BASE_URL}/menus/today`
    if (tipoComida) url += `?tipo_comida=${tipoComida}`

    const response = await fetch(url)
    return handleResponse(response)
  },

  async list(fecha = null, tipoComida = null) {
    let url = `${API_BASE_URL}/menus?`
    if (fecha) url += `fecha=${fecha}&`
    if (tipoComida) url += `tipo_comida=${tipoComida}&`

    const response = await fetch(url)
    return handleResponse(response)
  },

  async get(id) {
    const response = await fetch(`${API_BASE_URL}/menus/${id}`)
    return handleResponse(response)
  },

  async create(menuData) {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_BASE_URL}/menus`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(menuData)
    })
    return handleResponse(response)
  },

  async update(id, menuData) {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(menuData)
    })
    return handleResponse(response)
  },

  async delete(id) {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return handleResponse(response)
  }
}

// Meal Schedules
export const mealSchedulesAPI = {
  async list() {
    const response = await fetch(`${API_BASE_URL}/meal-schedules`)
    return handleResponse(response)
  },
  
  async getInfo() {
    const response = await fetch(`${API_BASE_URL}/meal-schedules/info`)
    return handleResponse(response)
  },
  
  async get(tipoComida) {
    const response = await fetch(`${API_BASE_URL}/meal-schedules/${tipoComida}`)
    return handleResponse(response)
  }
}

// Photos
export const photosAPI = {
  async uploadEmployeePhoto(employeeId, file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/photos/employee/${employeeId}`, {
      method: 'POST',
      body: formData
    })
    return handleResponse(response)
  },
  
  async uploadGuestPhoto(guestId, file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_BASE_URL}/photos/guest/${guestId}`, {
      method: 'POST',
      body: formData
    })
    return handleResponse(response)
  },
  
  async deleteEmployeePhoto(employeeId) {
    const response = await fetch(`${API_BASE_URL}/photos/employee/${employeeId}`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  },
  
  async deleteGuestPhoto(guestId) {
    const response = await fetch(`${API_BASE_URL}/photos/guest/${guestId}`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  },

  async uploadRecipePhoto(recipeId, file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/photos/recipe/${recipeId}`, {
      method: 'POST',
      body: formData
    })
    return handleResponse(response)
  },

  async deleteRecipePhoto(recipeId) {
    const response = await fetch(`${API_BASE_URL}/photos/recipe/${recipeId}`, {
      method: 'DELETE'
    })
    return handleResponse(response)
  },

  getPhotoUrl(filename) {
    // Si el filename ya incluye /photos/, extraer solo el nombre del archivo
    if (filename.startsWith('/photos/')) {
      filename = filename.replace('/photos/', '')
    }
    // Las fotos se sirven desde StaticFiles en /photos/, no desde /api/photos/
    const baseUrl = API_BASE_URL.replace('/api', '')
    return `${baseUrl}/photos/${filename}`
  }
}

// Auth
export const authAPI = {
  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    return handleResponse(response)
  }
}

// Dashboard
export const dashboardAPI = {
  async getStatsToday() {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_BASE_URL}/dashboard/stats/today`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return handleResponse(response)
  },

  async getStatsEmployees() {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_BASE_URL}/dashboard/stats/employees`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return handleResponse(response)
  },

  async getStatsGuests() {
    const token = localStorage.getItem('access_token')
    const response = await fetch(`${API_BASE_URL}/dashboard/stats/guests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return handleResponse(response)
  }
}

export { ApiError }
