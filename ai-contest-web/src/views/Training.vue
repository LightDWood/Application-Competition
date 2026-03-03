<template>
  <div class="training-page">
    <section class="page-header">
      <div class="container">
        <h1>培训资料</h1>
        <p>系统学习AI应用知识，从入门到精通，助你在大赛中脱颖而出</p>
      </div>
    </section>

    <section class="container main-content">
      <div class="materials-grid">
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

      <div v-if="trainings.length === 0" class="empty-state">
        <p>暂无培训资料</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'ai-contest-trainings'

const trainings = ref([])

const loadTrainings = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  if (data) {
    trainings.value = JSON.parse(data)
  } else {
    trainings.value = [
      {
        id: 1,
        name: 'AI说-AI赋能法律人工作：原理、工具',
        videoUrl: 'https://live-og3lg6.vhall.cn/v3/lives/watch/763568303',
        coverImage: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: '圆桌论坛：生成式AI对企业合规的挑战',
        videoUrl: 'https://t.568live.cn/FK1YtW',
        coverImage: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: '主题演讲：全球视角下的AI合规与监管趋势',
        videoUrl: 'https://live.vhall.com/v3/lives/watch/686916117',
        coverImage: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        name: '专家视角：通用型AI与法律AI的差异与融合',
        videoUrl: 'https://live.vhall.com/v3/lives/watch/560575636',
        coverImage: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 5,
        name: '圆桌讨论：法务部门如何使用AI赋能工作场景',
        videoUrl: 'https://live.vhall.com/v3/lives/watch/626184781',
        coverImage: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 6,
        name: '圆桌讨论：生成式AI对企业合规的挑战与风险防控',
        videoUrl: 'https://live.vhall.com/v3/lives/watch/580655488',
        coverImage: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 7,
        name: '生成式AI法律治理：全球热点、法律挑战与合规实践',
        videoUrl: 'https://live.vhall.com/v3/lives/watch/627813242',
        coverImage: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 8,
        name: 'AI+应用出海合规风险',
        videoUrl: 'https://live.vhall.com/v3/lives/watch/254857703',
        coverImage: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 9,
        name: '人工智能的法律边界与出海路径之一',
        videoUrl: 'https://live.vhall.com/v3/lives/watch/617378607',
        coverImage: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 10,
        name: '未来法律·AI说-跨境出海中的AI法律应用：从效率工具到准确决策的协同路径',
        videoUrl: 'https://live-og3lg6.vhall.cn/v3/lives/watch/998354907',
        coverImage: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 11,
        name: '未来法律·AI说-不是禁用，而是善用：企业法务如何高效、负责任地使用AI？',
        videoUrl: 'https://live-og3lg6.vhall.cn/v3/lives/watch/959768469',
        coverImage: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 12,
        name: '未来法律·AI说:AIGC应用中的法律挑战、立法趋势与应对之道',
        videoUrl: 'https://live-og3lg6.vhall.cn/v3/lives/watch/178631583',
        coverImage: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 13,
        name: '未来法律·AI说-法律人共创畅想法律AI的未来',
        videoUrl: 'https://live-og3lg6.vhall.cn/v3/lives/watch/433075047',
        coverImage: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 14,
        name: '未来法律·AI说-律所与企业双重视角下的人机协同',
        videoUrl: 'https://live-og3lg6.vhall.cn/v3/lives/watch/293362594',
        coverImage: '',
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trainings.value))
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
