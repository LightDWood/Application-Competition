import axios from 'axios'

let isRefreshing = false
let refreshPromise = null

const userApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

const getAccessToken = () => localStorage.getItem('user_access_token')

userApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

userApi.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    if (error.response) {
      const { status, data } = error.response

      if (status === 401 && !error.config._retry) {
        if (isRefreshing) {
          try {
            await refreshPromise
            error.config.headers.Authorization = `Bearer ${getAccessToken()}`
            return userApi(error.config)
          } catch (refreshError) {
            localStorage.removeItem('user_access_token')
            localStorage.removeItem('user_token')
            localStorage.removeItem('user_info')
            if (window.location.pathname.startsWith('/requirement')) {
              window.location.href = '/user/login'
            }
            return Promise.reject(refreshError)
          }
        }

        isRefreshing = true
        error.config._retry = true

        refreshPromise = (async () => {
          try {
            const res = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/user/refresh`,
              {},
              { withCredentials: true }
            )
            if (res.data.code === 0) {
              const newToken = res.data.data.accessToken
              localStorage.setItem('user_access_token', newToken)
              localStorage.setItem('user_token', newToken)
              return newToken
            }
            throw new Error('Refresh failed')
          } catch (e) {
            localStorage.removeItem('user_access_token')
            localStorage.removeItem('user_token')
            localStorage.removeItem('user_info')
            throw e
          } finally {
            isRefreshing = false
            refreshPromise = null
          }
        })()

        try {
          const newToken = await refreshPromise
          error.config.headers.Authorization = `Bearer ${newToken}`
          return userApi(error.config)
        } catch (refreshError) {
          if (window.location.pathname.startsWith('/requirement')) {
            window.location.href = '/user/login'
          }
          return Promise.reject(refreshError)
        }
      }

      if (status === 401) {
        localStorage.removeItem('user_access_token')
        localStorage.removeItem('user_token')
        localStorage.removeItem('user_info')
        if (window.location.pathname.startsWith('/requirement')) {
          window.location.href = '/user/login'
        }
      }

      return Promise.reject(data || { message: '请求失败' })
    }

    return Promise.reject({ message: '网络错误，请检查网络连接' })
  }
)

export const userAuthApi = {
  register(username, email, password) {
    return userApi.post('/user/register', { username, email, password })
  },

  login(username, password) {
    return userApi.post('/user/login', { username, password })
  },

  logout() {
    return userApi.post('/user/logout')
  },

  getProfile() {
    return userApi.get('/user/profile')
  },

  updateProfile(data) {
    return userApi.put('/user/profile', data)
  },

  changePassword(oldPassword, newPassword) {
    return userApi.post('/user/change-password', { oldPassword, newPassword })
  },

  refreshToken() {
    return userApi.post('/user/refresh')
  }
}

export const adminUserApi = {
  getUsers(params) {
    return userApi.get('/admin/users', { params })
  },

  getUserById(id) {
    return userApi.get(`/admin/users/${id}`)
  },

  deleteUser(id) {
    return userApi.delete(`/admin/users/${id}`)
  },

  updateUserRole(id, role) {
    return userApi.put(`/admin/users/${id}/role`, { role })
  }
}

export default userApi
