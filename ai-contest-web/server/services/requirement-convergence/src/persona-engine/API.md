# 人格化交互模块 API 文档

## 目录结构

```
persona-engine/
├── index.ts                 # 统一导出文件
├── persona-manager.ts       # 角色切换机制
├── context-memory.ts        # 上下文记忆系统
├── proactive-notifier.ts    # 主动提醒引擎
├── learning-engine.ts       # 学习进化算法
└── examples.ts              # 使用示例
```

## 快速开始

### 1. 基础使用（推荐）

```typescript
import { PersonaEngine } from './persona-engine';

// 获取引擎实例
const engine = PersonaEngine.getInstance();

// 初始化
engine.initialize('user_123', {
  storagePath: './data/memory',
  enableNotifications: true,
  enableLearning: true,
});

// 使用角色管理器
engine.personaManager.switchPersona(PersonaType.ANALYST);

// 使用记忆系统
engine.contextMemory.storeMemory(
  MemoryType.USER_PREFERENCE,
  'key',
  { preference: 'value' }
);

// 导出/导入状态
const state = engine.exportState();
engine.importState(state);
```

### 2. 独立使用各模块

```typescript
import {
  PersonaManager,
  ContextMemoryManager,
  ProactiveNotifier,
  LearningEngine,
} from './persona-engine';

// 各模块都是单例，可独立使用
const personaManager = PersonaManager.getInstance();
const contextMemory = ContextMemoryManager.getInstance();
const notifier = ProactiveNotifier.getInstance();
const learningEngine = LearningEngine.getInstance();
```

---

## 子模块 1: 角色管理器 (PersonaManager)

### 角色类型

- **ANALYST** - 严谨分析师：结构化、逻辑严密、注重细节
- **FACILITATOR** - 创意引导者：发散思维、头脑风暴、激发灵感
- **CHALLENGER** - 质疑者：挑战假设、发现漏洞、风险评估
- **COORDINATOR** - 协调者：平衡各方、促进共识、求同存异

### API

#### switchPersona(personaType, reason?)

切换角色

```typescript
personaManager.switchPersona(PersonaType.ANALYST, '开始需求分析');
```

#### getCurrentPersonaConfig()

获取当前角色配置

```typescript
const config = personaManager.getCurrentPersonaConfig();
console.log(config.name);      // '严谨分析师'
console.log(config.style.tone); // '专业、严谨、客观'
```

#### generateResponse(template, context?)

生成符合角色风格的回应

```typescript
const response = personaManager.generateResponse(
  '我们需要分析 {topic} 的 {aspect} 个方面',
  { topic: '用户注册', aspect: 3 }
);
```

#### recommendPersona(scene)

根据场景推荐角色

```typescript
const persona = personaManager.recommendPersona('需要头脑风暴');
// 返回：PersonaType.FACILITATOR
```

#### addConversationHistory(message)

添加对话历史

```typescript
personaManager.addConversationHistory('用户提出了新需求');
```

#### getConversationHistory(limit?)

获取对话历史

```typescript
const history = personaManager.getConversationHistory(10);
```

#### setOnPersonaChange(callback)

设置角色切换回调

```typescript
personaManager.setOnPersonaChange((context) => {
  console.log('角色已切换:', context.currentPersona);
});
```

#### exportState() / importState(state)

导出/导入状态

```typescript
const state = personaManager.exportState();
personaManager.importState(state);
```

---

## 子模块 2: 上下文记忆系统 (ContextMemoryManager)

### 记忆类型

- **USER_PREFERENCE** - 用户偏好（提问风格、文档格式）
- **HISTORICAL_DECISION** - 历史决策（需求变更、优先级选择）
- **TERMINOLOGY** - 常用术语（业务术语、技术术语）
- **PROJECT_CONTEXT** - 项目背景（业务目标、约束条件）

### API

#### initialize(userId, storagePath?)

初始化记忆管理器

```typescript
contextMemory.initialize('user_123', './data/memory');
```

#### storeMemory(type, key, value, tags?, confidence?)

存储记忆

```typescript
contextMemory.storeMemory(
  MemoryType.USER_PREFERENCE,
  'preferences',
  { questionStyle: 'open', documentFormat: 'detailed' },
  ['preference'],
  0.9
);
```

#### retrieveMemories(query)

检索记忆

```typescript
const memories = contextMemory.retrieveMemories({
  type: MemoryType.USER_PREFERENCE,
  tags: ['preference'],
  limit: 10,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
});
```

#### updateUserPreferences(prefs)

更新用户偏好

```typescript
contextMemory.updateUserPreferences({
  questionStyle: 'open',
  documentFormat: 'detailed',
  interactionStyle: 'formal',
});
```

#### getUserPreferences()

获取用户偏好

```typescript
const prefs = contextMemory.getUserPreferences();
```

#### storeDecision(decision)

存储历史决策

```typescript
contextMemory.storeDecision({
  decision: '采用敏捷开发',
  reason: '需求变化快',
  priority: 'high',
  decisionDate: new Date(),
});
```

#### retrieveDecisions(limit?)

检索历史决策

```typescript
const decisions = contextMemory.retrieveDecisions(5);
```

#### storeTerm(term)

存储术语

```typescript
contextMemory.storeTerm({
  term: '需求收敛',
  definition: '将模糊需求明确化',
  termType: 'business',
  relatedTerms: ['需求分析'],
});
```

#### retrieveTerms(termType?)

检索术语

```typescript
const terms = contextMemory.retrieveTerms('business');
```

#### findRelatedTerms(term, maxDepth?)

查找相关术语

```typescript
const related = contextMemory.findRelatedTerms('需求收敛', 2);
```

#### storeProjectContext(context)

存储项目背景

```typescript
contextMemory.storeProjectContext({
  businessGoals: ['提升用户体验'],
  constraints: ['预算有限'],
  stakeholders: ['产品部', '技术部'],
});
```

#### getProjectContext()

获取项目背景

```typescript
const context = contextMemory.getProjectContext();
```

#### reinforceMemory(memoryId, increment?)

增强记忆（增加置信度）

```typescript
contextMemory.reinforceMemory('memory_id', 0.05);
```

#### weakenMemory(memoryId, decrement?)

减弱记忆（减少置信度）

```typescript
contextMemory.weakenMemory('memory_id', 0.05);
```

#### getMemoryStats()

获取记忆统计

```typescript
const stats = contextMemory.getMemoryStats();
// { totalMemories: 10, byType: {...}, avgConfidence: 0.85 }
```

#### exportMemories() / importMemories(data)

导出/导入记忆

```typescript
const memories = contextMemory.exportMemories();
contextMemory.importMemories(memories);
```

---

## 子模块 3: 主动提醒引擎 (ProactiveNotifier)

### 提醒类型

- **CLARIFICATION_NEEDED** - 需求待澄清（超过 24 小时未响应）
- **REVIEW_DEADLINE** - 评审节点临近（提前 1 天）
- **CHANGE_IMPACT** - 变更影响（依赖需求被修改）
- **MILESTONE_REACHED** - 里程碑达成（需求定稿、评审通过）

### 提醒优先级

- **URGENT** - 紧急
- **HIGH** - 高
- **MEDIUM** - 中
- **LOW** - 低

### API

#### initialize(config?)

初始化提醒引擎

```typescript
notifier.initialize({
  clarificationCheckInterval: 24,    // 24 小时
  reviewAdvanceNoticeDays: 1,        // 提前 1 天
  changeImpactCheckInterval: 12,     // 12 小时
  reminderExpirationDays: 7,         // 7 天过期
  enabled: true,
});
```

#### onReminder(type, callback)

注册提醒回调

```typescript
notifier.onReminder(ReminderType.CLARIFICATION_NEEDED, (reminder) => {
  console.log('收到澄清提醒:', reminder.title);
});
```

#### setOnGlobalReminder(callback)

设置全局提醒回调

```typescript
notifier.setOnGlobalReminder((reminder) => {
  console.log('全局提醒:', reminder.message);
});
```

#### createReminder(type, title, message, priority?, relatedEntities?, actions?)

创建提醒

```typescript
notifier.createReminder(
  ReminderType.CLARIFICATION_NEEDED,
  '需求待澄清',
  '需求 req_001 已超过 24 小时未响应',
  ReminderPriority.HIGH,
  ['req_001'],
  [
    {
      label: '立即处理',
      actionType: 'navigate',
      payload: { requirementId: 'req_001' },
    },
  ]
);
```

#### checkClarificationNeeded(requirementId, lastUpdateTime, clarificationNeeded)

检查需求待澄清

```typescript
const reminder = notifier.checkClarificationNeeded(
  'req_001',
  new Date(Date.now() - 25 * 60 * 60 * 1000),
  true
);
```

#### checkReviewDeadline(reviewId, reviewDate)

检查评审节点临近

```typescript
const reminder = notifier.checkReviewDeadline(
  'review_001',
  new Date(Date.now() + 12 * 60 * 60 * 1000)
);
```

#### checkChangeImpact(requirementId, changeDescription, impactedRequirements)

检查变更影响

```typescript
const reminder = notifier.checkChangeImpact(
  'req_001',
  '修改了登录流程',
  ['req_002', 'req_003']
);
```

#### checkMilestoneReached(milestoneName, description, achievedAt)

检查里程碑达成

```typescript
const reminder = notifier.checkMilestoneReached(
  '需求定稿',
  '所有需求已完成评审',
  new Date()
);
```

#### getPendingReminders(type?)

获取待处理的提醒

```typescript
const pending = notifier.getPendingReminders();
```

#### acknowledgeReminder(reminderId)

确认提醒

```typescript
notifier.acknowledgeReminder('reminder_id');
```

#### dismissReminder(reminderId)

取消提醒

```typescript
notifier.dismissReminder('reminder_id');
```

#### sendReminder(reminderId)

发送提醒

```typescript
await notifier.sendReminder('reminder_id');
```

#### getReminderStats()

获取提醒统计

```typescript
const stats = notifier.getReminderStats();
```

#### updateConfig(config)

更新配置

```typescript
notifier.updateConfig({
  clarificationCheckInterval: 48,
});
```

#### cleanupExpiredReminders()

清理过期提醒

```typescript
notifier.cleanupExpiredReminders();
```

#### exportState() / importState(data)

导出/导入状态

```typescript
const state = notifier.exportState();
notifier.importState(state);
```

---

## 子模块 4: 学习进化引擎 (LearningEngine)

### 学习类型

- **QUESTION_PREFERENCE** - 用户提问偏好（开放式/封闭式）
- **DOCUMENT_STYLE** - 文档风格偏好（详细/简洁）
- **REQUIREMENT_TYPE_FREQUENCY** - 需求类型频率
- **RECOMMENDATION_ACCEPTANCE** - 推荐采纳率
- **INTERACTION_PATTERN** - 交互模式

### API

#### initialize(userId, config?)

初始化学习引擎

```typescript
learningEngine.initialize('user_123', {
  learningRate: 0.1,
  decayFactor: 0.95,
  minSampleSize: 5,
  confidenceThreshold: 0.7,
  enableOnlineLearning: true,
  enableBatchLearning: true,
});
```

#### recordInteraction(interactionType, data)

记录用户交互

```typescript
// 记录问题偏好
learningEngine.recordInteraction('question', {
  isOpen: true,
  category: 'requirement',
});

// 记录文档风格
learningEngine.recordInteraction('document_interaction', {
  detailLevel: 'detailed',
  structureLevel: 'structured',
  technicalLevel: 0.8,
});

// 记录需求类型
learningEngine.recordInteraction('requirement', {
  type: '功能需求',
});
```

#### generateRecommendations(context, limit?)

生成推荐

```typescript
const recommendations = learningEngine.generateRecommendations(
  {
    suggestQuestions: true,
    generateDocument: true,
    suggestRequirements: true,
  },
  5
);
```

#### recordFeedback(recommendationId, feedback)

记录反馈

```typescript
learningEngine.recordFeedback('rec_id', {
  accepted: true,
  rating: 5,
  comment: '很有帮助',
  timestamp: new Date(),
});
```

#### getUserProfile()

获取用户画像

```typescript
const profile = learningEngine.getUserProfile();
console.log(profile.questionPreference); // 提问偏好
console.log(profile.documentStyle);      // 文档风格
console.log(profile.frequentRequirementTypes); // 高频需求类型
```

#### updateUserProfile(updates)

更新用户画像

```typescript
learningEngine.updateUserProfile({
  documentStyle: {
    detailLevel: 'detailed',
  },
});
```

#### getLearningRecords(type?, limit?)

获取学习记录

```typescript
const records = learningEngine.getLearningRecords(
  LearningType.QUESTION_PREFERENCE,
  5
);
```

#### getRecommendationStats()

获取推荐统计

```typescript
const stats = learningEngine.getRecommendationStats();
// { total: 10, acceptanceRate: 0.8, byType: {...} }
```

#### applyDecay()

应用衰减（定期执行，如每周）

```typescript
learningEngine.applyDecay();
```

#### exportState() / importState(state)

导出/导入状态

```typescript
const state = learningEngine.exportState();
learningEngine.importState(state);
```

---

## 数据类型定义

### UserPreference

```typescript
interface UserPreference {
  questionStyle: 'open' | 'closed' | 'mixed';
  documentFormat: 'detailed' | 'concise' | 'template';
  interactionStyle: 'formal' | 'casual' | 'adaptive';
  responseDetailLevel: 'brief' | 'standard' | 'comprehensive';
  customPreferences: Record<string, any>;
}
```

### HistoricalDecision

```typescript
interface HistoricalDecision {
  decision: string;
  reason: string;
  changeReason?: string;
  priority?: 'high' | 'medium' | 'low';
  requirementIds?: string[];
  decisionDate: Date;
}
```

### TermDefinition

```typescript
interface TermDefinition {
  term: string;
  definition: string;
  termType: 'business' | 'technical';
  relatedTerms?: string[];
  usageContext?: string;
}
```

### ProjectContext

```typescript
interface ProjectContext {
  businessGoals: string[];
  constraints: string[];
  stakeholders: string[];
  timeline?: {
    startDate?: Date;
    endDate?: Date;
    milestones?: Array<{ name: string; date: Date }>;
  };
  scale?: 'small' | 'medium' | 'large' | 'enterprise';
}
```

### UserProfile

```typescript
interface UserProfile {
  userId: string;
  questionPreference: {
    openRatio: number;
    closedRatio: number;
    preferredType: 'open' | 'closed' | 'balanced';
  };
  documentStyle: {
    detailLevel: 'brief' | 'standard' | 'detailed';
    structureLevel: 'free' | 'semi' | 'structured';
    technicalLevel: number;
  };
  frequentRequirementTypes: string[];
  interactionTimePreference?: {
    preferredHours: number[];
    timezone?: string;
  };
}
```

### Reminder

```typescript
interface Reminder {
  id: string;
  type: ReminderType;
  priority: ReminderPriority;
  status: ReminderStatus;
  title: string;
  message: string;
  metadata: {
    createdAt: Date;
    scheduledAt?: Date;
    sentAt?: Date;
    acknowledgedAt?: Date;
    expiresAt?: Date;
    relatedEntities?: string[];
  };
  actions?: ReminderAction[];
}
```

### Recommendation

```typescript
interface Recommendation {
  id: string;
  type: string;
  content: any;
  score: number;
  reason: string;
  metadata: {
    createdAt: Date;
    source?: string;
    tags?: string[];
  };
}
```

---

## 最佳实践

### 1. 初始化时机

在应用启动时初始化引擎：

```typescript
// app.ts
const engine = PersonaEngine.getInstance();
engine.initialize(userId, {
  storagePath: './data',
  enableNotifications: true,
  enableLearning: true,
});
```

### 2. 状态持久化

定期保存状态，支持跨会话：

```typescript
// 会话结束时
const state = engine.exportState();
localStorage.setItem('persona_engine_state', JSON.stringify(state));

// 应用启动时
const saved = localStorage.getItem('persona_engine_state');
if (saved) {
  engine.importState(JSON.parse(saved));
}
```

### 3. 反馈循环

记录用户对推荐的反馈，持续优化：

```typescript
// 用户接受推荐
learningEngine.recordFeedback(recommendationId, {
  accepted: true,
  rating: 5,
  timestamp: new Date(),
});

// 用户拒绝推荐
learningEngine.recordFeedback(recommendationId, {
  accepted: false,
  rating: 2,
  comment: '不相关',
  timestamp: new Date(),
});
```

### 4. 定期清理

定期清理过期数据：

```typescript
// 每天执行一次
setInterval(() => {
  notifier.cleanupExpiredReminders();
  learningEngine.applyDecay();
}, 24 * 60 * 60 * 1000);
```

### 5. 角色自动切换

根据场景自动切换角色：

```typescript
// 检测用户意图
if (userInput.includes('分析') || userInput.includes('评估')) {
  personaManager.switchPersona(PersonaType.ANALYST);
} else if (userInput.includes('创意') || userInput.includes('头脑风暴')) {
  personaManager.switchPersona(PersonaType.FACILITATOR);
} else if (userInput.includes('风险') || userInput.includes('问题')) {
  personaManager.switchPersona(PersonaType.CHALLENGER);
} else if (userInput.includes('协调') || userInput.includes('共识')) {
  personaManager.switchPersona(PersonaType.COORDINATOR);
}
```

---

## 常见问题

### Q: 如何重置所有数据？

```typescript
engine.clearAll();
```

### Q: 如何禁用某个子模块？

```typescript
engine.initialize('user_123', {
  enableNotifications: false, // 禁用提醒
  enableLearning: false,      // 禁用学习
});
```

### Q: 如何获取所有提醒？

```typescript
const allReminders = notifier.getAllReminders();
const pendingReminders = notifier.getPendingReminders();
```

### Q: 如何更新用户偏好？

```typescript
contextMemory.updateUserPreferences({
  questionStyle: 'open',
  documentFormat: 'detailed',
});
```

### Q: 如何获取记忆置信度？

```typescript
const stats = contextMemory.getMemoryStats();
console.log('平均置信度:', stats.avgConfidence);
```

---

## 更新日志

### v1.0.0

- 初始版本
- 实现角色切换机制
- 实现上下文记忆系统
- 实现主动提醒引擎
- 实现学习进化算法
