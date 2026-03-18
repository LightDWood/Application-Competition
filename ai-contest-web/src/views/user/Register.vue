<template>
  <div class="user-register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>AI 副驾驶创意工坊</h1>
          <p>让 AI 副驾驶帮你澄清创意需求</p>
        </div>
        
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label>用户名</label>
            <input 
              type="text" 
              v-model="form.username" 
              placeholder="请输入用户名"
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label>邮箱</label>
            <input 
              type="email" 
              v-model="form.email" 
              placeholder="请输入邮箱"
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label>密码</label>
            <input 
              type="password" 
              v-model="form.password" 
              placeholder="请输入密码（至少6位）"
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label>确认密码</label>
            <input 
              type="password" 
              v-model="form.confirmPassword" 
              placeholder="请再次输入密码"
              class="form-input"
            >
          </div>
          
          <div class="form-error" v-if="errorMsg">{{ errorMsg }}</div>
          
          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>
        
        <div class="register-footer">
          <span>已有账号？</span>
          <router-link to="/user/login">立即登录</router-link>
          <span class="divider">|</span>
          <router-link to="/">返回首页</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user.js'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  if (!form.value.username || !form.value.email || !form.value.password) {
    errorMsg.value = '请填写所有必填项'
    return
  }
  
  if (form.value.password.length < 6) {
    errorMsg.value = '密码至少需要6位'
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    errorMsg.value = '请输入有效的邮箱地址'
    return
  }
  
  loading.value = true
  errorMsg.value = ''
  
  try {
    const res = await userStore.register(
      form.value.username,
      form.value.email,
      form.value.password
    )
    
    if (res.code === 0) {
      router.push('/requirement')
    } else {
      errorMsg.value = res.message || '注册失败'
    }
  } catch (error) {
    console.error('注册失败:', error)
    errorMsg.value = error.message || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.user-register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 400px;
}

.register-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.register-header p {
  font-size: 14px;
  color: #888;
}

.form-group {
  margin-bottom: 16px;
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

.register-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #888;
}

.register-footer a {
  color: #667eea;
  text-decoration: none;
  margin-left: 5px;
}

.register-footer a:hover {
  text-decoration: underline;
}

.divider {
  margin: 0 10px;
  color: #ddd;
}
</style>
