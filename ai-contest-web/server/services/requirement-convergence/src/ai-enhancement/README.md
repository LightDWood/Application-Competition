# AI 增强模块 API 文档

## 概述

`ai-enhancement.ts` 提供了 AI 驱动的需求增强能力，包括需求润色、歧义检测、智能拆分、优先级推荐和用户故事生成等功能。

## 文件位置

```
d:\DFX\Code\AIbisai-wangzhan\ai-engine\ai-enhancement.ts
```

## 核心功能

### 1. 歧义检测 (detectAmbiguity)

实时检测需求文本中的模糊词汇和缺失要素。

**函数签名:**
```typescript
function detectAmbiguity(text: string): AmbiguityResult
```

**参数:**
- `text`: 待检测的文本

**返回值:**
```typescript
interface AmbiguityResult {
  originalText: string;              // 原始文本
  ambiguousWords: AmbiguousWord[];   // 检测到的模糊词汇
  completenessScore: number;         // 完整性评分 (0-100)
  missingElements: MissingElement[]; // 缺失要素列表
  clarificationQuestions: string[];  // 建议澄清的问题
}
```

**使用示例:**
```typescript
const requirement = '我们需要一个快速的登录功能';
const result = detectAmbiguity(requirement);

console.log(result.completenessScore); // 例如：71
console.log(result.ambiguousWords);    // [{ word: '快速', type: 'subjective', ... }]
```

---

### 2. 需求润色 (polishRequirement)

优化需求描述，消除歧义、补充要素、统一术语。

**函数签名:**
```typescript
function polishRequirement(
  requirement: string,
  context?: { industry?: string; domain?: string }
): PolishedRequirement
```

**参数:**
- `requirement`: 原始需求描述
- `context`: 上下文信息（可选）

**返回值:**
```typescript
interface PolishedRequirement {
  original: string;           // 原始需求
  polished: string;           // 润色后的需求
  changes: RequirementChange[]; // 修改说明
  improvementScore: number;   // 质量提升评分
}
```

**使用示例:**
```typescript
const requirement = '系统应该快速响应用户请求';
const result = polishRequirement(requirement);

console.log(result.polished); 
// "系统在 2 秒内响应用户请求 [需要补充：谁需要使用这个功能？]"
```

---

### 3. 智能拆分 (splitRequirement)

基于功能/角色/流程自动拆分大需求。

**函数签名:**
```typescript
function splitRequirement(
  requirement: string,
  dimension?: 'functional' | 'role' | 'process'
): SubRequirement[]
```

**参数:**
- `requirement`: 原始需求描述
- `dimension`: 拆分维度（可选，默认自动检测）

**返回值:**
```typescript
interface SubRequirement {
  id: string;              // 子需求 ID
  title: string;           // 标题
  description: string;     // 描述
  dimension: string;       // 拆分维度
  dependencies: string[];  // 依赖关系
  investCheck: INVESTCheck; // INVEST 原则检查
}
```

**使用示例:**
```typescript
const requirement = '用户管理系统需要支持注册、登录、个人信息管理';
const splits = splitRequirement(requirement, 'functional');

splits.forEach(sub => {
  console.log(sub.title);
  console.log(sub.investCheck.overall); // 是否满足 INVEST 原则
});
```

---

### 4. 优先级推荐 (recommendPriority)

基于 MoSCoW 法则推荐需求优先级。

**函数签名:**
```typescript
function recommendPriority(
  requirements: Array<{ id: string; description: string }>
): PriorityRecommendation[]
```

**参数:**
- `requirements`: 需求列表

**返回值:**
```typescript
interface PriorityRecommendation {
  requirementId: string;      // 需求 ID
  description: string;        // 需求描述
  moscowPriority: string;     // MoSCoW 优先级 (must/should/could/wont)
  businessValue: number;      // 业务价值评分 (1-10)
  implementationCost: number; // 实现成本评分 (1-10)
  riskLevel: number;          // 风险等级评分 (1-10)
  dependencies: string[];     // 依赖关系
  rationale: string;          // 优先级理由
  recommendedOrder: number;   // 推荐排序
}
```

**使用示例:**
```typescript
const requirements = [
  { id: 'req-1', description: '用户登录功能' },
  { id: 'req-2', description: '深色主题切换' },
];

const recommendations = recommendPriority(requirements);

recommendations.forEach(rec => {
  console.log(`${rec.description}: ${rec.moscowPriority.toUpperCase()}`);
});
```

---

### 5. 用户故事生成 (generateUserStories)

将需求转化为用户故事格式。

**函数签名:**
```typescript
function generateUserStories(
  requirement: string,
  sourceRequirementId?: string
): UserStory[]
```

**参数:**
- `requirement`: 需求描述
- `sourceRequirementId`: 来源需求 ID（可选）

**返回值:**
```typescript
interface UserStory {
  id: string;                    // 故事 ID
  role: string;                  // 角色
  feature: string;               // 功能
  value: string;                 // 价值
  fullStory: string;             // 完整描述
  acceptanceCriteria: string[];  // 验收标准
  sourceRequirementId?: string;  // 来源需求 ID
}
```

**使用示例:**
```typescript
const requirement = '电商平台需要商品搜索功能，以便用户快速找到商品';
const stories = generateUserStories(requirement);

stories.forEach(story => {
  console.log(story.fullStory);
  // "作为 [角色]，我想要 [功能]，以便 [价值]"
});
```

---

### 6. 完整性评估 (assessCompleteness)

评估需求的完整性（基于 5W2H 维度）。

**函数签名:**
```typescript
function assessCompleteness(requirement: string): {
  score: number;
  dimensions: Record<string, boolean>;
  suggestions: string[];
}
```

**返回值:**
- `score`: 完整性评分 (0-100)
- `dimensions`: 各维度检查状态 (who/what/when/where/why/how/how_much)
- `suggestions`: 改进建议

**使用示例:**
```typescript
const requirement = '系统需要支持用户注册';
const result = assessCompleteness(requirement);

console.log(result.score); // 例如：57
console.log(result.dimensions.who); // false - 缺失"谁"要素
console.log(result.suggestions); // ['谁需要使用这个功能？', ...]
```

---

### 7. 风险预警 (identifyRisks)

识别需求中的潜在风险。

**函数签名:**
```typescript
function identifyRisks(requirement: string): Array<{
  type: 'ambiguity' | 'conflict' | 'infeasible' | 'dependency';
  level: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
}>
```

**使用示例:**
```typescript
const requirement = '系统需要立即响应，实现零延迟';
const risks = identifyRisks(requirement);

risks.forEach(risk => {
  console.log(`[${risk.level}] ${risk.type}: ${risk.description}`);
});
```

---

### 8. 依赖发现 (discoverDependencies)

自动发现需求的依赖关系。

**函数签名:**
```typescript
function discoverDependencies(requirement: string): Array<{
  type: 'external_system' | 'data_source' | 'prerequisite' | 'resource';
  description: string;
  criticality: 'high' | 'medium' | 'low';
}>
```

**使用示例:**
```typescript
const requirement = '需要集成短信 API，先验证手机号再注册';
const deps = discoverDependencies(requirement);

deps.forEach(dep => {
  console.log(`${dep.type}: ${dep.description}`);
});
```

---

## 模糊词汇词典

系统内置了以下类型的模糊词汇检测：

### 主观词汇
- 快速、迅速、及时
- 友好、美观、好用
- 简单、灵活、强大

### 不确定词汇
- 可能、大概、应该
- 也许、或许、基本上
- 几乎、差不多、大约

### 缺失量化指标
- 多、少、高、低
- 大、小、经常、偶尔
- 定期

---

## 5W2H 要素检查

系统会检查以下要素是否完整：

| 要素 | 说明 | 检查关键词 |
|------|------|------------|
| Who | 谁使用 | 用户、管理员、角色 |
| What | 什么功能 | 功能、需求、系统 |
| When | 时间 | 时间、时候、之前 |
| Where | 地点 | 地方、位置、场景 |
| Why | 原因 | 为了、以便、目的是 |
| How | 方式 | 如何、怎么、方式 |
| How much | 数量 | 多少、数量、规模 |

---

## INVEST 原则检查

智能拆分时会检查每个子需求是否满足 INVEST 原则：

- **I**ndependent: 独立的
- **N**egotiable: 可协商的
- **V**aluable: 有价值的
- **E**stimable: 可估算的
- **S**mall: 短小的
- **T**estable: 可测试的

---

## MoSCoW 优先级法则

| 优先级 | 说明 | 评分范围 |
|--------|------|----------|
| Must | 必须有 | 8-10 |
| Should | 应该有 | 6-7 |
| Could | 可以有 | 4-5 |
| Won't | 暂不需要 | 0-3 |

---

## 完整工作流程示例

```typescript
import {
  detectAmbiguity,
  polishRequirement,
  splitRequirement,
  recommendPriority,
  generateUserStories,
  assessCompleteness,
  identifyRisks,
} from './ai-enhancement';

// 1. 原始需求
const original = '我们需要一个快速友好的用户管理系统';

// 2. 歧义检测
const ambiguity = detectAmbiguity(original);
console.log(`完整性：${ambiguity.completenessScore}%`);

// 3. 需求润色
const polished = polishRequirement(original);
console.log(polished.polished);

// 4. 风险评估
const risks = identifyRisks(polished.polished);

// 5. 需求拆分
const splits = splitRequirement(polished.polished, 'functional');

// 6. 用户故事生成
const stories = generateUserStories(splits[0].description);

// 7. 优先级推荐
const priorities = recommendPriority(
  splits.map(s => ({ id: s.id, description: s.description }))
);
```

---

## 使用示例文件

完整的示例代码请参考：
- `ai-enhancement.example.ts` - 包含所有功能的使用示例

---

## 注意事项

1. **模糊词汇检测**: 系统使用内置词典检测模糊词汇，建议根据具体业务场景扩展词典
2. **拆分算法**: 当前使用基于关键词的简单拆分，复杂场景建议结合 NLP 技术
3. **优先级算法**: 评分算法可根据项目特点调整权重
4. **用户故事**: 自动生成的用户故事建议人工审核和完善

---

## 扩展建议

1. **行业术语库**: 添加特定行业的术语和最佳实践
2. **机器学习**: 使用历史数据训练更准确的拆分和优先级模型
3. **可视化**: 集成需求图谱可视化功能
4. **协作功能**: 支持多人协作评审和批注

---

## 相关文件

- `ai-enhancement.ts` - 核心实现
- `ai-enhancement.example.ts` - 使用示例
- `../.trae/specs/enhance-requirement-skill/spec.md` - 需求规格说明
