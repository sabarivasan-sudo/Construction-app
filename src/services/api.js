const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('token')
}

// Helper function to make API requests
const request = async (endpoint, options = {}) => {
  const token = getToken()
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
      // Handle 401 (unauthorized) - redirect to login
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      throw new Error(data.message || 'Request failed')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// API methods
export const api = {
  // Auth
  login: (email, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  },

  register: (userData) => {
    return request('/auth/register', {
      method: 'POST',
      body: userData,
    })
  },

  getMe: () => {
    return request('/auth/me')
  },

  // Dashboard
  getDashboard: () => {
    return request('/dashboard')
  },

  // Projects
  getProjects: () => {
    return request('/projects')
  },

  createProject: (projectData) => {
    return request('/projects', {
      method: 'POST',
      body: projectData,
    })
  },

  // Tasks
  getTasks: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return request(`/tasks${queryString ? `?${queryString}` : ''}`)
  },

  createTask: (taskData) => {
    return request('/tasks', {
      method: 'POST',
      body: taskData,
    })
  },

  // Users
  getUsers: () => {
    return request('/users')
  },

  createUser: (userData) => {
    return request('/users', {
      method: 'POST',
      body: userData,
    })
  },

  // Add more API methods as needed
}

export default api

