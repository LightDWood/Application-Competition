import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userAuthApi } from '../api/user.js'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('user_token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('user_info') || 'null'))
  const accessToken = ref(localStorage.getItem('user_access_token') || '')

  const isLoggedIn = computed(() => !!accessToken.value)

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

  function setAccessToken(newToken) {
    accessToken.value = newToken
    if (newToken) {
      localStorage.setItem('user_access_token', newToken)
    } else {
      localStorage.removeItem('user_access_token')
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
    let user, jwtAccessToken

    if (args.length === 2) {
      const [username, password] = args
      const res = await userAuthApi.login(username, password)
      if (res.code !== 0) {
        throw new Error(res.message || '登录失败')
      }
      user = res.data.user
      jwtAccessToken = res.data.accessToken
    } else if (args.length === 1 && args[0].user && args[0].accessToken) {
      ({ user, accessToken: jwtAccessToken } = args[0])
    } else {
      throw new Error('无效的登录参数')
    }

    setAccessToken(jwtAccessToken)
    setToken(jwtAccessToken)
    setUserInfo({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    })

    return { code: 0, data: { user, accessToken: jwtAccessToken } }
  }

  async function register(username, email, password) {
    const res = await userAuthApi.register(username, email, password)
    if (res.code === 0 && res.data) {
      setAccessToken(res.data.accessToken)
      setToken(res.data.accessToken)
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
    setAccessToken('')
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
    accessToken,
    userInfo,
    isLoggedIn,
    getUserRole,
    setToken,
    setAccessToken,
    setUserInfo,
    login,
    register,
    logout,
    fetchProfile
  }
})
