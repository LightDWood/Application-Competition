<template>
  <div class="user-login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>需求收敛系统</h1>
          <p>用户登录</p>
        </div>
        
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>用户名/邮箱</label>
            <input 
              type="text" 
              v-model="form.username" 
              placeholder="请输入用户名或邮箱"
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label>密码</label>
            <input 
              type="password" 
              v-model="form.password" 
              placeholder="请输入密码"
              class="form-input"
            >
          </div>
          
          <div class="form-error" v-if="errorMsg">{{ errorMsg }}</div>
          
          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
        
        <div class="login-footer">
          <span>还没有账号？</span>
          <router-link to="/user/register">立即注册</router-link>
          <span class="divider">|</span>
          <router-link to="/">返回首页</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user.js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  
  loading.value = true
  errorMsg.value = ''
  
  try {
    const res = await userStore.login(form.value.username, form.value.password)
    
    if (res.code === 0) {
      // 获取 redirect 参数
      const redirect = route.query.redirect
      
      if (redirect) {
        // 验证 redirect 页面的角色要求
        const routes = router.getRoutes()
        const targetRoute = routes.find(r => r.path === redirect || r.path === redirect.split('?')[0])
        const routeMeta = targetRoute?.meta
        
        if (routeMeta?.requiresRole) {
          const requiredRole = routeMeta.requiresRole
          const userRole = res.data.user.role
          const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
          
          if (allowedRoles.includes(userRole)) {
            // 有权限，跳转到 redirect 页面
            router.push(redirect)
          } else {
            // 角色不匹配，跳转到默认页面
            const defaultPath = userRole === 'admin' ? '/training-admin' : '/requirement'
            router.push(defaultPath)
            errorMsg.value = `您没有访问该页面的权限，已跳转到${defaultPath}`
          }
        } else {
          // 没有角色要求，直接跳转
          router.push(redirect)
        }
      } else {
        // 没有 redirect 参数，根据角色跳转默认页面
        const defaultPath = res.data.user.role === 'admin' ? '/training-admin' : '/requirement'
        router.push(defaultPath)
      }
    } else {
      errorMsg.value = res.message || '登录失败'
    }
  } catch (error) {
    console.error('登录失败:', error)
    errorMsg.value = error.message || '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.user-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #888;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
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

.form-error {
  color: #ff6b6b;
  font-size: 14px;
  margin-bottom: 15px;
  text-align: center;
}

.btn {
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.btn-block {
  width: 100%;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #888;
}

.login-footer a {
  color: #667eea;
  text-decoration: none;
  margin-left: 5px;
}

.login-footer a:hover {
  text-decoration: underline;
}

.divider {
  margin: 0 10px;
  color: #ddd;
}
</style>
