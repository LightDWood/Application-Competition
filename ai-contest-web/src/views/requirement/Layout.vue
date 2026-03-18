<template>
  <div class="requirement-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>AI 副驾驶创意工坊</h2>
        <div class="user-info">
          <span>{{ userStore.userInfo?.username }}</span>
          <button @click="handleLogout" class="logout-btn">退出</button>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/requirement/sessions" class="nav-item" active-class="active">
          <span class="icon">💬</span>
          <span>会话列表</span>
        </router-link>
        <router-link to="/requirement/documents" class="nav-item" active-class="active">
          <span class="icon">📄</span>
          <span>文档管理</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer">
        <router-link to="/" class="back-home">返回首页</router-link>
      </div>
    </aside>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user.js'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = async () => {
  await userStore.logout()
  router.push('/user/login')
}
</script>

<style scoped>
.requirement-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-right: 3px solid white;
}

.nav-item .icon {
  font-size: 18px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.back-home {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
}

.back-home:hover {
  color: white;
}

.main-content {
  flex: 1;
  overflow: auto;
}
</style>
