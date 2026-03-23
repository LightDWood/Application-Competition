import api from './index.js'

export const authApi = {
  login(username, password) {
    return api.post('/user/login', { username, password })
  },

  changePassword(oldPassword, newPassword) {
    return api.post('/user/change-password', {
      oldPassword,
      newPassword
    })
  }
}

export default authApi