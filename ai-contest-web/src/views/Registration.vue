<template>
  <div class="registration-page">
    <section class="page-header">
      <div class="container">
        <h1>大赛报名</h1>
        <p>填写作品信息，参与法务"AI副驾驶"设计大赛</p>
      </div>
    </section>

    <section class="container main-content">
      <div class="form-card">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="required">作品名称</label>
            <input 
              type="text" 
              v-model="form.workName" 
              placeholder="请输入作品名称"
              class="form-input"
              maxlength="100"
            >
            <div class="input-hint">{{ form.workName.length }}/100</div>
          </div>

          <div class="form-group">
            <label class="required">作品概述</label>
            <textarea 
              v-model="form.workDescription" 
              placeholder="请输入作品概述，最多2000字"
              class="form-textarea"
              rows="10"
              maxlength="2000"
            ></textarea>
            <div class="input-hint">{{ form.workDescription.length }}/2000</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="required">参赛人姓名</label>
              <input 
                type="text" 
                v-model="form.userName" 
                placeholder="请输入姓名"
                class="form-input"
                maxlength="50"
              >
            </div>
            <div class="form-group">
              <label class="required">参赛人工号</label>
              <input 
                type="text" 
                v-model="form.userEmployeeId" 
                placeholder="请输入工号"
                class="form-input"
                maxlength="50"
              >
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="resetForm">重置</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? '提交中...' : '提交报名' }}
            </button>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const STORAGE_KEY = 'ai-contest-registrations'

const form = ref({
  workName: '',
  workDescription: '',
  userName: '',
  userEmployeeId: ''
})

const isSubmitting = ref(false)

const validateForm = () => {
  if (!form.value.workName.trim()) {
    alert('请输入作品名称')
    return false
  }
  if (!form.value.workDescription.trim()) {
    alert('请输入作品概述')
    return false
  }
  if (!form.value.userName.trim()) {
    alert('请输入参赛人姓名')
    return false
  }
  if (!form.value.userEmployeeId.trim()) {
    alert('请输入参赛人工号')
    return false
  }
  return true
}

const handleSubmit = () => {
  if (!validateForm()) return

  isSubmitting.value = true

  setTimeout(() => {
    const submission = {
      id: Date.now(),
      workName: form.value.workName.trim(),
      workDescription: form.value.workDescription.trim(),
      userName: form.value.userName.trim(),
      userEmployeeId: form.value.userEmployeeId.trim(),
      createdAt: new Date().toISOString()
    }

    const data = localStorage.getItem(STORAGE_KEY)
    const submissions = data ? JSON.parse(data) : []
    submissions.push(submission)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))

    alert('报名提交成功！')
    resetForm()
    isSubmitting.value = false
  }, 500)
}

const resetForm = () => {
  form.value = {
    workName: '',
    workDescription: '',
    userName: '',
    userEmployeeId: ''
  }
}
</script>

<style scoped>
.registration-page {
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

.main-content {
  padding: 40px 0;
}

.form-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 15px;
}

.form-group label.required::after {
  content: '*';
  color: #ff6b6b;
  margin-left: 4px;
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

.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
  resize: vertical;
  min-height: 200px;
  font-family: inherit;
  line-height: 1.6;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.input-hint {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.btn {
  padding: 12px 35px;
  border-radius: 25px;
  font-size: 15px;
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

@media (max-width: 768px) {
  .form-card {
    padding: 25px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
