import api from './index.js'

export const contestApi = {
  getInfo() {
    return api.get('/contest/info')
  },
  
  updateInfo(data) {
    return api.put('/contest/info', data)
  },
  
  getStages() {
    return api.get('/contest/stages')
  },
  
  createStage(data) {
    return api.post('/contest/stages', data)
  },
  
  updateStage(id, data) {
    return api.put(`/contest/stages/${id}`, data)
  },
  
  deleteStage(id) {
    return api.delete(`/contest/stages/${id}`)
  },
  
  getTools() {
    return api.get('/contest/tools')
  },
  
  createTool(data) {
    return api.post('/contest/tools', data)
  },
  
  updateTool(id, data) {
    return api.put(`/contest/tools/${id}`, data)
  },
  
  deleteTool(id) {
    return api.delete(`/contest/tools/${id}`)
  }
}

export default contestApi
