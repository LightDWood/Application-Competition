import userApi from './user.js'

export const sessionApi = {
  getList(params = {}) {
    return userApi.get('/sessions', { params })
  },
  
  create(data) {
    return userApi.post('/sessions', data)
  },
  
  getById(id) {
    return userApi.get(`/sessions/${id}`)
  },
  
  update(id, data) {
    return userApi.put(`/sessions/${id}`, data)
  },
  
  delete(id) {
    return userApi.delete(`/sessions/${id}`)
  },
  
  getMessages(sessionId, params = {}) {
    return userApi.get(`/sessions/${sessionId}/messages`, { params })
  },
  
  sendMessage(sessionId, content, role = 'user') {
    return userApi.post(`/sessions/${sessionId}/messages`, { content, role })
  },
  
  updateMessage(sessionId, messageId, content) {
    return userApi.put(`/sessions/${sessionId}/messages/${messageId}`, { content })
  },
  
  chat(sessionId, content) {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    const token = localStorage.getItem('user_token')
    
    return fetch(`${API_BASE}/sessions/${sessionId}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    })
  }
}

export default sessionApi
