<template>
  <div class="document-list-page">
    <div class="page-header">
      <h1>文档管理</h1>
    </div>
    
    <div class="document-list" v-loading="loading">
      <div 
        v-for="doc in documents" 
        :key="doc.id" 
        class="document-card"
      >
        <div class="document-icon">📄</div>
        <div class="document-info">
          <h3 class="document-title">{{ doc.title }}</h3>
          <p class="document-meta">
            版本: v{{ doc.current_version }} | 
            {{ formatTime(doc.updated_at) }}
          </p>
        </div>
        <div class="document-actions">
          <button @click="previewDocument(doc)" class="action-btn">预览</button>
          <button @click="downloadDocument(doc)" class="action-btn">下载</button>
          <button @click="viewVersions(doc)" class="action-btn">版本</button>
        </div>
      </div>
      
      <div v-if="!loading && documents.length === 0" class="empty-state">
        <p>暂无文档，在会话中生成需求文档后将自动保存</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(false)
const documents = ref([])

const previewDocument = (doc) => {
  console.log('Preview document:', doc)
}

const downloadDocument = (doc) => {
  console.log('Download document:', doc)
}

const viewVersions = (doc) => {
  console.log('View versions:', doc)
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleDateString('zh-CN')
}

onMounted(() => {
  documents.value = []
})
</script>

<style scoped>
.document-list-page {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}
</style>
