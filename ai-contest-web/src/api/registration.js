import api from './index.js'

export const registrationApi = {
  getList(params = {}) {
    return api.get('/registrations', { params })
  },
  
  submit(data) {
    return api.post('/registrations', data)
  },
  
  updateStatus(id, status) {
    return api.put(`/registrations/${id}/status`, { status })
  },
  
  delete(id) {
    return api.delete(`/registrations/${id}`)
  },
  
  export() {
    return api.get('/registrations/export')
  }
}

export default registrationApi
