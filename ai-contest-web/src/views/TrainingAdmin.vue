<template>
  <div class="training-admin-page">
    <section class="page-header">
      <div class="container">
        <div class="header-content">
          <div>
            <h1>后台管理</h1>
            <p>管理培训资料和报名信息</p>
          </div>
          <div class="header-actions">
            <span class="admin-name">欢迎，{{ adminInfo?.username || '管理员' }}</span>
            <button class="btn btn-outline btn-sm" @click="handleLogout">退出登录</button>
          </div>
        </div>
      </div>
    </section>

    <section class="tabs-section">
      <div class="container">
        <div class="tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'training' }"
            @click="activeTab = 'training'"
          >
            培训资料管理
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'registration' }"
            @click="activeTab = 'registration'"
          >
            报名信息管理
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'qrcode' }"
            @click="activeTab = 'qrcode'"
          >
            网站二维码
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'accounts' }"
            @click="activeTab = 'accounts'"
          >
            账号管理
          </button>
        </div>
      </div>
    </section>

    <section class="toolbar" v-show="activeTab === 'training'">
      <div class="container">
        <div class="toolbar-content">
          <div class="toolbar-left">
            <span class="stats">共 {{ trainings.length }} 条培训资料</span>
          </div>
          <div class="toolbar-right">
            <button class="btn btn-primary" @click="openAddModal">
              + 添加培训
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="toolbar" v-show="activeTab === 'registration'">
      <div class="container">
        <div class="toolbar-content">
          <div class="toolbar-left">
            <span class="stats">共 {{ registrations.length }} 条报名记录</span>
          </div>
          <div class="toolbar-right">
            <button class="btn btn-primary" @click="exportToExcel" :disabled="registrations.length === 0">
              导出Excel
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="container main-content" v-show="activeTab === 'training'">
      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>
      
      <div v-else class="manage-list">
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

      <div v-if="!loading && trainings.length === 0" class="empty-state">
        <p>暂无培训资料</p>
        <p class="hint">请点击"添加培训"按钮添加数据</p>
      </div>
    </section>

    <section class="container main-content" v-show="activeTab === 'registration'">
      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>
      
      <div v-else class="manage-list">
        <div class="manage-item registration-item" v-for="reg in registrations" :key="reg.id">
          <div class="manage-item-index">{{ registrations.indexOf(reg) + 1 }}</div>
          <div class="manage-item-info">
            <h4>{{ reg.workName }}</h4>
            <p class="reg-meta">
              <span>参赛人：{{ reg.userName }}</span>
              <span>工号：{{ reg.userEmployeeId }}</span>
              <span>提交时间：{{ formatDate(reg.createdAt) }}</span>
            </p>
          </div>
          <div class="manage-item-actions">
            <button class="btn btn-outline btn-sm" @click="viewRegistration(reg)">查看</button>
            <button class="btn btn-danger btn-sm" @click="deleteRegistration(reg.id)">删除</button>
          </div>
        </div>
      </div>

      <div v-if="!loading && registrations.length === 0" class="empty-state">
        <p>暂无报名记录</p>
        <p class="hint">等待参赛者提交报名信息</p>
      </div>
    </section>

    <section class="toolbar" v-show="activeTab === 'accounts'">
      <div class="container">
        <div class="toolbar-content">
          <div class="toolbar-left">
            <span class="stats">共 {{ users.length }} 条用户记录</span>
          </div>
          <div class="toolbar-right">
            <input 
              type="text" 
              v-model="userSearch" 
              placeholder="搜索用户名/邮箱"
              class="search-input"
              @input="loadUsers"
            >
            <select v-model="userRoleFilter" @change="loadUsers" class="role-filter">
              <option value="">全部角色</option>
              <option value="user">一般用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <section class="container main-content qrcode-content" v-show="activeTab === 'qrcode'">
      <div class="qrcode-card">
        <h3>法务"AI 副驾驶"设计大赛网站二维码</h3>
        <p class="qrcode-url">http://123.57.165.99/ai-contest/</p>
        <div class="qrcode-wrapper">
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://123.57.165.99/ai-contest/" 
            alt="网站二维码" 
            class="qrcode-img"
          />
        </div>
        <p class="qrcode-tip">扫码即可访问大赛网站</p>
        <div class="qrcode-actions">
          <button class="btn btn-primary" @click="copyQRCodeLink">复制链接</button>
          <button class="btn btn-outline" @click="downloadQRCode">下载二维码</button>
        </div>
      </div>
    </section>

    <section class="container main-content" v-show="activeTab === 'accounts'">
      <div v-if="userLoading" class="loading-state">
        <p>加载中...</p>
      </div>
      
      <div v-else class="manage-list">
        <div class="manage-item" v-for="user in users" :key="user.id">
          <div class="manage-item-index">{{ users.indexOf(user) + 1 }}</div>
          <div class="manage-item-info">
            <h4>{{ user.username }}</h4>
            <p class="user-meta">
              <span>邮箱：{{ user.email }}</span>
              <span>密码：{{ getDefaultPassword(user) }}</span>
              <span>角色：
                <span :class="['role-badge', user.role]">
                  {{ user.role === 'admin' ? '管理员' : '用户' }}
                </span>
              </span>
              <span>注册时间：{{ formatDate(user.createdAt) }}</span>
            </p>
          </div>
          <div class="manage-item-actions">
            <button class="btn btn-danger btn-sm" @click="confirmDeleteUser(user)">删除</button>
          </div>
        </div>
      </div>

      <div v-if="!userLoading && users.length === 0" class="empty-state">
        <p>暂无用户记录</p>
        <p class="hint">等待用户注册</p>
      </div>
      
      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="btn btn-outline btn-sm" 
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          上一页
        </button>
        <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button 
          class="btn btn-outline btn-sm" 
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          下一页
        </button>
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
      <template #footer>
        <button class="btn btn-outline" @click="showAddModal = false">取消</button>
        <button class="btn btn-primary" @click="addTraining" :disabled="submitting">保存</button>
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
      <template #footer>
        <button class="btn btn-outline" @click="showEditModal = false">取消</button>
        <button class="btn btn-primary" @click="updateTraining" :disabled="submitting">保存</button>
      </template>
    </Modal>

    <Modal v-model="showViewModal" title="报名详情" width="600px">
      <div class="detail-section" v-if="viewingRegistration">
        <div class="detail-item">
          <label>作品名称</label>
          <p>{{ viewingRegistration.workName }}</p>
        </div>
        <div class="detail-item">
          <label>作品概述</label>
          <p class="description-text">{{ viewingRegistration.workDescription }}</p>
        </div>
        <div class="detail-row">
          <div class="detail-item">
            <label>参赛人姓名</label>
            <p>{{ viewingRegistration.userName }}</p>
          </div>
          <div class="detail-item">
            <label>参赛人工号</label>
            <p>{{ viewingRegistration.userEmployeeId }}</p>
          </div>
        </div>
        <div class="detail-item">
          <label>提交时间</label>
          <p>{{ formatDate(viewingRegistration.createdAt) }}</p>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-primary" @click="showViewModal = false">关闭</button>
      </template>
    </Modal>

    <Modal v-model="showConfirmModal" title="确认操作" width="400px">
      <p class="confirm-message">{{ confirmMessage }}</p>
      <template #footer>
        <button class="btn btn-outline" @click="showConfirmModal = false">取消</button>
        <button class="btn btn-danger" @click="executeConfirm" :disabled="submitting">确认</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '../components/Modal.vue'
import * as XLSX from 'xlsx'
import { trainingApi } from '../api/training.js'
import { registrationApi } from '../api/registration.js'
import { adminUserApi } from '../api/user.js'

const router = useRouter()

const activeTab = ref('training')
const trainings = ref([])
const registrations = ref([])
const loading = ref(false)
const submitting = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showConfirmModal = ref(false)
const confirmMessage = ref('')
const pendingAction = ref(null)
const viewingRegistration = ref(null)

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

const adminInfo = computed(() => {
  const info = localStorage.getItem('admin_info')
  return info ? JSON.parse(info) : null
})

// 账号管理相关
const users = ref([])
const userLoading = ref(false)
const userSearch = ref('')
const userRoleFilter = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalUsers = ref(0)
const deleteUserConfirm = ref(null)

const loadUsers = async () => {
  try {
    userLoading.value = true
    const params = {
      page: currentPage.value,
      pageSize: 10,
      search: userSearch.value,
      role: userRoleFilter.value
    }
    
    const res = await adminUserApi.getUsers(params)
    if (res.code === 200) {
      users.value = res.data.users
      totalUsers.value = res.data.total
      totalPages.value = res.data.totalPages
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
  } finally {
    userLoading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadUsers()
}

const confirmDeleteUser = (user) => {
  deleteUserConfirm.value = user
  confirmMessage.value = `确定要删除用户"${user.username}"吗？此操作不可恢复！`
  pendingAction.value = deleteUser
  showConfirmModal.value = true
}

const deleteUser = async () => {
  if (!deleteUserConfirm.value) return
  
  try {
    submitting.value = true
    const res = await adminUserApi.deleteUser(deleteUserConfirm.value.id)
    if (res.code === 200) {
      await loadUsers()
      deleteUserConfirm.value = null
    } else {
      alert(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除用户失败:', error)
    alert(error.message || '删除失败')
  } finally {
    submitting.value = false
  }
}

const loadTrainings = async () => {
  try {
    loading.value = true
    const res = await trainingApi.getList()
    if (res.code === 0 && res.data) {
      trainings.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载培训资料失败:', error)
  } finally {
    loading.value = false
  }
}

const loadRegistrations = async () => {
  try {
    loading.value = true
    const res = await registrationApi.getList()
    if (res.code === 0 && res.data) {
      registrations.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载报名记录失败:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getDefaultPassword = (user) => {
  if (user.username === 'admin') {
    return 'admin123 (默认)'
  }
  return '******'
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

const addTraining = async () => {
  if (!newTraining.value.name || !newTraining.value.videoUrl) {
    alert('请填写培训名称和视频地址')
    return
  }

  try {
    submitting.value = true
    const res = await trainingApi.create({
      name: newTraining.value.name,
      videoUrl: newTraining.value.videoUrl,
      coverImage: newTraining.value.coverImage
    })
    
    if (res.code === 0) {
      showAddModal.value = false
      await loadTrainings()
    } else {
      alert(res.message || '添加失败')
    }
  } catch (error) {
    console.error('添加培训失败:', error)
    alert(error.message || '添加失败')
  } finally {
    submitting.value = false
  }
}

const updateTraining = async () => {
  if (!editingTraining.value.name || !editingTraining.value.videoUrl) {
    alert('请填写培训名称和视频地址')
    return
  }

  try {
    submitting.value = true
    const res = await trainingApi.update(editingTraining.value.id, {
      name: editingTraining.value.name,
      videoUrl: editingTraining.value.videoUrl,
      coverImage: editingTraining.value.coverImage
    })
    
    if (res.code === 0) {
      showEditModal.value = false
      await loadTrainings()
    } else {
      alert(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新培训失败:', error)
    alert(error.message || '更新失败')
  } finally {
    submitting.value = false
  }
}

const deleteTraining = async (id) => {
  const training = trainings.value.find(t => t.id === id)
  confirmMessage.value = `确定要删除培训"${training.name}"吗？`
  pendingAction.value = async () => {
    try {
      submitting.value = true
      const res = await trainingApi.delete(id)
      if (res.code === 0) {
        await loadTrainings()
      } else {
        alert(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除培训失败:', error)
      alert(error.message || '删除失败')
    } finally {
      submitting.value = false
    }
  }
  showConfirmModal.value = true
}

const viewRegistration = (reg) => {
  viewingRegistration.value = reg
  showViewModal.value = true
}

const deleteRegistration = async (id) => {
  const reg = registrations.value.find(r => r.id === id)
  confirmMessage.value = `确定要删除"${reg.workName}"的报名记录吗？`
  pendingAction.value = async () => {
    try {
      submitting.value = true
      const res = await registrationApi.delete(id)
      if (res.code === 0) {
        await loadRegistrations()
      } else {
        alert(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除报名记录失败:', error)
      alert(error.message || '删除失败')
    } finally {
      submitting.value = false
    }
  }
  showConfirmModal.value = true
}

const executeConfirm = async () => {
  if (pendingAction.value) {
    await pendingAction.value()
  }
  showConfirmModal.value = false
  pendingAction.value = null
}

const exportToExcel = async () => {
  if (registrations.value.length === 0) {
    alert('没有可导出的数据')
    return
  }

  try {
    const res = await registrationApi.export()
    if (res.code === 0 && res.data) {
      const exportData = res.data
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      
      const colWidths = [
        { wch: 6 },
        { wch: 30 },
        { wch: 60 },
        { wch: 15 },
        { wch: 15 },
        { wch: 10 },
        { wch: 20 }
      ]
      worksheet['!cols'] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '报名信息')

      const fileName = `报名信息_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`
      XLSX.writeFile(workbook, fileName)
    }
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败')
  }
}

const copyQRCodeLink = () => {
  const url = 'http://123.57.165.99/ai-contest/'
  navigator.clipboard.writeText(url).then(() => {
    alert('链接已复制到剪贴板！')
  }).catch(() => {
    alert('复制失败，请手动复制链接')
  })
}

const downloadQRCode = () => {
  window.open('https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=http://123.57.165.99/ai-contest/', '_blank')
}

const handleLogout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_info')
  router.push('/login')
}

onMounted(() => {
  const token = localStorage.getItem('admin_token')
  if (!token) {
    router.push('/login')
    return
  }
  
  loadTrainings()
  loadRegistrations()
  loadUsers()
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
  padding: 40px 20px;
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 36px;
  margin-bottom: 5px;
}

.page-header p {
  font-size: 16px;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.admin-name {
  font-size: 14px;
  opacity: 0.9;
}

.tabs-section {
  background: white;
  border-bottom: 1px solid #eee;
}

.tabs {
  display: flex;
  gap: 0;
}

.tab-btn {
  padding: 18px 35px;
  font-size: 15px;
  font-weight: 500;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;
}

.tab-btn:hover {
  color: #667eea;
}

.tab-btn.active {
  color: #667eea;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 3px 3px 0 0;
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.main-content {
  padding: 40px 0;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
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

.registration-item .manage-item-info p {
  white-space: normal;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.reg-meta span {
  color: #888;
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

.confirm-message {
  font-size: 16px;
  color: #333;
  line-height: 1.6;
  white-space: pre-line;
  margin: 0;
  text-align: center;
}

.detail-section {
  padding: 10px 0;
}

.detail-item {
  margin-bottom: 20px;
}

.detail-item label {
  display: block;
  font-size: 13px;
  color: #888;
  margin-bottom: 5px;
}

.detail-item p {
  margin: 0;
  font-size: 15px;
  color: #333;
}

.detail-item .description-text {
  white-space: pre-wrap;
  line-height: 1.8;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.qrcode-content {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.qrcode-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 400px;
  width: 100%;
}

.qrcode-card h3 {
  font-size: 22px;
  color: #333;
  margin-bottom: 15px;
}

.qrcode-url {
  font-size: 14px;
  color: #667eea;
  background: #f0f3ff;
  padding: 10px 20px;
  border-radius: 25px;
  margin-bottom: 30px;
  word-break: break-all;
}

.qrcode-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.qrcode-img {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  background: white;
  padding: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.qrcode-tip {
  font-size: 14px;
  color: #888;
  margin-bottom: 25px;
}

.qrcode-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.search-input {
  padding: 8px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  width: 200px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.role-filter {
  padding: 8px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.role-filter:focus {
  outline: none;
  border-color: #667eea;
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 13px;
  color: #888;
  margin-top: 5px;
}

.role-badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.admin {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.role-badge.user {
  background: #f0f0f0;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  padding: 20px 0;
}

.page-info {
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .tabs {
    flex-direction: column;
  }

  .tab-btn {
    text-align: left;
    padding: 15px 20px;
  }

  .tab-btn.active::after {
    display: none;
  }

  .tab-btn.active {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  }

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

  .detail-row {
    grid-template-columns: 1fr;
  }
}
</style>
