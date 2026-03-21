# Bug 验证与修复计划（会话管理页）

## 错误分析

根据 `d:\DFX\Code\AIbisai-wangzhan - 副本\需求\前端错误.md` 中的错误日志，分析如下：

---

## Bug 1: Vue Router 警告 - 命名路由有空白路径子路由（警告）

### 错误信息
```
Vue Router warn]: The route named "Requirement" has a child without a name and an empty path.
Using that name won't render the empty path child so you probably want to move the name to the child instead.
```

### 问题分析
- [router/index.js:54-66](file:///d:\DFX\Code\AIbisai-wangzhan - 副本\ai-contest-web\src\router\index.js#L54-L66) 中，`/requirement` 路由有 `name: 'Requirement'`
- 它的子路由 `path: ''` 没有设置 `name`，且是空路径
- Vue Router 建议将 `name` 移到子路由上

### 修复步骤
修改 [router/index.js](file:///d:\DFX\Code\AIbisai-wangzhan - 副本\ai-contest-web\src\router\index.js)：
1. 将父路由的 `name: 'Requirement'` 删除或移到空路径子路由上
2. 推荐方案：给子路由 `path: ''` 添加 `name: 'Requirement'`

---

## Bug 2: v-loading 指令解析失败（严重）

### 错误信息
```
[Vue warn]: Failed to resolve directive: loading
at SessionList.vue:57
```

### 问题分析
- [SessionList.vue:20](file:///d:\DFX\Code\AIbisai-wangzhan - 副本\ai-contest-web\src\views\requirement\SessionList.vue#L20) 使用了 `v-loading="loading"`
- Element Plus 的 `v-loading` 指令需要全局注册
- 项目已安装 `element-plus`（[package.json:20](file:///d:\DFX\Code\AIbisai-wangzhan - 副本\ai-contest-web\package.json#L20)），但未在 main.js 中全局注册 loading 指令

### 修复步骤

#### 方案 A：在 main.js 中全局注册（推荐）
检查 [main.js](file:///d:\DFX\Code\AIbisai-wangzhan - 副本\ai-contest-web\src\main.js) 并添加：
```javascript
import { ElLoadingDirective } from 'element-plus'
app.directive('loading', ElLoadingDirective)
```

#### 方案 B：移除 v-loading，使用条件渲染
如果不需要复杂的加载效果，可以将 [SessionList.vue:20](file:///d:\DFX\Code\AIbisai-wangzhan - 副本\ai-contest-web\src\views\requirement\SessionList.vue#L20) 的 `v-loading` 改为简单的 `v-if`

---

## 非 Bug（API 调用失败）

最后一段错误是 API 调用失败：
```
SessionList.vue:112 fetchSessions
```

这是因为之前的 Bug（API 路由前缀不匹配）导致的。当 `.env` 文件的 `VITE_API_BASE_URL` 正确设置为 `http://localhost:3000/api` 后，此问题应该解决。

---

## 修复文件清单

| 文件 | 修改内容 |
|------|----------|
| `ai-contest-web/src/router/index.js` | 将 `name: 'Requirement'` 从父路由移到子路由 `path: ''` |
| `ai-contest-web/src/main.js` | 添加 `ElLoadingDirective` 全局注册 |
