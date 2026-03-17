import api from './index.js'

export const uploadApi = {
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default uploadApi
