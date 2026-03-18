<template>
  <div class="session-list-page">
    <div class="page-header">
      <h1>会话列表</h1>
      <button @click="createSession" class="btn btn-primary">
        + 新建会话
      </button>
    </div>
    
    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="搜索会话..."
        @input="handleSearch"
        class="search-input"
      >
    </div>
    
    <div class="session-list" v-loading="loading">
      <div 
        v-for="session in sessions" 
        :key="session.id" 
        class="session-card"
        @click="openSession(session.id)"
      >
        <div class="session-info">
          <h3 class="session-title">{{ session.title }}</h3>
          <p class="session-preview" v-if="session.messages && session.messages.length">
            {{ truncate(session.messages[0].content, 50) }}
          </p>
          <p class="session-time">{{ formatTime(session.last_message_at || session.created_at) }}</p>
        </div>
        <div class="session-actions">
          <button @click.stop="editSession(session)" class="action-btn" title="编辑">
            ✏️
          </button>
          <button @click.stop="deleteSession(session.id)" class="action-btn" title="删除">
            🗑️
          </button>
        </div>
      </div>
      
      <div v-if="!loading && sessions.length === 0" class="empty-state">
        <p>暂无会话，点击"新建会话"开始</p>
      </div>
    </div>
    
    <div class="pagination" v-if="total > pageSize">
      <button 
        :disabled="page === 1" 
        @click="changePage(page - 1)"
        class="page-btn"
      >
        上一页
      </button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button 
        :disabled="page >= totalPages" 
        @click="changePage(page + 1)"
        class="page-btn"
      >
        下一页
      </button>
    </div>
    
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h3>编辑会话</h3>
        <input 
          type="text" 
          v-model="editForm.title" 
          placeholder="会话标题"
          class="form-input"
        >
        <div class="modal-actions">
          <button @click="closeEditModal" class="btn btn-secondary">取消</button>
          <button @click="saveSession" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { sessionApi } from '../../api/session.js'

const router = useRouter()
const loading = ref(false)
const sessions = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const searchQuery = ref('')
const showEditModal = ref(false)
const editForm = ref({ id: '', title: '' })

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const fetchSessions = async () => {
  loading.value = true
  try {
    const res = await sessionApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      search: searchQuery.value || undefined
    })
    
    if (res.code === 0) {
      sessions.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取会话列表失败:', error)
  } finally {
    loading.value = false
  }
}

const createSession = async () => {
  try {
    const res = await sessionApi.create({ title: '新会话' })
    if (res.code === 0) {
      router.push(`/requirement/session/${res.data.id}`)
    }
  } catch (error) {
    console.error('创建会话失败:', error)
  }
}

const openSession = (id) => {
  router.push(`/requirement/session/${id}`)
}

const editSession = (session) => {
  editForm.value = { id: session.id, title: session.title }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = { id: '', title: '' }
}

const saveSession = async () => {
  try {
    const res = await sessionApi.update(editForm.value.id, { title: editForm.value.title })
    if (res.code === 0) {
      await fetchSessions()
      closeEditModal()
    }
  } catch (error) {
    console.error('更新会话失败:', error)
  }
}

const deleteSession = async (id) => {
  if (!confirm('确定要删除这个会话吗？')) return
  
  try {
    const res = await sessionApi.delete(id)
    if (res.code === 0) {
      await fetchSessions()
    }
  } catch (error) {
    console.error('删除会话失败:', error)
  }
}

const handleSearch = () => {
  page.value = 1
  fetchSessions()
}

const changePage = (newPage) => {
  page.value = newPage
  fetchSessions()
}

const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  
  return date.toLocaleDateString()
}

onMounted(() => {
  fetchSessions()
})
</script>

<style scoped>
.session-list-page {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
}

.search-bar {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.session-card {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.session-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.session-info {
  flex: 1;
}

.session-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.session-preview {
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
}

.session-time {
  font-size: 12px;
  color: #aaa;
}

.session-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.action-btn:hover {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
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
  width: 400px;
  max-width: 90%;
}

.modal-content h3 {
  margin-bottom: 16px;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  margin-bottom: 16px;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
