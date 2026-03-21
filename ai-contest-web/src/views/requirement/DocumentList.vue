<template>
  <div class="document-list-page">
    <div class="page-header">
      <h1>文档管理</h1>
      <button @click="loadDocuments" class="btn btn-secondary">刷新</button>
    </div>

    <div class="session-selector">
      <label>选择会话：</label>
      <select v-model="selectedSessionId" @change="loadDocuments" class="session-select">
        <option value="">请选择会话</option>
        <option v-for="session in sessions" :key="session.id" :value="session.id">
          {{ session.title }}
        </option>
      </select>
    </div>

    <div class="document-list" v-loading="loading">
      <div v-if="selectedSessionId && requirementDoc" class="document-card requirement-doc">
        <div class="document-icon">📋</div>
        <div class="document-info">
          <h3 class="document-title">{{ requirementDoc.fileName }}</h3>
          <p class="document-meta">需求收敛文档</p>
        </div>
        <div class="document-actions">
          <button @click="previewDocument(requirementDoc)" class="action-btn">预览</button>
          <button @click="downloadDocument(requirementDoc)" class="action-btn primary">下载</button>
        </div>
      </div>

      <div v-for="doc in artifacts" :key="doc.id" class="document-card">
        <div class="document-icon">📄</div>
        <div class="document-info">
          <h3 class="document-title">{{ doc.name }}</h3>
          <p class="document-meta">
            类型: {{ doc.type }} | {{ formatTime(doc.createdAt) }}
          </p>
        </div>
        <div class="document-actions">
          <button @click="downloadArtifact(doc)" class="action-btn">下载</button>
        </div>
      </div>

      <div v-if="!loading && !selectedSessionId" class="empty-state">
        <p>请选择上方会话查看相关文档</p>
      </div>

      <div v-if="!loading && selectedSessionId && !requirementDoc && artifacts.length === 0" class="empty-state">
        <p>该会话暂无归档文档</p>
      </div>
    </div>

    <div v-if="previewContent" class="modal-overlay" @click="previewContent = null">
      <div class="modal-content document-preview" @click.stop>
        <div class="preview-header">
          <h3>{{ previewTitle }}</h3>
          <button @click="previewContent = null" class="close-btn">×</button>
        </div>
        <div class="preview-body" v-html="formattedPreview"></div>
        <div class="preview-footer">
          <button @click="downloadCurrentPreview" class="btn btn-primary">下载</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { sessionApi } from '../../api/session.js'

const loading = ref(false)
const sessions = ref([])
const selectedSessionId = ref('')
const requirementDoc = ref(null)
const artifacts = ref([])
const previewContent = ref(null)
const previewTitle = ref('')

const API_BASE = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/v2` : 'http://localhost:3000/api/v2'

const loadSessions = async () => {
  try {
    const userId = getCurrentUserId()
    const res = await sessionApi.v2.list(userId, { page: 1, pageSize: 50 })
    if (res.success) {
      sessions.value = res.data.list || []
    } else if (res.code === 0) {
      sessions.value = res.data.list || []
    }
  } catch (error) {
    console.error('获取会话列表失败:', error)
  }
}

const getCurrentUserId = () => {
  const userInfo = localStorage.getItem('user_info')
  if (userInfo) {
    try {
      return JSON.parse(userInfo).id || 'default-user'
    } catch {
      return 'default-user'
    }
  }
  return 'default-user'
}

const loadDocuments = async () => {
  if (!selectedSessionId.value) {
    requirementDoc.value = null
    artifacts.value = []
    return
  }

  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/sessions/${selectedSessionId.value}/artifacts`)
    const data = await res.json()

    if (data.success) {
      requirementDoc.value = data.data.requirementDoc
      artifacts.value = data.data.artifacts || []
    } else {
      console.error('获取文档列表失败:', data.error)
      requirementDoc.value = null
      artifacts.value = []
    }
  } catch (error) {
    console.error('获取文档列表失败:', error)
    requirementDoc.value = null
    artifacts.value = []
  } finally {
    loading.value = false
  }
}

const previewDocument = (doc) => {
  previewTitle.value = doc.fileName || doc.name
  fetchDocumentContent(doc).then(content => {
    previewContent.value = content
  })
}

const downloadDocument = (doc) => {
  window.open(doc.downloadUrl, '_blank')
}

const downloadArtifact = (doc) => {
  window.open(doc.downloadUrl, '_blank')
}

const downloadCurrentPreview = () => {
  if (!previewContent.value) return
  const blob = new Blob([previewContent.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = previewTitle.value
  a.click()
  URL.revokeObjectURL(url)
}

const fetchDocumentContent = async (doc) => {
  try {
    const res = await fetch(doc.downloadUrl)
    return await res.text()
  } catch (error) {
    console.error('获取文档内容失败:', error)
    return '文档加载失败'
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleDateString('zh-CN')
}

const formattedPreview = (content) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, '<strong>').replace(/\|/g, ' | ').replace(/```/g, '')
}

onMounted(() => {
  loadSessions()
})
</script>

<style scoped>
.document-list-page {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
}

.session-selector {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.session-select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-width: 300px;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-card {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.document-card.requirement-doc {
  border: 2px solid #667eea;
}

.document-icon {
  font-size: 32px;
}

.document-info {
  flex: 1;
}

.document-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.document-meta {
  font-size: 13px;
  color: #888;
}

.document-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #667eea;
  color: white;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.document-preview {
  width: 90%;
  height: 90vh;
  max-height: 90vh;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.preview-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.preview-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.preview-footer {
  padding-top: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
}
</style>
