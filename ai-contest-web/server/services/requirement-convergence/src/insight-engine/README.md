# 智能需求洞察引擎

## 概述

智能需求洞察引擎是一个用于分析和评估软件需求的 TypeScript 模块，提供四大核心功能：
- **完整性评估**：基于 5W2H 维度对需求进行评分
- **风险预警**：检测模糊词汇和逻辑冲突
- **依赖发现**：识别外部系统、数据源和依赖关系
- **智能推荐**：基于历史需求库提供最佳实践建议

## 目录结构

```
ai-engine/
├── insight-engine.ts      # 核心引擎实现
├── insight-engine.test.ts # 单元测试
├── api-example.ts         # API 使用示例
└── README.md              # 本文档
```

## 安装

本模块使用纯 TypeScript 实现，无外部依赖。确保已安装 Node.js 和 TypeScript：

```bash
npm install -g typescript ts-node
```

## 快速开始

### 基本使用

```typescript
import { analyzeRequirement } from './insight-engine';

const requirement = `
  为了提升用户体验，我们需要为企业管理员在 PC 端实现一个用户管理模块。
  通过 React 框架在 2026 年 Q2 前完成，预算 5 万元。
`;

const result = analyzeRequirement(requirement);
console.log(result);
```

### 独立功能使用

```typescript
import {
  evaluateCompleteness,    // 完整性评估
  analyzeRisks,           // 风险预警
  discoverDependencies,   // 依赖发现
  generateRecommendations // 智能推荐
} from './insight-engine';

// 完整性评估
const completeness = evaluateCompleteness('需要一个用户管理系统');
console.log(completeness.score.totalScore);

// 风险预警
const risks = analyzeRisks('这个功能大概需要快速完成');
console.log(risks.risks);

// 依赖发现
const deps = discoverDependencies('需要集成微信支付 API，从 MySQL 读取数据');
console.log(deps.dependencies);

// 智能推荐
const recs = generateRecommendations('需要实现用户注册功能');
console.log(recs.recommendations);
```

## API 文档

### 1. analyzeRequirement(requirement: string): InsightResult

**功能**：执行完整的需求洞察分析

**参数**：
- `requirement: string` - 待分析的需求文本

**返回**：`InsightResult` 对象，包含：
```typescript
interface InsightResult {
  completeness: CompletenessResult;    // 完整性评估结果
  riskWarning: RiskWarningResult;      // 风险预警结果
  dependencies: DependencyResult;      // 依赖发现结果
  recommendations: RecommendationResult; // 智能推荐结果
}
```

**示例**：
```typescript
const result = analyzeRequirement('需要实现用户登录功能');
console.log(result.completeness.score.totalScore);
console.log(result.riskWarning.overallRiskLevel);
console.log(result.dependencies.dependencies.length);
console.log(result.recommendations.recommendations.length);
```

---

### 2. evaluateCompleteness(requirement: string): CompletenessResult

**功能**：基于 5W2H 维度评估需求完整性

**5W2H 维度**：
- **Who** - 目标用户是谁
- **What** - 需要实现什么功能
- **Why** - 为什么需要这个功能（业务价值）
- **When** - 时间节点/工期要求
- **Where** - 使用场景/部署环境
- **How** - 实现方式/技术方案
- **How Much** - 成本/资源/性能指标

**返回**：
```typescript
interface CompletenessResult {
  score: FiveW2HScore;           // 各维度评分
  missingElements: string[];     // 缺失要素列表
  suggestions: string[];         // 改进建议
}

interface FiveW2HScore {
  who: number;        // Who 维度得分 (0-100)
  what: number;       // What 维度得分 (0-100)
  why: number;        // Why 维度得分 (0-100)
  when: number;       // When 维度得分 (0-100)
  where: number;      // Where 维度得分 (0-100)
  how: number;        // How 维度得分 (0-100)
  howMuch: number;    // How Much 维度得分 (0-100)
  totalScore: number; // 综合评分 (0-100)
}
```

**示例**：
```typescript
const result = evaluateCompleteness('需要一个用户管理系统');
console.log('综合评分:', result.score.totalScore);
console.log('缺失要素:', result.missingElements);
console.log('建议:', result.suggestions);
```

---

### 3. analyzeRisks(requirement: string): RiskWarningResult

**功能**：检测需求中的模糊词汇和逻辑冲突

**风险类型**：
- **vague** - 模糊词汇（如"快速"、"友好"、"大概"）
- **conflict** - 逻辑冲突（如"快速但高质量"、"低成本但高性能"）

**返回**：
```typescript
interface RiskWarningResult {
  risks: RiskItem[];                    // 风险项列表
  riskCount: {
    high: number;   // 高风险数量
    medium: number; // 中风险数量
    low: number;    // 低风险数量
  };
  overallRiskLevel: 'high' | 'medium' | 'low'; // 整体风险等级
}

interface RiskItem {
  type: RiskType;           // 风险类型
  level: 'high' | 'medium' | 'low'; // 风险等级
  description: string;      // 风险描述
  suggestion: string;       // 澄清建议
  position?: {              // 风险位置（可选）
    start: number;
    end: number;
  };
}
```

**示例**：
```typescript
const result = analyzeRisks('需要快速实现一个大概友好的界面');
console.log('风险等级:', result.overallRiskLevel);
console.log('风险项:', result.risks.map(r => r.description));
```

---

### 4. discoverDependencies(requirement: string): DependencyResult

**功能**：识别需求中的依赖关系

**依赖类型**：
- **external_system** - 外部系统/API
- **data_source** - 数据源
- **precondition** - 前置条件
- **postcondition** - 后置依赖

**返回**：
```typescript
interface DependencyResult {
  dependencies: Dependency[];      // 所有依赖
  externalSystems: Dependency[];   // 外部系统
  dataSources: Dependency[];       // 数据源
  preconditions: Dependency[];     // 前置条件
  postconditions: Dependency[];    // 后置依赖
}

interface Dependency {
  type: DependencyType;     // 依赖类型
  name: string;             // 依赖名称
  description: string;      // 依赖描述
  isRequired: boolean;      // 是否必需
  alternatives?: string[];  // 替代方案（可选）
}
```

**示例**：
```typescript
const result = discoverDependencies(
  '需要集成微信支付 API，先从 MySQL 读取数据，完成后发送邮件通知'
);
console.log('外部系统:', result.externalSystems);
console.log('数据源:', result.dataSources);
console.log('后置依赖:', result.postconditions);
```

---

### 5. generateRecommendations(requirement: string): RecommendationResult

**功能**：基于历史需求库生成智能推荐

**返回**：
```typescript
interface RecommendationResult {
  recommendations: Recommendation[];  // 推荐的需求列表
  bestPractices: string[];            // 最佳实践建议
  relatedRequirements: string[];      // 相关需求标题
}

interface Recommendation {
  title: string;          // 推荐需求标题
  similarity: number;     // 相似度 (0-100)
  sourceFile: string;     // 来源文件
  content: string;        // 需求内容
  bestPractices: string[];// 最佳实践
}
```

**示例**：
```typescript
const result = generateRecommendations('需要实现用户注册功能，支持手机号验证');
console.log('推荐需求:', result.recommendations.map(r => r.title));
console.log('最佳实践:', result.bestPractices);
```

---

## 运行测试

### 运行单元测试

```bash
cd requirement-convergence/ai-engine
ts-node insight-engine.test.ts
```

### 运行 API 示例

```bash
cd requirement-convergence/ai-engine
ts-node api-example.ts
```

### 运行内置测试函数

```typescript
import { runTests } from './insight-engine';
runTests();
```

## 在 SKILL 中集成

### 示例代码

```typescript
import { analyzeRequirement } from './insight-engine';

// 在 SKILL 处理函数中调用
async function handleUserRequirement(requirement: string) {
  // 执行洞察分析
  const insight = analyzeRequirement(requirement);
  
  // 生成分析报告
  const report = {
    completeness: insight.completeness.score.totalScore,
    riskLevel: insight.riskWarning.overallRiskLevel,
    suggestions: insight.completeness.suggestions,
    risks: insight.riskWarning.risks,
    dependencies: insight.dependencies.dependencies,
    recommendations: insight.recommendations.bestPractices
  };
  
  // 返回给用户的反馈
  return generateFeedback(report);
}

function generateFeedback(report: any): string {
  let feedback = '【需求分析报告】\n\n';
  
  // 完整性反馈
  feedback += `完整性评分：${report.completeness}/100\n`;
  if (report.suggestions.length > 0) {
    feedback += '\n建议补充:\n';
    report.suggestions.forEach(s => feedback += `  - ${s}\n`);
  }
  
  // 风险反馈
  if (report.risks.length > 0) {
    feedback += `\n⚠ 发现 ${report.risks.length} 个风险:\n`;
    report.risks.forEach(r => feedback += `  - ${r.description}\n`);
  }
  
  // 依赖反馈
  if (report.dependencies.length > 0) {
    feedback += `\n📋 识别到的依赖:\n`;
    report.dependencies.forEach(d => feedback += `  - ${d.name}\n`);
  }
  
  // 推荐反馈
  if (report.recommendations.length > 0) {
    feedback += `\n💡 最佳实践建议:\n`;
    report.recommendations.forEach(r => feedback += `  - ${r}\n`);
  }
  
  return feedback;
}
```

## 自定义配置

### 扩展模糊词汇库

在 `insight-engine.ts` 中修改 `VAGUE_WORDS` 数组：

```typescript
const VAGUE_WORDS = [
  // 现有词汇...
  '你的自定义模糊词汇',
  '另一个词汇'
];
```

### 扩展 5W2H 关键词库

在 `insight-engine.ts` 中修改 `FIVE_W2H_PATTERNS` 对象：

```typescript
const FIVE_W2H_PATTERNS = {
  who: [
    // 现有词汇...
    '你的自定义关键词'
  ],
  // ...其他维度
};
```

### 扩展历史需求库

在 `insight-engine.ts` 中修改 `HISTORICAL_REQUIREMENTS` 数组，或实现从文件系统读取：

```typescript
// 从 requirements 目录读取历史需求
async function loadHistoricalRequirements(): Promise<HistoricalRequirement[]> {
  // 实现文件读取逻辑
  const files = await fs.readdir('requirements/');
  return await Promise.all(
    files.map(file => loadRequirement(`requirements/${file}`))
  );
}
```

## 输出示例

### 完整性评估输出

```
综合评分：72/100

各维度得分:
  - Who (目标用户): 80
  - What (功能需求): 85
  - Why (业务价值): 60
  - When (时间节点): 40
  - Where (使用场景): 70
  - How (实现方式): 75
  - How Much (成本资源): 50

缺失要素:
  1. 时间节点 (When)
  2. 成本资源 (How Much)

改进建议:
  1. 请明确时间节点或工期要求，例如："需要在 Q2 完成"、"上线后 3 个月内"等
  2. 请补充成本、资源或性能指标，例如："预算 10 万元"、"支持 1000 并发"等
```

### 风险预警输出

```
整体风险等级：HIGH

风险统计:
  - 高风险：2 个
  - 中风险：3 个
  - 低风险：0 个

风险详情:
  1. [HIGH] 快速交付与高质量要求可能存在冲突
     建议：建议明确优先级，在资源有限的情况下做出权衡
  2. [MEDIUM] 检测到模糊词汇："大概"
     建议：建议将"大概"替换为具体、可量化的描述
```

## 常见问题

### Q: 如何提高完整性评分？

A: 在需求描述中包含更多 5W2H 维度的信息：
- 明确目标用户（Who）
- 详细描述功能（What）
- 说明业务价值（Why）
- 指定时间节点（When）
- 描述使用场景（Where）
- 提供技术方案（How）
- 估算成本资源（How Much）

### Q: 为什么检测到很多模糊词汇风险？

A: 模糊词汇如"快速"、"友好"、"大概"等会导致需求不明确。建议：
- 将"快速"改为具体指标，如"响应时间<1 秒"
- 将"友好"改为具体标准，如"符合 XX 设计规范"
- 将"大概"改为具体数字，如"预计 3 周"

### Q: 如何扩展历史需求库？

A: 有两种方式：
1. 直接修改 `HISTORICAL_REQUIREMENTS` 数组添加更多历史需求
2. 实现从 `requirements/` 目录动态读取（推荐）

### Q: 依赖发现不准确怎么办？

A: 可以：
1. 扩展 `EXTERNAL_SYSTEM_PATTERNS` 和 `DATA_SOURCE_PATTERNS` 关键词库
2. 调整正则表达式匹配逻辑
3. 添加更多前置/后置条件识别模式

## 技术架构

### 评分算法

**5W2H 维度评分**：
- 基础分：匹配到的关键词数量 × 15（最高 60 分）
- 深度分：上下文详细程度（最高 40 分）
- 综合评分：加权平均（What 和 Why 各占 20%，其他各占 12%）

**风险等级评估**：
- 高风险：存在逻辑冲突
- 中风险：存在 3 个以上模糊词汇
- 低风险：存在少量模糊词汇

### 关键词匹配

使用正则表达式进行关键词匹配，支持：
- 大小写不敏感
- 全局匹配
- 上下文分析

## 版本历史

- **v1.0** (2026-03-17)
  - 初始版本
  - 实现四大核心功能
  - 提供单元测试和示例

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进本引擎：
- 添加更多模糊词汇
- 优化评分算法
- 扩展历史需求库
- 改进依赖发现逻辑

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系项目维护者。
