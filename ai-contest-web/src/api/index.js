import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 401) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_info')
        if (window.location.pathname.includes('admin')) {
          window.location.href = '/login'
        }
      }
      
      return Promise.reject(data || { message: '请求失败' })
    }
    
    return Promise.reject({ message: '网络错误，请检查网络连接' })
  }
)

export default api
