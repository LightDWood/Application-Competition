import api from './index.js'

export const authApi = {
  login(username, password) {
    return api.post('/auth/login', { username, password })
  },
  
  changePassword(username, oldPassword, newPassword) {
    return api.post('/auth/change-password', {
      username,
      oldPassword,
      newPassword
    })
  }
}

export default authApi
