# 修复需求收敛技能加载问题 Spec

## Why

当前需求收敛技能在启动时加载失败，导致无法使用增强的需求分析功能，只能降级到基础 AI API 调用。

**问题现象**：
```
⚠️  需求收敛技能加载失败，请确保已安装 ts-node 和 typescript
错误详情：tsNode.register is not a function
```

**影响**：
- 需求收敛技能无法使用，返回的都是错误信息
- 无法提供完整的需求分析、风险预警、依赖发现等功能
- 用户体验下降，只能获得基础 AI 响应

---

## What Changes

### 问题根因分析

1. **skillService.js 加载逻辑问题**：
   - 使用 ES Module 语法 (`import`) 但尝试动态加载 CommonJS 模块
   - `ts-node/register` 的 API 调用方式不正确
   - TypeScript 配置与 ES Module 不兼容

2. **requirement.js 加载逻辑问题**：
   - 使用 CommonJS 语法 (`require`) 但在 ES Module 项目中
   - 与 `skillService.js` 的加载方式不一致

3. **tsconfig.json 配置问题**：
   - TypeScript 模块设置为 `commonjs`
   - 但项目整体使用 ES Module (`"type": "module"` in package.json)
   - ts-node 在 ES Module 环境下的配置不正确

### 解决方案

**方案选择：统一使用 ES Module + ts-node/esm**

修改点：
1. 修复 `skillService.js` 中的 ts-node 注册逻辑
2. 更新 `requirement-convergence/tsconfig.json` 支持 ES Module
3. 统一加载方式，使用动态 `import()` 加载 TypeScript 模块
4. 添加完善的错误处理和日志输出

---

## Impact

### Affected Specs
- Requirement Convergence Skill 核心能力规格
- 技能集成规格

### Affected Code
**后端**：
- `d:\DFX\Code\AIbisai-wangzhan\ai-contest-web\server\services\skillService.js` - 修复加载逻辑
- `d:\DFX\Code\AIbisai-wangzhan\ai-contest-web\server\services\requirement-convergence\tsconfig.json` - 更新 TS 配置
- `d:\DFX\Code\AIbisai-wangzhan\ai-contest-web\server\services\requirement-convergence\src\index.ts` - 可能需要调整导出方式

**依赖**：
- 确保已安装 `ts-node`, `typescript`, `@types/node`

---

## ADDED Requirements

### Requirement: 需求收敛技能正确加载
The system SHALL 在启动时正确加载需求收敛技能 TypeScript 模块：

#### Scenario: 服务器启动
- **WHEN** 启动后端服务器时
- **THEN** 成功加载需求收敛技能
- **SUCCESS CRITERIA**：
  - 控制台输出 "✅ 需求收敛技能加载成功"
  - 技能所有方法可用（analyze, validate, buildGraph, recommend）
  - 无 TypeScript 编译或加载错误

#### Scenario: 技能调用
- **WHEN** 用户发送需求描述消息
- **THEN** 正确调用需求收敛技能进行分析
- **SUCCESS CRITERIA**：
  - 输出包含完整性评估、风险预警等分析结果
  - 日志显示技能调用记录
  - 响应时间 < 2 秒

---

## MODIFIED Requirements

### Requirement: 技能加载机制（原基础能力）
**修改前**：使用 CommonJS + ts-node 混合方式  
**修改后**：统一使用 ES Module + ts-node/esm 加载

---

## REMOVED Requirements
无

---

## 技术方案设计

### 当前问题分析

**skillService.js (当前代码)**：
```javascript
// ❌ 问题代码
const tsNode = await import('ts-node/esm');
tsNode.register({  // tsNode.register is not a function
  project: './server/services/requirement-convergence/tsconfig.json',
  transpileOnly: true,
  esm: true
});
```

**问题**：
1. `import('ts-node/esm')` 返回的是模块对象，不是 ts-node 实例
2. ts-node 在 ES Module 模式下的 API 不同
3. 需要正确使用 ts-node 的 ESM 加载方式

### 修复方案

#### 步骤 1: 更新 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",  // 改为 ESNext
    "moduleResolution": "node",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "allowSyntheticDefaultImports": true
  },
  "ts-node": {
    "esm": true,  // 启用 ESM 支持
    "compilerOptions": {
      "module": "ESNext"
    },
    "transpileOnly": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### 步骤 2: 修复 skillService.js 加载逻辑

**方案 A：使用 ts-node/esm 注册（推荐）**

```javascript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let RequirementService = null;

try {
  // 注册 ts-node 以支持 TypeScript ES Module
  await import('ts-node/esm').then(({ register }) => {
    register({
      project: './server/services/requirement-convergence/tsconfig.json',
      transpileOnly: true,
      esm: true
    });
  });
  
  // 动态导入 TypeScript 模块
  RequirementService = await import('./requirement-convergence/src/index.ts');
  console.log('✅ 需求收敛技能加载成功');
} catch (error) {
  console.warn('⚠️  需求收敛技能加载失败，请确保已安装 ts-node 和 typescript');
  console.warn('运行：npm install typescript ts-node --save-dev');
  console.warn('错误详情:', error.message);
  
  // 创建 mock 对象
  RequirementService = {
    analyze: async () => ({ error: 'TypeScript 模块未加载' }),
    validate: async () => ({ error: 'TypeScript 模块未加载' }),
    buildGraph: async () => ({ error: 'TypeScript 模块未加载' }),
    recommend: async () => ({ error: 'TypeScript 模块未加载' })
  };
}
```

**方案 B：使用预编译的 JavaScript 文件（备选）**

如果 ts-node/esm 仍然有问题，可以：
1. 预编译 TypeScript 到 JavaScript
2. 直接加载编译后的 JS 文件

```javascript
try {
  RequirementService = await import('./requirement-convergence/dist/index.js');
  console.log('✅ 需求收敛技能加载成功（使用编译后文件）');
} catch (error) {
  // 降级处理
}
```

#### 步骤 3: 确保 index.ts 正确导出

```typescript
// index.ts 中确保使用 ES Module 导出
export { analyze } from './insight-engine/insight-engine';
export { validate } from './validation-engine';
export { buildGraph } from './knowledge-graph';
export { recommend } from './insight-engine';

// 或者默认导出
export default {
  analyze,
  validate,
  buildGraph,
  recommend
};
```

---

## 关键指标（KPI）

| 指标 | 当前 | 目标 | 测量方式 |
|------|------|------|----------|
| 技能加载成功率 | 0% | 100% | 启动日志统计 |
| 技能调用响应时间 | N/A | < 2s | 请求日志统计 |
| 功能可用性 | 降级模式 | 完整功能 | 功能测试 |

---

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| ts-node/esm 兼容性问题 | 中 | 高 | 准备备选方案（预编译） |
| TypeScript 版本不兼容 | 低 | 中 | 使用兼容的 TypeScript 版本 |
| 模块路径解析错误 | 中 | 中 | 使用绝对路径或正确相对路径 |
| 循环依赖问题 | 低 | 高 | 检查并重构依赖关系 |

---

## 验收标准

### 验收测试 1: 技能加载
```
GIVEN 启动后端服务器
WHEN 查看启动日志
THEN 显示 "✅ 需求收敛技能加载成功"
AND 不显示任何 TypeScript 加载错误
```

### 验收测试 2: 技能功能
```
GIVEN 技能已加载
WHEN 调用 analyze 方法分析需求
THEN 返回完整的需求分析结果
AND 包含完整性评分、风险预警等
AND 响应时间 < 2 秒
```

### 验收测试 3: 聊天集成
```
GIVEN 用户在聊天窗口发送需求描述
WHEN 系统处理消息
THEN 使用需求收敛技能分析
AND 输出结构化的分析结果
AND 日志显示技能调用记录
```

---

**Spec 版本**: v1.0  
**创建日期**: 2026-03-18  
**状态**: 待审批
