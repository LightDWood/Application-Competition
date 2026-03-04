<template>
  <div class="home">
    <section class="hero-section">
      <div class="hero-bg">
        <div class="hero-glow hero-glow-1"></div>
        <div class="hero-glow hero-glow-2"></div>
        <div class="hero-particles">
          <span v-for="n in 20" :key="n" class="particle" :style="getParticleStyle(n)"></span>
        </div>
      </div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">海尔集团法务数字化创新</div>
          <h1 class="hero-title">
            <span class="title-line">法务"AI副驾驶"</span>
            <span class="title-highlight">设计大赛</span>
          </h1>
          <p class="hero-subtitle">让法务拥有自己的"AI副驾驶"！</p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">5</span>
              <span class="stat-label">比赛阶段</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">10+</span>
              <span class="stat-label">培训场次</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">∞</span>
              <span class="stat-label">创意可能</span>
            </div>
          </div>
          <div class="hero-actions">
            <router-link to="/training" class="btn btn-primary">
              <span class="btn-icon">🚀</span>
              <span>立即学习</span>
            </router-link>
            <router-link to="/registration" class="btn btn-secondary">
              <span>大赛报名</span>
              <span class="btn-arrow">→</span>
            </router-link>
          </div>
        </div>
      </div>
      <div class="hero-scroll-hint">
        <span class="scroll-text">向下滚动</span>
        <span class="scroll-icon"></span>
      </div>
    </section>

    <section class="poster-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">大赛详情</h2>
          <p class="section-desc">零门槛参与，全程培训指导，优秀创意将落地实施</p>
        </div>
        
        <div class="poster-grid">
          <div class="poster-card main-card">
            <div class="card-glow"></div>
            <img src="/poster.jpg" alt="大赛海报" class="poster-img" />
          </div>
          
          <div class="info-cards">
            <div class="info-card" v-for="(info, index) in infoCards" :key="index">
              <div class="info-icon">{{ info.icon }}</div>
              <h4 class="info-title">{{ info.title }}</h4>
              <p class="info-content">{{ info.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="timeline-section" id="stages">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">比赛阶段</h2>
          <p class="section-desc">由易到难，循序渐进，带你掌握AI应用技能</p>
        </div>
        
        <div class="timeline-wrapper">
          <div class="timeline-track">
            <div class="timeline-progress" :style="{ width: progressWidth }"></div>
          </div>
          <div class="timeline-items">
            <div 
              class="timeline-item" 
              v-for="(stage, index) in stages" 
              :key="stage.id"
              :class="{ 'active': index < currentStage, 'current': index === currentStage - 1 }"
            >
              <div class="timeline-node">
                <div class="node-inner">
                  <span class="node-number">{{ stage.id }}</span>
                </div>
                <div class="node-pulse" v-if="index === currentStage - 1"></div>
              </div>
              <div class="timeline-card">
                <div class="card-time">{{ stage.time }}</div>
                <h4 class="card-title">{{ stage.name }}</h4>
                <p class="card-desc">{{ stage.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="tools-section" id="tools">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">常用AI工具</h2>
          <p class="section-desc">精选优质AI工具，助力你的创意实现</p>
        </div>
        
        <div class="tools-grid">
          <div class="tool-category" v-for="category in aiTools" :key="category.category">
            <div class="category-header">
              <span class="category-icon">{{ category.icon }}</span>
              <h4 class="category-name">{{ category.category }}</h4>
            </div>
            <ul class="tool-list">
              <li v-for="tool in category.tools" :key="tool.name" class="tool-item">
                <a :href="tool.url" target="_blank" class="tool-link">
                  <div class="tool-main">
                    <span class="tool-rank" :class="'rank-' + tool.rank">{{ tool.rank }}</span>
                    <span class="tool-name">{{ tool.name }}</span>
                    <span v-if="tool.recommend" class="tool-badge">{{ tool.recommend }}</span>
                  </div>
                  <span class="tool-desc">{{ tool.desc }}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const currentStage = 1

const progressWidth = computed(() => {
  return ((currentStage - 0.5) / stages.length * 100) + '%'
})

const getParticleStyle = (n) => {
  const random = (min, max) => Math.random() * (max - min) + min
  return {
    left: random(0, 100) + '%',
    top: random(0, 100) + '%',
    animationDelay: random(0, 5) + 's',
    animationDuration: random(10, 20) + 's'
  }
}

const stages = [
  { id: 1, name: 'AI应用技巧培训', description: '系统学习AI应用技能，掌握主流AI工具使用方法', time: '3月-4月' },
  { id: 2, name: '创意提交与评审', description: '发挥创意，提出AI副驾驶应用场景构想', time: '5月初' },
  { id: 3, name: '智能体培训实战', description: '学习构建复杂智能体，掌握Agent模板', time: '6月-8月' },
  { id: 4, name: '作品提交与评审', description: '提交复杂智能体设计作品，展示实战成果', time: '9月初' },
  { id: 5, name: '应用开发与上线', description: '进阶实战，打造高质量应用成果', time: '10月-12月' }
]

const infoCards = [
  {
    icon: '👥',
    title: '参赛对象',
    content: '海尔集团所有法务人员'
  },
  {
    icon: '🏆',
    title: '奖励机制',
    content: '最终漏出作品，优先录入三金奖、月度奖等集团奖项，并优先获得发展。'
  },
  {
    icon: '✨',
    title: '大赛亮点',
    content: '零门槛参与，全程培训指导；创意无限，设计专属AI副驾驶；优秀创意落地实施。'
  }
]

const aiTools = [
  {
    category: 'AI对话助手',
    icon: '💬',
    tools: [
      { name: 'Kimi', url: 'https://kimi.moonshot.cn', rank: 1, recommend: '推荐', desc: '长文本处理能力强' },
      { name: '通义千问', url: 'https://tongyi.aliyun.com', rank: 2, recommend: '推荐', desc: '阿里出品，功能全面' },
      { name: '文心一言', url: 'https://yiyan.baidu.com', rank: 3, recommend: '推荐', desc: '百度出品，中文理解好' },
      { name: '豆包', url: 'https://www.doubao.com', rank: 4, desc: '字节跳动出品' },
      { name: '智谱清言', url: 'https://chatglm.cn', rank: 5, desc: '清华技术背景' }
    ]
  },
  {
    category: 'AI写作工具',
    icon: '✍️',
    tools: [
      { name: 'Kimi', url: 'https://kimi.moonshot.cn', rank: 1, recommend: '推荐', desc: '文档处理能力强' },
      { name: '通义千问', url: 'https://tongyi.aliyun.com', rank: 2, recommend: '推荐', desc: '写作辅助功能丰富' },
      { name: '秘塔写作猫', url: 'https://xiezuocat.com', rank: 3, desc: '专业写作助手' },
      { name: '讯飞写作', url: 'https://writing.iflyrec.com', rank: 4, desc: '语音转写+写作' }
    ]
  },
  {
    category: 'AI绘图工具',
    icon: '🎨',
    tools: [
      { name: '即梦AI', url: 'https://jimeng.jianying.com', rank: 1, recommend: '推荐', desc: '字节出品，中文理解好' },
      { name: '通义万相', url: 'https://tongyi.aliyun.com/wanxiang', rank: 2, recommend: '推荐', desc: '阿里出品，功能强大' },
      { name: '文心一格', url: 'https://yige.baidu.com', rank: 3, desc: '百度出品' },
      { name: '混元助手', url: 'https://hunyuan.tencent.com', rank: 4, desc: '腾讯出品' }
    ]
  },
  {
    category: 'AI办公工具',
    icon: '💼',
    tools: [
      { name: 'Kimi', url: 'https://kimi.moonshot.cn', rank: 1, recommend: '推荐', desc: '文档分析能力强' },
      { name: '飞书智能伙伴', url: 'https://www.feishu.cn/product/feishu-ai', rank: 2, recommend: '推荐', desc: '企业协作首选' },
      { name: '通义千问', url: 'https://tongyi.aliyun.com', rank: 3, desc: '文档处理功能全' },
      { name: 'WPS AI', url: 'https://ai.wps.cn', rank: 4, desc: '办公文档智能' }
    ]
  }
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.home {
  min-height: 100vh;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ==================== Hero Section ==================== */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.hero-glow-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  top: -200px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.hero-glow-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  bottom: -100px;
  left: -100px;
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(1.1); }
}

.hero-particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: particleFloat 15s linear infinite;
}

@keyframes particleFloat {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  padding: 40px 0;
}

.hero-badge {
  display: inline-block;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
}

.hero-title {
  font-size: 72px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  letter-spacing: -0.03em;
}

.title-line {
  display: block;
  background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-highlight {
  display: block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 24px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 48px;
  letter-spacing: 0.02em;
}

.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin-bottom: 48px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 36px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #764ba2 0%, #f093fb 100%);
  opacity: 0;
  transition: opacity 0.4s;
}

.btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-primary span {
  position: relative;
  z-index: 1;
}

.btn-icon {
  font-size: 18px;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-4px);
}

.btn-arrow {
  transition: transform 0.3s;
}

.btn-secondary:hover .btn-arrow {
  transform: translateX(4px);
}

.hero-scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.5);
  animation: bounce 2s ease-in-out infinite;
}

.scroll-text {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1px;
}

.scroll-icon {
  width: 24px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  position: relative;
}

.scroll-icon::after {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
  animation: scrollDown 1.5s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(10px); }
}

@keyframes scrollDown {
  0%, 100% { opacity: 1; transform: translateX(-50%) translateY(0); }
  50% { opacity: 0.3; transform: translateX(-50%) translateY(8px); }
}

/* ==================== Poster Section ==================== */
.poster-section {
  padding: 120px 0;
  background: linear-gradient(180deg, #0f3460 0%, #1a1a2e 100%);
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-title {
  font-size: 40px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.section-desc {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

.poster-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}

.poster-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.main-card {
  aspect-ratio: auto;
  padding: 16px;
}

.main-card .poster-img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.card-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
  border-radius: 26px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s;
}

.poster-card:hover .card-glow {
  opacity: 0.5;
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.poster-card:hover .poster-img {
  transform: scale(1.05);
}

.info-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  padding: 28px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(8px);
}

.info-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.info-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.info-content {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
}

/* ==================== Timeline Section ==================== */
.timeline-section {
  padding: 120px 0;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}

.timeline-wrapper {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
}

.timeline-track {
  position: absolute;
  left: 0;
  right: 0;
  top: 28px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.timeline-progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  transition: width 0.6s ease;
}

.timeline-items {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.timeline-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 12px;
}

.timeline-node {
  position: relative;
  width: 56px;
  height: 56px;
  margin-bottom: 24px;
}

.node-inner {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s;
  position: relative;
  z-index: 2;
}

.node-number {
  font-size: 20px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.timeline-item.active .node-inner {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: transparent;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.timeline-item.active .node-number {
  color: white;
}

.timeline-item.current .node-inner {
  transform: scale(1.1);
}

.node-pulse {
  position: absolute;
  inset: -8px;
  border: 2px solid rgba(102, 126, 234, 0.5);
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

.timeline-card {
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 16px;
  width: 100%;
  transition: all 0.4s;
}

.timeline-item:hover .timeline-card {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}

.card-time {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
  line-height: 1.3;
}

.card-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

/* ==================== Tools Section ==================== */
.tools-section {
  padding: 120px 0;
  background: linear-gradient(180deg, #16213e 0%, #1a1a2e 100%);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.tool-category {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  transition: all 0.4s;
}

.tool-category:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.category-icon {
  font-size: 24px;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.tool-list {
  list-style: none;
}

.tool-item {
  margin-bottom: 12px;
}

.tool-item:last-child {
  margin-bottom: 0;
}

.tool-link {
  display: block;
  padding: 12px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s;
}

.tool-link:hover {
  background: rgba(255, 255, 255, 0.05);
}

.tool-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.tool-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.tool-rank.rank-1 {
  background: linear-gradient(135deg, #ffd700, #ffb700);
  color: #1a1a2e;
}

.tool-rank.rank-2 {
  background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
  color: #1a1a2e;
}

.tool-rank.rank-3 {
  background: linear-gradient(135deg, #cd7f32, #b87333);
  color: white;
}

.tool-name {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.tool-badge {
  padding: 2px 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: white;
}

.tool-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  padding-left: 34px;
}

/* ==================== Responsive ==================== */
@media (max-width: 1200px) {
  .tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .hero-title {
    font-size: 48px;
  }

  .hero-subtitle {
    font-size: 20px;
  }

  .hero-stats {
    gap: 24px;
  }

  .stat-number {
    font-size: 36px;
  }

  .poster-grid {
    grid-template-columns: 1fr;
  }

  .main-card {
    max-width: 400px;
    margin: 0 auto;
  }

  .timeline-items {
    flex-wrap: wrap;
    gap: 24px;
    justify-content: center;
  }

  .timeline-item {
    flex: 0 0 calc(50% - 12px);
  }

  .timeline-track {
    display: none;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }

  .title-line, .title-highlight {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 18px;
  }

  .hero-stats {
    flex-direction: column;
    gap: 16px;
  }

  .stat-divider {
    width: 48px;
    height: 1px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }

  .section-title {
    font-size: 32px;
  }

  .section-desc {
    font-size: 16px;
  }

  .timeline-item {
    flex: 0 0 100%;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .poster-section,
  .timeline-section,
  .tools-section {
    padding: 80px 0;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px;
  }

  .title-line, .title-highlight {
    font-size: 26px;
  }

  .hero-badge {
    font-size: 12px;
    padding: 6px 16px;
  }
}
</style>
