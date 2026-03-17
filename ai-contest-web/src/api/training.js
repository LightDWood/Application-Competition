import api from './index.js'

export const trainingApi = {
  getList() {
    return api.get('/trainings')
  },
  
  getById(id) {
    return api.get(`/trainings/${id}`)
  },
  
  create(data) {
    return api.post('/trainings', data)
  },
  
  update(id, data) {
    return api.put(`/trainings/${id}`, data)
  },
  
  delete(id) {
    return api.delete(`/trainings/${id}`)
  }
}

export default trainingApi
