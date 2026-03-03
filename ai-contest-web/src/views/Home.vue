<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <h1>AI"虚拟下属"设计大赛</h1>
        <p>设计你的AI虚拟下属，让工作更高效。零门槛参与，全程培训指导！</p>
        <div class="hero-buttons">
          <router-link to="/training" class="btn btn-primary">开始学习</router-link>
          <a href="#stages" class="btn btn-secondary">了解详情</a>
        </div>
      </div>
    </section>

    <section class="section" id="stages">
      <div class="container">
        <h2 class="section-title">比赛阶段</h2>
        <p class="section-desc">由易到难，循序渐进，带你掌握AI应用技能</p>
        <div class="stages">
          <div class="stage-card" v-for="stage in stages" :key="stage.id">
            <div class="stage-number">{{ stage.id }}</div>
            <h3>{{ stage.name }}</h3>
            <p>{{ stage.description }}</p>
            <div class="stage-time">{{ stage.time }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="poster-section">
      <div class="container">
        <div class="poster-content">
          <div class="poster-text">
            <h2>大赛海报</h2>
            <p><strong>参赛对象：</strong>海尔集团及各领域所有法务人员</p>
            <p><strong>参赛方式：</strong>提交AI"虚拟下属"创意方案（角色定位、工作场景、能力设计、预期效果）</p>
            <p><strong>大赛亮点：</strong></p>
            <ul>
              <li>零门槛参与，全程培训指导</li>
              <li>创意无限，设计你的专属AI助手</li>
              <li>优秀创意将落地实施</li>
              <li>设最佳创意奖5个</li>
            </ul>
          </div>
          <div class="poster-image">
            <div class="poster-placeholder">
              大赛海报<br>（待上传）
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="tools">
      <div class="container">
        <h2 class="section-title">常用AI工具</h2>
        <div class="ai-tools">
          <div class="tool-category" v-for="category in aiTools" :key="category.category">
            <h4>{{ category.category }}</h4>
            <ul class="tool-list">
              <li v-for="tool in category.tools" :key="tool.name">
                <a :href="tool.url" target="_blank">
                  <div class="tool-info">
                    <span class="tool-rank">{{ tool.rank }}</span>
                    <span class="tool-name">{{ tool.name }}</span>
                    <span v-if="tool.recommend" class="tool-recommend">{{ tool.recommend }}</span>
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
const stages = [
  { id: 1, name: 'AI"虚拟下属"设计大赛', description: '发挥创意，提出AI虚拟下属应用场景构想，提交创意方案（角色定位、工作场景、能力设计、预期效果）', time: '作品提交截止：4月8日' },
  { id: 2, name: 'Agent实践大赛', description: '学习构建智能体，将创意方案落地实现，掌握Agent模板和工作执行步骤', time: '作品提交截止：6月10日' },
  { id: 3, name: '应用实战大赛', description: '进阶实战，构建复杂智能体系统，实现多技能协同，打造高质量应用成果', time: '作品提交截止：8月30日' }
]

const aiTools = [
  {
    category: 'AI对话助手',
    tools: [
      { name: 'Kimi', url: 'https://kimi.moonshot.cn', rank: 1, recommend: '推荐', desc: '长文本处理能力强' },
      { name: '通义千问', url: 'https://tongyi.aliyun.com', rank: 2, recommend: '推荐', desc: '阿里出品，功能全面' },
      { name: '文心一言', url: 'https://yiyan.baidu.com', rank: 3, recommend: '推荐', desc: '百度出品，中文理解好' },
      { name: '豆包', url: 'https://www.doubao.com', rank: 4, desc: '字节跳动出品' },
      { name: '智谱清言', url: 'https://chatglm.cn', rank: 5, desc: '清华技术背景' },
      { name: '讯飞星火', url: 'https://xinghuo.xfyun.cn', rank: 6, desc: '科大讯飞出品' }
    ]
  },
  {
    category: 'AI写作工具',
    tools: [
      { name: 'Kimi', url: 'https://kimi.moonshot.cn', rank: 1, recommend: '推荐', desc: '文档处理能力强' },
      { name: '通义千问', url: 'https://tongyi.aliyun.com', rank: 2, recommend: '推荐', desc: '写作辅助功能丰富' },
      { name: '秘塔写作猫', url: 'https://xiezuocat.com', rank: 3, desc: '专业写作助手' },
      { name: '讯飞写作', url: 'https://writing.iflyrec.com', rank: 4, desc: '语音转写+写作' }
    ]
  },
  {
    category: 'AI绘图工具',
    tools: [
      { name: '即梦AI', url: 'https://jimeng.jianying.com', rank: 1, recommend: '推荐', desc: '字节出品，中文理解好' },
      { name: '通义万相', url: 'https://tongyi.aliyun.com/wanxiang', rank: 2, recommend: '推荐', desc: '阿里出品，功能强大' },
      { name: '文心一格', url: 'https://yige.baidu.com', rank: 3, desc: '百度出品' },
      { name: '混元助手', url: 'https://hunyuan.tencent.com', rank: 4, desc: '腾讯出品' },
      { name: '堆友', url: 'https://www.d-id.com', rank: 5, desc: '设计社区出品' }
    ]
  },
  {
    category: 'AI办公工具',
    tools: [
      { name: 'Kimi', url: 'https://kimi.moonshot.cn', rank: 1, recommend: '推荐', desc: '文档分析能力强' },
      { name: '飞书智能伙伴', url: 'https://www.feishu.cn/product/feishu-ai', rank: 2, recommend: '推荐', desc: '企业协作首选' },
      { name: '通义千问', url: 'https://tongyi.aliyun.com', rank: 3, desc: '文档处理功能全' },
      { name: '钉钉AI助理', url: 'https://www.dingtalk.com', rank: 4, desc: '企业办公集成' },
      { name: 'WPS AI', url: 'https://ai.wps.cn', rank: 5, desc: '办公文档智能' }
    ]
  }
]
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  text-align: center;
  padding: 80px 20px;
  color: white;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.hero p {
  font-size: 20px;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto 30px;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 15px 40px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
  display: inline-block;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.section {
  background: white;
  padding: 60px 0;
}

.section-title {
  text-align: center;
  font-size: 32px;
  color: #333;
  margin-bottom: 15px;
}

.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  margin: 15px auto 0;
  border-radius: 2px;
}

.section-desc {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
}

.stages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
}

.stage-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  border-radius: 15px;
  padding: 30px 20px;
  text-align: center;
  transition: all 0.3s;
}

.stage-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.stage-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin: 0 auto 15px;
}

.stage-card h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.stage-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.stage-time {
  margin-top: 15px;
  padding: 10px 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  display: inline-block;
}

.poster-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 0;
  color: white;
}

.poster-content {
  display: flex;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}

.poster-text {
  flex: 1;
  min-width: 300px;
}

.poster-text h2 {
  font-size: 36px;
  margin-bottom: 20px;
}

.poster-text p {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.8;
}

.poster-text ul {
  margin-top: 10px;
  margin-left: 20px;
  line-height: 2;
}

.poster-image {
  flex: 1;
  min-width: 300px;
  text-align: center;
}

.poster-placeholder {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 3/4;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border: 2px dashed rgba(255, 255, 255, 0.5);
  margin: 0 auto;
}

.ai-tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.tool-category {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
}

.tool-category h4 {
  font-size: 18px;
  color: #667eea;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tool-category h4::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #667eea, #764ba2);
  border-radius: 2px;
}

.tool-list {
  list-style: none;
}

.tool-list li {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.tool-list li:last-child {
  border-bottom: none;
}

.tool-list a {
  text-decoration: none;
  color: #555;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.3s;
  padding: 5px;
  border-radius: 8px;
}

.tool-list a:hover {
  background: #f0f0ff;
  color: #667eea;
}

.tool-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tool-rank {
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.tool-list li:nth-child(1) .tool-rank {
  background: linear-gradient(135deg, #ffd700, #ffb700);
}

.tool-list li:nth-child(2) .tool-rank {
  background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
}

.tool-list li:nth-child(3) .tool-rank {
  background: linear-gradient(135deg, #cd7f32, #b87333);
}

.tool-name {
  font-weight: 500;
  color: #333;
}

.tool-recommend {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.tool-desc {
  font-size: 12px;
  color: #888;
  padding-left: 32px;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 32px;
  }

  .hero p {
    font-size: 16px;
  }

  .stages {
    grid-template-columns: 1fr;
  }

  .poster-content {
    flex-direction: column;
  }
}
</style>
