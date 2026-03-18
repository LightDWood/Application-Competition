# AI 副驾驶创意工坊入口添加规范

## Why
当前需求收敛模块功能完整但缺乏用户入口，首页和导航栏均无访问通道，导致用户无法发现和使用该功能。需要将功能名称从"需求澄清"优化为更贴合大赛主题的"AI 副驾驶创意工坊"，并在关键位置添加入口。

## What Changes
- ✅ 将系统名称从"需求澄清系统"改为"**AI 副驾驶创意工坊**"
- ✅ 在首页 Hero 区域添加"开启 AI 副驾驶"主按钮
- ✅ 在顶部导航栏添加"创意工坊"菜单项
- ✅ 优化登录页面，使用新品牌名称
- ✅ 更新路由标题和页面标题

## Impact
- **Affected specs**: 无
- **Affected code**: 
  - `src/views/Home.vue` - 首页 Hero 区域
  - `src/components/Header.vue` - 顶部导航栏
  - `src/views/user/Login.vue` - 登录页面
  - `src/views/user/Register.vue` - 注册页面
  - `src/views/requirement/Layout.vue` - 需求收敛布局
  - `src/router/index.js` - 路由配置

## ADDED Requirements

### Requirement: 首页 Hero 区域入口
系统 SHALL 在首页 Hero 区域的按钮组中添加"开启 AI 副驾驶"按钮，位于"立即学习"和"大赛报名"之间。

#### Scenario: 用户点击首页按钮
- **WHEN** 用户访问首页并点击"开启 AI 副驾驶"按钮
- **THEN** 如果用户已登录则跳转到创意工坊页面，否则跳转到登录页面

### Requirement: 导航栏菜单入口
系统 SHALL 在顶部导航栏添加"创意工坊"菜单项，位于"培训资料"和"大赛报名"之间。

#### Scenario: 用户点击导航菜单
- **WHEN** 用户点击导航栏的"创意工坊"菜单
- **THEN** 如果用户已登录则跳转到创意工坊页面，否则跳转到登录页面

### Requirement: 品牌名称统一
系统 SHALL 在所有用户界面中使用统一的品牌名称：
- 登录页标题："AI 副驾驶创意工坊"
- 布局侧边栏标题："AI 副驾驶创意工坊"
- 页面标题："创意工坊 - AI 副驾驶设计助手"

#### Scenario: 用户访问任意相关页面
- **WHEN** 用户访问登录页、注册页或创意工坊页面
- **THEN** 看到统一的品牌名称和视觉风格

## MODIFIED Requirements

### Requirement: 路由守卫优化
原路由配置中的 `requiresUserAuth` 保持不变，但跳转逻辑需要优化：
- 未登录用户访问创意工坊时，跳转到 `/user/login` 并携带返回参数

### Requirement: 按钮样式
首页按钮组样式需要扩展，添加第三种按钮样式（accent 样式）用于突出 AI 副驾驶功能。

## REMOVED Requirements
无

---

## 命名规范

| 场景 | 旧名称 | 新名称 | 英文名 |
|------|--------|--------|--------|
| 系统总称 | 需求收敛系统 | AI 副驾驶创意工坊 | AI Copilot Creative Workshop |
| 首页按钮 | (无) | 开启 AI 副驾驶 | Start AI Copilot |
| 导航菜单 | (无) | 创意工坊 | Creative Workshop |
| 登录页标题 | 需求收敛系统 | AI 副驾驶创意工坊 | AI Copilot Creative Workshop |
| 布局标题 | 需求收敛系统 | AI 副驾驶创意工坊 | AI Copilot Creative Workshop |
| 页面标题 | 会话列表 | 创意工坊 - 会话列表 | Workshop - Sessions |

## 视觉设计规范

### 按钮样式（Home.vue）
```css
.btn-accent {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.btn-accent:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}
```

### 导航栏激活状态（Header.vue）
```css
.nav a.active {
  color: #667eea;
  position: relative;
}

.nav a.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}
```

## 用户流程

### 流程 1: 首页入口
```
用户访问首页 
  ↓
看到 Hero 区域的三个按钮
  ↓
点击"开启 AI 副驾驶"
  ↓
检查登录状态
  ↓
已登录 → 进入创意工坊
未登录 → 进入登录页
```

### 流程 2: 导航栏入口
```
用户在任意页面
  ↓
点击导航栏"创意工坊"
  ↓
检查登录状态
  ↓
已登录 → 进入创意工坊
未登录 → 进入登录页
```

## 验收标准

1. ✅ 首页 Hero 区域显示三个按钮，中间按钮为"开启 AI 副驾驶"
2. ✅ 导航栏显示四个菜单项，包含"创意工坊"
3. ✅ 点击按钮/菜单能正确跳转（考虑登录状态）
4. ✅ 登录页面标题更新为"AI 副驾驶创意工坊"
5. ✅ 布局侧边栏标题更新为"AI 副驾驶创意工坊"
6. ✅ 响应式设计在移动端正常显示
7. ✅ 按钮和菜单样式与现有设计一致
