# AI创意大赛网站 - AI开发指南

## 文档说明
本文档是AI自动开发系统的执行指南，包含完整的实现步骤、技术方案和验收标准。AI开发智能体应严格按照本文档执行开发任务。

---

## 零、环境检查报告

### 0.1 本地开发环境
| 环境 | 版本 | 状态 | 说明 |
|------|------|------|------|
| Node.js | v24.12.0 | ✅ 正常 | 版本较新，完全支持Vite 7 |
| npm | 11.6.2 | ✅ 正常 | 版本较新 |
| Vue.js | 3.5.25 | ✅ 已安装 | 项目已初始化 |
| Vite | 7.3.1 | ✅ 已安装 | 最新版本 |
| MySQL | 3306端口 | ✅ 运行中 | 本地数据库服务 |

### 0.2 端口占用情况
| 端口 | 服务 | 状态 | 建议 |
|------|------|------|------|
| 3306 | MySQL | 运行中 | 数据库服务，保持运行 |
| 5173 | Vite Dev Server | 可用 | **开发服务器默认端口** |
| 7890 | 代理服务 | 运行中 | 本地代理，不影响开发 |
| 8080 | 原型服务器 | 已停止 | 原型预览端口，可重新启动 |
| 3000 | - | 可用 | 备用端口 |
| 5000 | - | 可用 | 备用端口 |

### 0.3 项目当前状态
```
d:\DFX\Code\AI创意大赛-网站/
├── ai-contest-web/          # ✅ Vue项目已初始化
│   ├── src/
│   │   ├── components/      # 待开发
│   │   ├── views/           # 待开发
│   │   └── router/          # 待创建
│   └── package.json         # ✅ 已配置
├── prototype/               # ✅ 原型文件已存在
│   ├── index.html
│   └── training.html
├── AI开发指南.md            # 本文档
└── system_design.dsl        # ✅ DSL设计完成
```

### 0.4 优化建议

#### 环境优化
1. **Node.js版本**：v24.12.0为最新版本，无需升级
2. **端口配置**：5173端口可用，直接使用Vite默认配置
3. **依赖安装**：需补充安装 Element Plus 和 Vue Router

#### 开发流程优化
1. **跳过项目初始化**：项目已通过 `npm create vite` 初始化完成
2. **直接进入Phase 2**：开始公共组件开发
3. **复用原型代码**：prototype目录的HTML代码可作为Vue组件的样式参考

#### 命令优化
```bash
# 进入项目目录并安装剩余依赖
cd d:\DFX\Code\AI创意大赛-网站\ai-contest-web
npm install element-plus vue-router@4

# 启动开发服务器
npm run dev
```

---

## 一、项目概述

### 1.1 项目信息
| 项目属性 | 值 |
|----------|-----|
| 项目名称 | AI创意大赛网站 |
| 项目代号 | ai-contest-web |
| 版本 | MVP v1.0 |
| 开发模式 | 简单系统（一次性生成） |

### 1.2 核心功能
1. **大赛宣传页（首页）**：展示比赛信息、阶段、海报、AI工具链接
2. **培训资料页**：展示培训列表（名称+封面），点击跳转视频地址
3. **培训配置管理**：添加、编辑、删除培训资料

### 1.3 技术约束
- 前端框架：Vue.js 3 + Vite
- UI框架：Element Plus
- 部署方式：静态网站部署
- 响应式设计：支持PC端和移动端

---

## 二、实现步骤规划

### Phase 1: 项目初始化
**预计时间：10分钟**

#### 1.1 创建项目结构
```
ai-contest-web/
├── public/
│   └── images/           # 静态图片资源
├── src/
│   ├── assets/           # 样式、字体等资源
│   ├── components/       # 公共组件
│   │   ├── Header.vue    # 头部导航组件
│   │   ├── Footer.vue    # 页脚组件
│   │   └── Modal.vue     # 弹窗组件
│   ├── views/            # 页面视图
│   │   ├── Home.vue      # 首页
│   │   └── Training.vue  # 培训资料页
│   ├── router/           # 路由配置
│   │   └── index.js
│   ├── stores/           # 状态管理（可选）
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

#### 1.2 初始化命令
```bash
npm create vite@latest ai-contest-web -- --template vue
cd ai-contest-web
npm install
npm install element-plus vue-router@4
```

#### 1.3 验收标准
- [ ] 项目结构创建完成
- [ ] 依赖安装成功
- [ ] 项目可正常启动（npm run dev）

---

### Phase 2: 公共组件开发
**预计时间：20分钟**

#### 2.1 Header组件
**文件路径**：`src/components/Header.vue`

**功能要求**：
- 显示Logo和导航菜单
- 导航项：首页、培训资料
- 支持响应式（移动端汉堡菜单）
- 固定在顶部（sticky）

**Props**：
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| activeMenu | String | 'home' | 当前激活的菜单项 |

**验收标准**：
- [ ] Logo正确显示
- [ ] 导航菜单可点击跳转
- [ ] 当前页面菜单项高亮
- [ ] 移动端响应式正常

#### 2.2 Footer组件
**文件路径**：`src/components/Footer.vue`

**功能要求**：
- 显示关于大赛、学习资源、联系方式
- 版权信息

**验收标准**：
- [ ] 三栏布局正常
- [ ] 链接可点击
- [ ] 响应式适配

#### 2.3 Modal组件
**文件路径**：`src/components/Modal.vue`

**功能要求**：
- 通用弹窗组件
- 支持标题、内容、底部按钮
- 支持关闭按钮
- 点击遮罩层关闭

**Props**：
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | Boolean | false | 是否显示 |
| title | String | '' | 弹窗标题 |
| width | String | '500px' | 弹窗宽度 |

**Events**：
| 事件名 | 说明 |
|--------|------|
| close | 关闭弹窗时触发 |

**验收标准**：
- [ ] 弹窗正常显示/隐藏
- [ ] 遮罩层点击关闭
- [ ] 关闭按钮可用

---

### Phase 3: 首页开发
**预计时间：30分钟**

#### 3.1 页面结构
**文件路径**：`src/views/Home.vue`

**模块划分**：
1. Hero区域 - 大赛标题和标语
2. 比赛阶段 - 5个阶段卡片
3. 大赛海报 - 海报展示区
4. AI工具链接 - 4类工具分类展示

#### 3.2 数据结构

**比赛阶段数据**：
```javascript
const stages = [
  { id: 1, name: 'AI应用干货培训', description: '了解AI基础知识...', time: '第1-2周' },
  { id: 2, name: '创意大赛', description: '发挥创意...', time: '第3-4周' },
  { id: 3, name: 'Agent构建培训与比赛', description: '学习构建简单智能体...', time: '第5-8周' },
  { id: 4, name: 'Agent+Skill体系', description: '进阶学习...', time: '第9-12周' },
  { id: 5, name: '核心知识库构建', description: '为Agent构建专业知识库...', time: '第13-16周' }
]
```

**AI工具数据**：
```javascript
const aiTools = [
  { category: 'AI对话助手', tools: ['ChatGPT', 'Claude', '文心一言', '通义千问'] },
  { category: 'AI写作工具', tools: ['Notion AI', 'Jasper', 'Copy.ai', '写作猫'] },
  { category: 'AI绘图工具', tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion', '文心一格'] },
  { category: 'AI办公工具', tools: ['Microsoft Copilot', '飞书智能伙伴', 'Kimi', '钉钉AI助理'] }
]
```

#### 3.3 验收标准
- [ ] Hero区域显示正常
- [ ] 5个阶段卡片正确展示
- [ ] 海报区域显示（预留上传位置）
- [ ] AI工具分类展示，链接可点击跳转
- [ ] 响应式设计正常
- [ ] 页面加载时间 < 3秒

---

### Phase 4: 培训资料页开发
**预计时间：40分钟**

#### 4.1 页面结构
**文件路径**：`src/views/Training.vue`

**模块划分**：
1. 页面头部 - 标题和描述
2. 工具栏 - 添加培训、配置管理按钮
3. 培训列表 - 卡片网格展示

#### 4.2 数据结构

**培训数据**：
```javascript
const trainings = ref([
  {
    id: 1,
    name: 'AI应用干货培训 - 第一讲：认识AI',
    videoUrl: 'https://www.bilibili.com/video/example1',
    coverImage: '/images/training-1.jpg'
  },
  {
    id: 2,
    name: 'AI工具使用指南 - ChatGPT实战手册',
    videoUrl: 'https://www.bilibili.com/video/example2',
    coverImage: '/images/training-2.jpg'
  }
])
```

#### 4.3 功能实现

**添加培训弹窗**：
- 表单字段：培训名称、视频地址、封面图片
- 封面图片支持上传预览
- 表单验证：名称和地址必填

**配置管理弹窗**：
- 列表展示所有培训
- 每项显示：名称、视频地址、编辑/删除按钮
- 编辑功能：打开编辑弹窗
- 删除功能：确认删除

**卡片点击跳转**：
```javascript
const openVideo = (url) => {
  window.open(url, '_blank')
}
```

#### 4.4 验收标准
- [ ] 培训卡片正确展示（名称+封面）
- [ ] 点击卡片跳转到视频地址
- [ ] 添加培训弹窗功能正常
- [ ] 配置管理弹窗功能正常
- [ ] 编辑培训功能正常
- [ ] 删除培训功能正常
- [ ] 响应式设计正常

---

### Phase 5: 路由配置
**预计时间：10分钟**

#### 5.1 路由定义
**文件路径**：`src/router/index.js`

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Training from '../views/Training.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/training', name: 'Training', component: Training }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

#### 5.2 验收标准
- [ ] 首页路由正常（/）
- [ ] 培训资料页路由正常（/training）
- [ ] 导航切换正常
- [ ] 浏览器前进/后退正常

---

### Phase 6: 样式优化
**预计时间：20分钟**

#### 6.1 全局样式
**文件路径**：`src/assets/main.css`

**样式规范**：
- 主色调：#667eea（紫色渐变起始色）
- 辅助色：#764ba2（紫色渐变结束色）
- 背景色：#f5f7fa
- 文字色：#333（主）、#666（次）、#888（辅助）
- 圆角：8px（小）、15px（中）、25px（按钮）
- 阴影：0 2px 10px rgba(0, 0, 0, 0.05)

#### 6.2 响应式断点
```css
/* 移动端 */
@media (max-width: 768px) { ... }

/* 小屏移动端 */
@media (max-width: 480px) { ... }
```

#### 6.3 验收标准
- [ ] 视觉风格统一
- [ ] PC端显示正常（> 768px）
- [ ] 移动端显示正常（<= 768px）
- [ ] 动画过渡流畅

---

### Phase 7: 测试与验收
**预计时间：15分钟**

#### 7.1 功能测试清单

| 测试项 | 测试内容 | 预期结果 |
|--------|----------|----------|
| 首页访问 | 访问 / 路由 | 页面正常显示 |
| 导航跳转 | 点击导航菜单 | 正确跳转到对应页面 |
| 阶段展示 | 查看比赛阶段 | 5个阶段卡片正确展示 |
| 工具链接 | 点击AI工具链接 | 新窗口打开对应网站 |
| 培训列表 | 访问培训资料页 | 培训卡片正确展示 |
| 视频跳转 | 点击培训卡片 | 新窗口打开视频地址 |
| 添加培训 | 点击添加按钮 | 弹窗显示，表单可提交 |
| 编辑培训 | 点击编辑按钮 | 弹窗显示，数据回填 |
| 删除培训 | 点击删除按钮 | 确认后删除 |

#### 7.2 性能测试
- [ ] 首屏加载时间 < 3秒
- [ ] 页面响应时间 < 1秒
- [ ] 无控制台错误

#### 7.3 兼容性测试
- [ ] Chrome浏览器正常
- [ ] Edge浏览器正常
- [ ] Firefox浏览器正常
- [ ] Safari浏览器正常
- [ ] 移动端Chrome正常
- [ ] 移动端Safari正常

---

## 三、数据持久化方案

### 3.1 本地存储方案（MVP推荐）
由于MVP版本无需后端，使用 localStorage 存储培训数据：

```javascript
// 存储培训数据
const saveTrainings = (data) => {
  localStorage.setItem('trainings', JSON.stringify(data))
}

// 读取培训数据
const loadTrainings = () => {
  const data = localStorage.getItem('trainings')
  return data ? JSON.parse(data) : []
}
```

### 3.2 数据结构
```javascript
{
  trainings: [
    {
      id: Number,          // 唯一标识
      name: String,        // 培训名称
      videoUrl: String,    // 视频地址
      coverImage: String,  // 封面图片（Base64或URL）
      createdAt: Date,     // 创建时间
      updatedAt: Date      // 更新时间
    }
  ]
}
```

---

## 四、开发注意事项

### 4.1 代码规范
- 组件命名：PascalCase（如 Header.vue）
- 变量命名：camelCase
- 常量命名：UPPER_SNAKE_CASE
- CSS类名：kebab-case

### 4.2 注释规范
```javascript
/**
 * 函数说明
 * @param {String} name - 参数说明
 * @returns {Boolean} 返回值说明
 */
function example(name) {
  // 实现
}
```

### 4.3 Git提交规范
- feat: 新功能
- fix: 修复bug
- style: 样式修改
- refactor: 代码重构
- docs: 文档更新

### 4.4 禁止事项
- 禁止在代码中硬编码敏感信息
- 禁止使用内联样式（除动态样式外）
- 禁止跳过测试直接部署
- 禁止添加DSL未声明的功能

---

## 五、交付物清单

### 5.1 代码交付物
- [ ] 完整的项目源码
- [ ] package.json 依赖配置
- [ ] vite.config.js 构建配置
- [ ] README.md 项目说明

### 5.2 文档交付物
- [ ] 系统设计DSL文件
- [ ] AI开发指南（本文档）
- [ ] 部署说明文档

### 5.3 部署交付物
- [ ] 构建后的静态文件（dist目录）
- [ ] 部署配置文件（如需要）

---

## 六、执行检查表

AI开发智能体在执行过程中，应按以下顺序检查：

### Phase 1 检查点
- [ ] 项目结构创建完成
- [ ] 依赖安装成功
- [ ] 开发服务器启动成功

### Phase 2 检查点
- [ ] Header组件开发完成
- [ ] Footer组件开发完成
- [ ] Modal组件开发完成

### Phase 3 检查点
- [ ] 首页Hero区域完成
- [ ] 比赛阶段模块完成
- [ ] 海报区域完成
- [ ] AI工具链接完成

### Phase 4 检查点
- [ ] 培训列表展示完成
- [ ] 添加培训功能完成
- [ ] 配置管理功能完成
- [ ] 编辑/删除功能完成

### Phase 5 检查点
- [ ] 路由配置完成
- [ ] 导航跳转正常

### Phase 6 检查点
- [ ] 全局样式完成
- [ ] 响应式适配完成

### Phase 7 检查点
- [ ] 功能测试通过
- [ ] 性能测试通过
- [ ] 兼容性测试通过

---

## 七、验收报告模板

完成开发后，AI智能体应输出以下格式的验收报告：

```markdown
# AI创意大赛网站 MVP 验收报告

## 一、开发概况
- 开发时间：YYYY-MM-DD ~ YYYY-MM-DD
- 总耗时：XX小时
- 代码行数：XXXX行

## 二、功能完成情况
| 功能模块 | 状态 | 备注 |
|----------|------|------|
| 大赛宣传页 | ✅ 完成 | - |
| 培训资料页 | ✅ 完成 | - |
| 培训配置管理 | ✅ 完成 | - |

## 三、测试结果
| 测试类型 | 结果 | 详情 |
|----------|------|------|
| 功能测试 | ✅ 通过 | 所有功能正常 |
| 性能测试 | ✅ 通过 | 首屏加载2.1秒 |
| 兼容性测试 | ✅ 通过 | 主流浏览器正常 |

## 四、已知问题
1. 无

## 五、后续建议
1. 建议添加后端服务实现数据持久化
2. 建议添加用户认证功能
```

---

**文档版本**：v1.0
**创建时间**：2026-03-03
**适用范围**：AI创意大赛网站 MVP版本开发
