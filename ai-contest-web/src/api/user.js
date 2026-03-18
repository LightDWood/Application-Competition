import axios from 'axios'

const userApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

userApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token')
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
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 401) {
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
  }
}

export const adminUserApi = {
  // 获取用户列表
  getUsers(params) {
    return userApi.get('/admin/users', { params })
  },
  
  // 获取用户详情
  getUserById(id) {
    return userApi.get(`/admin/users/${id}`)
  },
  
  // 删除用户
  deleteUser(id) {
    return userApi.delete(`/admin/users/${id}`)
  },
  
  // 更新用户角色
  updateUserRole(id, role) {
    return userApi.put(`/admin/users/${id}/role`, { role })
  }
}

export default userApi
