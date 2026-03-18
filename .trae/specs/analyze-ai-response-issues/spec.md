# AI 回答合理性分析 Spec

## Why

在审核 admin 用户的对话日志时，发现 AI 回答存在不合理的情况：
1. **用户问"你用的是什么模型？"** - AI 没有直接回答，而是引导用户补充需求信息
2. **用户问"你是什么模型？"** - AI 同样没有回答，而是将其当作需求来处理
3. **用户问"你有模型吗"** - AI 还是当作需求处理

**问题**：AI 将简单的问答问题错误地识别为"需求描述"，导致回答不符合用户预期。

---

## What Changes

### 问题根因分析

**现象**：
- 用户提问："你用的是什么模型？"
- AI 回答："为了更好地理解您的需求，请告诉我：1. 目标用户..."
- 用户期望：获得关于 AI 模型的直接回答
- 实际结果：被当作需求分析请求处理

**根因**：

1. **意图识别缺失**
   - 当前系统没有意图识别模块
   - 所有用户输入都被当作"需求描述"处理
   - 无法区分"问答"和"需求分析"两种不同的意图

2. **skillService 设计问题**
   - `streamResponse` 方法默认所有消息都是需求分析
   - 没有前置的意图判断逻辑
   - 直接调用需求收敛技能或 AI API

3. **AI API 调用策略问题**
   - 调用大模型时没有明确的系统提示词（system prompt）
   - 没有定义 AI 的角色和行为准则
   - 导致 AI 无法正确处理简单问答

### 解决方案

**方案 A：添加意图识别层（推荐）**

在消息处理流程中添加意图识别：
1. **问答意图**：直接调用 AI API 回答
2. **需求分析意图**：调用需求收敛技能
3. **闲聊意图**：调用轻量级对话模型

**方案 B：优化系统提示词（快速修复）**

在调用 AI API 时添加明确的系统提示词：
- 定义 AI 的角色（需求分析助手）
- 说明何时应该直接回答，何时需要引导
- 处理常见问答场景

**方案 C：混合方案（最佳实践）**

结合方案 A 和 B：
1. 添加简单的意图识别
2. 优化系统提示词
3. 提供降级处理

---

## Impact

### Affected Specs
- 需求收敛技能规格
- AI 对话能力规格
- 意图识别能力规格（新增）

### Affected Code
**后端**：
- `d:\DFX\Code\AIbisai-wangzhan\ai-contest-web\server\services\skillService.js` - 添加意图识别
- `d:\DFX\Code\AIbisai-wangzhan\ai-contest-web\server\routes\message.js` - 修改 chat 接口
- `d:\DFX\Code\AIbisai-wangzhan\ai-contest-web\server\config\skill.js` - 添加系统提示词配置

**前端**：
- 无影响（后端逻辑变更）

---

## ADDED Requirements

### Requirement: 意图识别能力
The system SHALL 能够识别用户输入的意图类型：

#### Scenario: 用户提问
- **WHEN** 用户输入包含疑问词（什么、为什么、如何等）
- **THEN** 识别为问答意图
- **SUCCESS CRITERIA**：
  - AI 直接回答问题
  - 不进行需求分析引导
  - 回答准确、简洁

#### Scenario: 用户描述需求
- **WHEN** 用户输入包含"我要做"、"我想"、"需要"等关键词
- **THEN** 识别为需求分析意图
- **SUCCESS CRITERIA**：
  - 启动需求收敛技能
  - 进行完整性评估
  - 提供引导性问题

#### Scenario: 用户闲聊
- **WHEN** 用户输入不包含明确意图
- **THEN** 识别为闲聊意图
- **SUCCESS CRITERIA**：
  - 友好回应
  - 引导用户说明具体需求

---

### Requirement: 系统提示词优化
The system SHALL 在调用 AI API 时提供明确的系统提示词：

#### Scenario: 初始化对话
- **WHEN** 调用 AI API
- **THEN** 包含系统提示词定义角色和行为准则
- **SUCCESS CRITERIA**：
  - AI 理解自己的角色（需求分析助手）
  - 能够区分问答和需求分析
  - 回答符合角色定位

---

## MODIFIED Requirements

### Requirement: 消息处理流程（原 chat 接口）
**修改前**：所有消息都调用需求收敛技能  
**修改后**：先进行意图识别，再根据意图类型调用不同的处理逻辑

---

## REMOVED Requirements
无

---

## 技术方案设计

### 当前架构问题

```
用户输入 → message.js/chat → skillService.streamResponse → 需求收敛技能/AI API
                                    ↓
                            所有消息都当作需求分析
```

### 优化后架构

```
用户输入 → message.js/chat → 意图识别
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
              问答意图        需求分析意图       闲聊意图
                    ↓               ↓               ↓
              AI API 回答    需求收敛技能      轻量对话模型
```

### 实施步骤

#### Step 1: 添加意图识别函数

```javascript
// services/intentRecognizer.js
const INTENT_PATTERNS = {
  QA: [
    /什么 (模型 | 技术 | 功能|AI)/,
    /为什么/,
    /如何 | 怎么/,
    /是谁/,
    /哪里 | 何处/,
    /何时 | 什么时候/,
    /多少 | 几个/
  ],
  REQUIREMENT: [
    /我要做/,
    /我想 (做 | 实现|开发)/,
    /需要 (一个 | 个)/,
    /设计 (一个 | 个)/,
    /开发 (一个 | 个)/
  ]
};

function recognizeIntent(input) {
  // 问答意图
  for (const pattern of INTENT_PATTERNS.QA) {
    if (pattern.test(input)) {
      return { type: 'QA', confidence: 0.9 };
    }
  }
  
  // 需求分析意图
  for (const pattern of INTENT_PATTERNS.REQUIREMENT) {
    if (pattern.test(input)) {
      return { type: 'REQUIREMENT', confidence: 0.9 };
    }
  }
  
  // 默认为闲聊
  return { type: 'CHAT', confidence: 0.5 };
}
```

#### Step 2: 修改 skillService.js

```javascript
import intentRecognizer from './intentRecognizer.js';

async function streamResponse(input, history) {
  // 识别意图
  const intent = intentRecognizer.recognizeIntent(input);
  
  switch (intent.type) {
    case 'QA':
      yield* handleQA(input, history);
      break;
    case 'REQUIREMENT':
      yield* handleRequirement(input, history);
      break;
    case 'CHAT':
      yield* handleChat(input, history);
      break;
  }
}

async function* handleQA(input, history) {
  // 直接调用 AI API 回答
  const response = await callChatAPI(input, history, {
    systemPrompt: '你是一个专业的需求分析助手。当用户提问时，请直接、简洁地回答问题。'
  });
  yield { type: 'chunk', content: response };
}

async function* handleRequirement(input, history) {
  // 调用需求收敛技能
  // ... 现有逻辑
}

async function* handleChat(input, history) {
  // 轻量对话处理
  const response = await callChatAPI(input, history, {
    systemPrompt: '你是一个友好的需求分析助手。与用户友好交流，并引导他们说明具体需求。'
  });
  yield { type: 'chunk', content: response };
}
```

#### Step 3: 优化系统提示词

```javascript
// config/skill.js
export const SYSTEM_PROMPTS = {
  QA: `你是一个专业的需求分析助手。当用户提问时：
1. 直接、简洁地回答问题
2. 不要进行需求分析
3. 不要提供引导性问题
4. 保持回答准确、专业`,

  REQUIREMENT: `你是一个专业的需求分析助手。当用户描述需求时：
1. 进行完整性评估（5W2H 框架）
2. 识别潜在风险
3. 发现依赖关系
4. 提供引导性问题帮助用户完善需求`,

  CHAT: `你是一个友好的需求分析助手。与用户交流时：
1. 友好、自然地回应
2. 适时引导用户说明具体需求
3. 不要过于机械`
};
```

---

## 关键指标（KPI）

| 指标 | 当前 | 目标 | 测量方式 |
|------|------|------|----------|
| 问答意图识别准确率 | 0% | >90% | 测试用例统计 |
| 需求意图识别准确率 | 100% | >95% | 测试用例统计 |
| 用户满意度 | 低 | >80% | 用户反馈 |
| 回答合理性 | 差 | 良好 | 人工审核 |

---

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 意图识别错误 | 中 | 中 | 提供手动切换功能 |
| 误判率为零 | 低 | 高 | 设置置信度阈值，低于阈值时询问用户 |
| 性能下降 | 低 | 低 | 意图识别逻辑轻量，影响可忽略 |

---

## 验收标准

### 验收测试 1: 问答意图
```
GIVEN 用户输入"你用的是什么模型？"
WHEN 系统处理消息
THEN 识别为问答意图
AND AI 直接回答模型信息
AND 不进行需求分析引导
```

### 验收测试 2: 需求意图
```
GIVEN 用户输入"我要做合同审查功能"
WHEN 系统处理消息
THEN 识别为需求意图
AND 启动需求收敛技能
AND 提供完整性评估和引导性问题
```

### 验收测试 3: 闲聊意图
```
GIVEN 用户输入"你好"
WHEN 系统处理消息
THEN 识别为闲聊意图
AND AI 友好回应
AND 适度引导用户说明需求
```

---

**Spec 版本**: v1.0  
**创建日期**: 2026-03-18  
**状态**: 待审批
