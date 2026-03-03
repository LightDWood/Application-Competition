<template>
  <div class="training-admin-page">
    <section class="page-header">
      <div class="container">
        <h1>培训资料配置管理</h1>
        <p>管理培训资料数据，支持导入、编辑、删除操作</p>
      </div>
    </section>

    <section class="toolbar">
      <div class="container">
        <div class="toolbar-content">
          <div class="toolbar-left">
            <span class="stats">共 {{ trainings.length }} 条培训资料</span>
          </div>
          <div class="toolbar-right">
            <button class="btn btn-primary" @click="openAddModal">
              + 添加培训
            </button>
            <button class="btn btn-outline" @click="downloadTemplate">
              下载导入模板
            </button>
            <label class="btn btn-outline import-label">
              导入培训资料
              <input 
                type="file" 
                ref="importFileInput"
                accept=".csv" 
                @change="handleImport"
                style="display: none"
              >
            </label>
            <button class="btn btn-danger" @click="clearAllTrainings">
              清空全部
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="container main-content">
      <div class="manage-list">
        <div class="manage-item" v-for="training in trainings" :key="training.id">
          <div class="manage-item-index">{{ trainings.indexOf(training) + 1 }}</div>
          <div class="manage-item-info">
            <h4>{{ training.name }}</h4>
            <p>{{ training.videoUrl }}</p>
          </div>
          <div class="manage-item-actions">
            <button class="btn btn-outline btn-sm" @click="openVideo(training.videoUrl)">访问</button>
            <button class="btn btn-outline btn-sm" @click="openEditModal(training)">编辑</button>
            <button class="btn btn-danger btn-sm" @click="deleteTraining(training.id)">删除</button>
          </div>
        </div>
      </div>

      <div v-if="trainings.length === 0" class="empty-state">
        <p>暂无培训资料</p>
        <p class="hint">请点击"添加培训"或"导入培训资料"按钮添加数据</p>
      </div>
    </section>

    <Modal v-model="showAddModal" title="添加培训" width="500px">
      <div class="form-group">
        <label>培训名称</label>
        <input 
          type="text" 
          v-model="newTraining.name" 
          placeholder="请输入培训名称"
          class="form-input"
        >
      </div>
      <div class="form-group">
        <label>视频地址</label>
        <input 
          type="text" 
          v-model="newTraining.videoUrl" 
          placeholder="请输入视频链接地址"
          class="form-input"
        >
      </div>
      <div class="form-group">
        <label>封面图片</label>
        <div class="file-upload" @click="triggerFileInput">
          <input 
            type="file" 
            ref="fileInput"
            accept="image/*" 
            @change="handleFileChange"
            style="display: none"
          >
          <img v-if="newTraining.coverImage" :src="newTraining.coverImage" class="file-preview">
          <div v-else class="upload-placeholder">
            <div class="upload-icon">🖼️</div>
            <div class="upload-text">点击上传封面图片</div>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-outline" @click="showAddModal = false">取消</button>
        <button class="btn btn-primary" @click="addTraining">保存</button>
      </template>
    </Modal>

    <Modal v-model="showEditModal" title="编辑培训" width="500px">
      <div class="form-group">
        <label>培训名称</label>
        <input 
          type="text" 
          v-model="editingTraining.name" 
          placeholder="请输入培训名称"
          class="form-input"
        >
      </div>
      <div class="form-group">
        <label>视频地址</label>
        <input 
          type="text" 
          v-model="editingTraining.videoUrl" 
          placeholder="请输入视频链接地址"
          class="form-input"
        >
      </div>
      <div class="form-group">
        <label>封面图片</label>
        <div class="file-upload" @click="triggerEditFileInput">
          <input 
            type="file" 
            ref="editFileInput"
            accept="image/*" 
            @change="handleEditFileChange"
            style="display: none"
          >
          <img v-if="editingTraining.coverImage" :src="editingTraining.coverImage" class="file-preview">
          <div v-else class="upload-placeholder">
            <div class="upload-icon">🖼️</div>
            <div class="upload-text">点击上传封面图片</div>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-outline" @click="showEditModal = false">取消</button>
        <button class="btn btn-primary" @click="updateTraining">保存</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Modal from '../components/Modal.vue'

const STORAGE_KEY = 'ai-contest-trainings'

const trainings = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)

const newTraining = ref({
  name: '',
  videoUrl: '',
  coverImage: ''
})

const editingTraining = ref({
  id: null,
  name: '',
  videoUrl: '',
  coverImage: ''
})

const fileInput = ref(null)
const editFileInput = ref(null)
const importFileInput = ref(null)

const loadTrainings = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  if (data) {
    trainings.value = JSON.parse(data)
  }
}

const saveTrainings = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trainings.value))
}

const openVideo = (url) => {
  window.open(url, '_blank')
}

const openAddModal = () => {
  newTraining.value = { name: '', videoUrl: '', coverImage: '' }
  showAddModal.value = true
}

const openEditModal = (training) => {
  editingTraining.value = { ...training }
  showEditModal.value = true
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const triggerEditFileInput = () => {
  editFileInput.value?.click()
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      newTraining.value.coverImage = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleEditFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      editingTraining.value.coverImage = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

const addTraining = () => {
  if (!newTraining.value.name || !newTraining.value.videoUrl) {
    alert('请填写培训名称和视频地址')
    return
  }

  const training = {
    id: Date.now(),
    ...newTraining.value,
    createdAt: new Date().toISOString()
  }

  trainings.value.push(training)
  saveTrainings()
  showAddModal.value = false
  newTraining.value = { name: '', videoUrl: '', coverImage: '' }
}

const updateTraining = () => {
  if (!editingTraining.value.name || !editingTraining.value.videoUrl) {
    alert('请填写培训名称和视频地址')
    return
  }

  const index = trainings.value.findIndex(t => t.id === editingTraining.value.id)
  if (index !== -1) {
    trainings.value[index] = {
      ...editingTraining.value,
      updatedAt: new Date().toISOString()
    }
    saveTrainings()
  }

  showEditModal.value = false
}

const deleteTraining = (id) => {
  if (confirm('确定要删除这个培训吗？')) {
    trainings.value = trainings.value.filter(t => t.id !== id)
    saveTrainings()
  }
}

const clearAllTrainings = () => {
  if (trainings.value.length === 0) {
    alert('当前没有培训资料')
    return
  }
  if (confirm(`确定要清空全部 ${trainings.value.length} 条培训资料吗？此操作不可恢复！`)) {
    trainings.value = []
    saveTrainings()
    alert('已清空全部培训资料')
  }
}

const downloadTemplate = () => {
  const templateContent = `培训名称,培训地址
AI说-AI赋能法律人工作：原理、工具,https://live-og3lg6.vhall.cn/v3/lives/watch/763568303
圆桌论坛：生成式AI对企业合规的挑战,https://t.568live.cn/FK1YtW
主题演讲：全球视角下的AI合规与监管趋势,https://live.vhall.com/v3/lives/watch/686916117
专家视角：通用型AI与法律AI的差异与融合,https://live.vhall.com/v3/lives/watch/560575636
圆桌讨论：法务部门如何使用AI赋能工作场景,https://live.vhall.com/v3/lives/watch/626184781
圆桌讨论：生成式AI对企业合规的挑战与风险防控,https://live.vhall.com/v3/lives/watch/580655488
生成式AI法律治理：全球热点、法律挑战与合规实践,https://live.vhall.com/v3/lives/watch/627813242
AI+应用出海合规风险,https://live.vhall.com/v3/lives/watch/254857703
人工智能的法律边界与出海路径之一,https://live.vhall.com/v3/lives/watch/617378607
未来法律·AI说-跨境出海中的AI法律应用：从效率工具到准确决策的协同路径,https://live-og3lg6.vhall.cn/v3/lives/watch/998354907
未来法律·AI说-不是禁用，而是善用：企业法务如何高效、负责任地使用AI？,https://live-og3lg6.vhall.cn/v3/lives/watch/959768469
未来法律·AI说:AIGC应用中的法律挑战、立法趋势与应对之道,https://live-og3lg6.vhall.cn/v3/lives/watch/178631583
未来法律·AI说-法律人共创畅想法律AI的未来,https://live-og3lg6.vhall.cn/v3/lives/watch/433075047
未来法律·AI说-律所与企业双重视角下的人机协同,https://live-og3lg6.vhall.cn/v3/lives/watch/293362594`

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + templateContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '培训资料导入模板.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const handleImport = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const content = event.target.result
      const lines = content.split(/\r?\n/).filter(line => line.trim())
      
      if (lines.length < 2) {
        alert('CSV文件格式错误：至少需要包含标题行和一行数据')
        return
      }

      const headerLine = lines[0]
      const headers = parseCSVLine(headerLine)
      
      if (headers.length < 2) {
        alert('CSV文件格式错误：需要包含"培训名称"和"培训地址"两列')
        return
      }

      const importedTrainings = []
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        if (values.length >= 2 && values[0].trim() && values[1].trim()) {
          importedTrainings.push({
            id: Date.now() + i,
            name: values[0].trim(),
            videoUrl: values[1].trim(),
            coverImage: '',
            createdAt: new Date().toISOString()
          })
        }
      }

      if (importedTrainings.length === 0) {
        alert('没有找到有效的培训资料数据')
        return
      }

      const confirmMsg = `即将导入 ${importedTrainings.length} 条培训资料，是否继续？\n（将追加到现有数据后）`
      if (confirm(confirmMsg)) {
        trainings.value = [...trainings.value, ...importedTrainings]
        saveTrainings()
        alert(`成功导入 ${importedTrainings.length} 条培训资料`)
      }
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败：文件格式错误')
    }
  }
  
  reader.readAsText(file, 'UTF-8')
  e.target.value = ''
}

const parseCSVLine = (line) => {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  
  return result.map(item => item.trim().replace(/^"|"$/g, ''))
}

onMounted(() => {
  loadTrainings()
})
</script>

<style scoped>
.training-admin-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px;
  color: white;
  text-align: center;
}

.page-header h1 {
  font-size: 36px;
  margin-bottom: 15px;
}

.page-header p {
  font-size: 16px;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.toolbar {
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.stats {
  font-size: 14px;
  color: #666;
  background: #f0f0f0;
  padding: 8px 16px;
  border-radius: 20px;
}

.btn {
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn-danger {
  background: #ff6b6b;
  color: white;
}

.btn-danger:hover {
  background: #ee5a5a;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.import-label {
  cursor: pointer;
}

.main-content {
  padding: 40px 0;
}

.manage-list {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.manage-item {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 15px;
}

.manage-item:last-child {
  border-bottom: none;
}

.manage-item-index {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.manage-item-info {
  flex: 1;
  min-width: 0;
}

.manage-item-info h4 {
  font-size: 15px;
  color: #333;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.manage-item-info p {
  font-size: 13px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.manage-item-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #888;
}

.empty-state p {
  margin: 5px 0;
}

.empty-state .hint {
  font-size: 14px;
  color: #aaa;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.file-upload {
  border: 2px dashed #e0e0e0;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.file-upload:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.upload-placeholder {
  color: #666;
}

.upload-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.upload-text {
  font-size: 14px;
}

.file-preview {
  width: 100%;
  max-height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .toolbar-content {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-right {
    justify-content: center;
  }

  .manage-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .manage-item-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 10px;
  }
}
</style>
