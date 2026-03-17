<template>
  <div class="training-page">
    <section class="page-header">
      <div class="container">
        <h1>培训资料</h1>
        <p>系统学习AI应用知识，从入门到精通，助你在大赛中脱颖而出</p>
      </div>
    </section>

    <section class="container main-content">
      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>
      
      <div v-else class="materials-grid">
        <div 
          class="material-card" 
          v-for="training in trainings" 
          :key="training.id"
          @click="openVideo(training.videoUrl)"
        >
          <div class="material-image">
            <img 
              v-if="training.coverImage" 
              :src="training.coverImage" 
              alt="培训封面"
              @error="handleImageError"
            >
            <div v-else class="default-cover">▶</div>
            <div class="play-icon">▶</div>
          </div>
          <div class="material-info">
            <h4>{{ training.name }}</h4>
          </div>
        </div>
      </div>

      <div v-if="!loading && trainings.length === 0" class="empty-state">
        <p>暂无培训资料</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { trainingApi } from '../api/training.js'

const trainings = ref([])
const loading = ref(false)

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

const openVideo = (url) => {
  window.open(url, '_blank')
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

onMounted(() => {
  loadTrainings()
})
</script>

<style scoped>
.training-page {
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

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.material-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.material-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.material-image {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
  position: relative;
  overflow: hidden;
}

.material-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover {
  font-size: 48px;
}

.play-icon {
  position: absolute;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #667eea;
  opacity: 0;
  transition: opacity 0.3s;
}

.material-card:hover .play-icon {
  opacity: 1;
}

.material-info {
  padding: 20px;
}

.material-info h4 {
  font-size: 16px;
  color: #333;
  line-height: 1.4;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

@media (max-width: 768px) {
  .materials-grid {
    grid-template-columns: 1fr;
  }
}
</style>
