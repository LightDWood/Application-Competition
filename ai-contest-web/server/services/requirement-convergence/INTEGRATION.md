# 需求收敛技能集成指南

## 📋 概述

需求收敛技能已成功集成到 `ai-contest-web` 项目中，作为核心服务端技能模块。

---

## 📁 目录结构

```
ai-contest-web/
├── server/
│   ├── services/
│   │   ├── skillService.js                 # 技能服务（已增强）
│   │   └── requirement-convergence/        # 需求收敛技能
│   │       ├── src/                        # TypeScript 源代码
│   │       │   ├── insight-engine/         # 智能需求洞察
│   │       │   ├── knowledge-graph/        # 需求图谱
│   │       │   ├── validation-engine/      # 需求验证
│   │       │   ├── ai-enhancement/         # AI 增强
│   │       │   ├── template-library/       # 行业模板库
│   │       │   ├── persona-engine/         # 人格化交互
│   │       │   └── index.ts                # 统一导出入口
│   │       ├── docs/                       # 文档
│   │       ├── tsconfig.json               # TypeScript 配置
│   │       └── SKILL.md                    # 技能定义
│   │
│   ├── routes/
│   │   ├── index.js                        # 主路由（已更新）
│   │   └── requirement.js                  # ✨ 新增：需求收敛 API 路由
│   └── ...
│
└── package.json                            # 已添加 TypeScript 依赖
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd ai-contest-web
npm install
```

已安装的依赖：
- `typescript` - TypeScript 编译器
- `ts-node` - TypeScript 运行时
- `@types/node` - Node.js 类型定义
- `@types/express` - Express 类型定义

### 2. 启动服务器

```bash
# 开发模式（前后端同时启动）
npm start

# 只启动后端
npm run server

# 开发模式（后端热重载）
npm run server:dev
```

### 3. 测试 API 接口

#### 健康检查
```bash
curl http://localhost:3000/api/requirement/health
```

#### 需求分析
```bash
curl -X POST http://localhost:3000/api/requirement/analyze \
  -H "Content-Type: application/json" \
  -d '{"requirement": "实现用户登录功能，支持邮箱和手机号注册"}'
```

#### 需求验证
```bash
curl -X POST http://localhost:3000/api/requirement/validate \
  -H "Content-Type: application/json" \
  -d '{
    "requirement": "实现用户登录功能",
    "requirementId": "REQ-001"
  }'
```

---

## 📡 API 接口文档

### 基础路径
```
/api/requirement
```

### 接口列表

#### 1. POST /analyze
**需求分析** - 完整性评估、风险预警、依赖发现、智能推荐

**请求体**:
```json
{
  "requirement": "需求描述文本"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "insight": { "completeness": {...}, "risks": {...} },
    "risks": {...},
    "dependencies": {...},
    "recommendations": {...}
  },
  "timestamp": "2026-03-17T15:30:00.000Z"
}
```

---

#### 2. POST /validate
**需求验证** - 可测试性检查、验收标准生成、质量评分

**请求体**:
```json
{
  "requirement": "需求描述文本",
  "requirementId": "REQ-001"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "testability": { "overallScore": 85, "grade": "A" },
    "acceptanceCriteria": [...],
    "quality": { "overallScore": 88, "dimensionScores": {...} }
  },
  "timestamp": "2026-03-17T15:30:00.000Z"
}
```

---

#### 3. POST /graph
**需求图谱** - 构建需求图谱、关系发现、影响分析

**请求体**:
```json
{
  "requirements": [
    { "id": "REQ-001", "title": "用户登录", "description": "..." },
    { "id": "REQ-002", "title": "用户注册", "description": "..." }
  ],
  "operation": "build"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "nodes": [...],
    "edges": [...],
    "impactAnalysis": [...]
  },
  "timestamp": "2026-03-17T15:30:00.000Z"
}
```

---

#### 4. POST /recommend
**智能推荐** - 基于历史需求库推荐最佳实践

**请求体**:
```json
{
  "requirement": "需求描述文本",
  "limit": 5
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "recommendations": [...],
    "bestPractices": [...],
    "relatedTemplates": [...]
  },
  "timestamp": "2026-03-17T15:30:00.000Z"
}
```

---

#### 5. GET /health
**健康检查**

**响应**:
```json
{
  "success": true,
  "status": "ok",
  "service": "requirement-convergence",
  "version": "2.0.0",
  "timestamp": "2026-03-17T15:30:00.000Z"
}
```

---

## 💻 在代码中使用

### 通过 SkillService 调用

```javascript
import skillService from './server/services/skillService.js';

// 需求分析
const analysis = await skillService.analyzeRequirement('实现用户登录功能');
console.log(analysis);

// 需求验证
const validation = await skillService.validateRequirement('需求描述', 'REQ-001');
console.log(validation.quality.overallScore);

// 构建图谱
const graph = await skillService.buildRequirementGraph(requirements);
console.log(graph.edges.length);

// 智能推荐
const recommendations = await skillService.getRecommendations('需求描述', 5);
console.log(recommendations.bestPractices);
```

### 直接导入 TypeScript 模块

```typescript
import { analyze, validate, buildGraph } from './server/services/requirement-convergence/src/index';

// 需求分析
const result = await analyze('实现用户登录功能');

// 需求验证
const quality = await validate('需求描述', 'REQ-001');

// 构建图谱
const graph = await buildGraph(requirements);
```

---

## 🔧 配置说明

### TypeScript 配置
文件：`server/services/requirement-convergence/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### 环境变量（可选）
在 `.env` 文件中配置：

```env
# 需求收敛技能配置
REQUIREMENT_SKILL_ENABLED=true
REQUIREMENT_SKILL_DEBUG=false
```

---

## 🧪 测试

### 单元测试
```bash
cd server/services/requirement-convergence
npx ts-node src/insight-engine/insight-engine.test.ts
```

### 集成测试
```bash
npx ts-node server/services/requirement-convergence/src/integration-test.ts
```

---

## ⚠️ 常见问题

### 1. TypeScript 模块加载失败
**错误**: `require is not defined`

**解决方案**:
```bash
npm install typescript ts-node --save-dev
```

### 2. 导入路径错误
**错误**: `Cannot find module '...'`

**解决方案**:
- 检查 `tsconfig.json` 中的 `rootDir` 和 `outDir`
- 确保所有导入使用相对路径

### 3. API 接口 404
**错误**: `Cannot POST /api/requirement/analyze`

**解决方案**:
- 检查 `server/routes/index.js` 是否注册了路由
- 重启服务器

---

## 📚 相关文档

- [SKILL.md](./server/services/requirement-convergence/SKILL.md) - 技能定义
- [PERFORMANCE.md](./server/services/requirement-convergence/docs/PERFORMANCE.md) - 性能优化
- [UAT-scenarios.md](./server/services/requirement-convergence/docs/UAT-scenarios.md) - 验收测试

---

## 🎯 下一步

1. ✅ 前端集成 - 在 Vue 组件中调用 API
2. ✅ 数据库持久化 - 保存需求分析结果
3. ✅ 缓存优化 - 减少重复计算
4. ✅ 性能监控 - 添加日志和指标

---

*最后更新：2026-03-17*
