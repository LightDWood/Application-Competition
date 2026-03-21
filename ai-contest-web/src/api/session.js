import api from './index.js'

const V2_BASE = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/v2` : 'http://localhost:3000/api/v2'

export const sessionApi = {
  v2: {
    create(userId, agentId, title) {
      return api.post(`${V2_BASE}/sessions`, { userId, agentId, title })
    },

    getById(id) {
      return api.get(`${V2_BASE}/sessions/${id}`)
    },

    list(userId, params = {}) {
      return api.get(`${V2_BASE}/sessions`, { params: { userId, ...params } })
    },

    update(id, data) {
      return api.put(`${V2_BASE}/sessions/${id}`, data)
    },

    delete(id) {
      return api.delete(`${V2_BASE}/sessions/${id}`)
    },

    chat(sessionId, content) {
      const token = localStorage.getItem('user_token')

      return fetch(`${V2_BASE}/sessions/${sessionId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      })
    }
  }
}

export default sessionApi