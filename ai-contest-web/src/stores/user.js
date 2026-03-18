import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userAuthApi } from '../api/user.js'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('user_token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('user_info') || 'null'))
  
  const isLoggedIn = computed(() => !!token.value)
  
  const getUserRole = computed(() => {
    return userInfo.value?.role
  })
  
  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('user_token', newToken)
    } else {
      localStorage.removeItem('user_token')
    }
  }
  
  function setUserInfo(info) {
    userInfo.value = info
    if (info) {
      localStorage.setItem('user_info', JSON.stringify(info))
    } else {
      localStorage.removeItem('user_info')
    }
  }
  
  async function login(...args) {
    let user, jwtToken
    
    if (args.length === 2) {
      const [username, password] = args
      const res = await userAuthApi.login(username, password)
      if (res.code !== 0) {
        throw new Error(res.message || '登录失败')
      }
      user = res.data.user
      jwtToken = res.data.token
    } else if (args.length === 1 && args[0].user && args[0].token) {
      ({ user, token: jwtToken } = args[0])
    } else {
      throw new Error('无效的登录参数')
    }
    
    localStorage.setItem('user_token', jwtToken)
    localStorage.setItem('user_info', JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }))
    
    userInfo.value = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
    token.value = jwtToken
    
    return { code: 0, data: { user, token: jwtToken } }
  }
  
  async function register(username, email, password) {
    const res = await userAuthApi.register(username, email, password)
    if (res.code === 0 && res.data) {
      setToken(res.data.token)
      setUserInfo(res.data.user)
    }
    return res
  }
  
  async function logout() {
    try {
      await userAuthApi.logout()
    } catch (e) {
      console.error('Logout error:', e)
    }
    setToken('')
    setUserInfo(null)
  }
  
  async function fetchProfile() {
    const res = await userAuthApi.getProfile()
    if (res.code === 0 && res.data) {
      setUserInfo(res.data)
    }
    return res
  }
  
  return {
    token,
    userInfo,
    isLoggedIn,
    getUserRole,
    setToken,
    setUserInfo,
    login,
    register,
    logout,
    fetchProfile
  }
})
