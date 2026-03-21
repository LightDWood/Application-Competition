# 会话核心服务重构规范

## Why

当前系统缺少对会话核心服务的统一架构设计，配置文件、Agent定义、Skill管理、制品存储等分散在不同位置，缺乏清晰的关系模型和生命周期管理。需要通过重构建立清晰的架构体系，支持多用户、多Agent、多模型灵活配置。

## What Changes

### 核心设计原则

1. **实体驱动**：所有业务概念均有明确实体定义
2. **服务自治**：每个服务有清晰职责和接口
3. **配置中心化**：配置统一管理，支持热更新
4. **关系显式化**：实体关系通过外键显式表达

### 数据模型重构

* 设计系统（System）实体，统一管理系统级配置和元数据

* 设计用户（User）实体，承载用户身份和会话上下文

* 设计Agent实体，包含基本定义（Capability）、身份记录（ Soul）

* 设计Skill实体，支持可配置的技能调用

* 设计制品（Artifact）实体，存储会话过程中的生成物

* 设计会话（Session）实体，管理一次完整的对话上下文

* 设计消息（Message）实体，记录会话中的单条消息

### 关系建模

| 关系               | 描述                     | 基数  |
| ---------------- | ---------------------- | --- |
| System-User      | 一个System可对应多个User      | 1:N |
| System-Agent     | 一个System可对应多种Agent     | 1:N |
| User-Agent       | 一个User绑定一个Agent（可切换）   | N:1 |
| Agent-Skill      | 一个Agent可调用多种Skill      | N:M |
| Session-User     | 一个Session属于一个User      | N:1 |
| Session-Agent    | 一个Session由一个Agent处理    | N:1 |
| Session-Message  | 一个Session包含多条Message   | 1:N |
| Session-Artifact | 一个Session可产生多个Artifact | 1:N |

**关键约束**：

* 所有用户初期共用一个默认Agent（后期可切换）

* 一个Agent对应一种User类型profile，不是对应单个User文件

* 每次会话都可能产生制品文件

### 服务模块划分

| 服务              | 职责                      | 核心接口                                      |
| --------------- | ----------------------- | ----------------------------------------- |
| ConfigService   | 模型API配置、系统配置、Provider注册 | loadConfig, getProvider, registerProvider |
| AgentService    | Agent生命周期管理、实例化         | getAgent, createAgent, updateSoul         |
| SessionService  | 会话创建、消息流转、上下文管理         | createSession, sendMessage, getHistory    |
| SkillService    | Skill加载、调用、结果处理         | loadSkill, executeSkill, listSkills       |
| ArtifactService | 制品存储、检索、生命周期管理          | saveArtifact, getArtifact, deleteArtifact |
| RouterService   | API路由、消息路由、Provider选择         | routeAPI, routeMessage, selectProviderForModel |
| UserService     | 用户管理、偏好设置              | getUser, updateUser, getPreferences       |

### 文件结构规范

```
{workspace}/
├── config/
│   ├── system.yaml              # 系统配置
│   ├── providers.yaml          # 模型Provider配置（参考OpenClaw）
│   └── agents/
│       └── {agent-id}/
│           ├── capability.yaml  # Agent能力定义
│           ├── soul.yaml       # Agent身份记录
│           └── skills.yaml     # Agent关联的Skill列表
├── agents/
│   └── {agent-id}/
│       └── sessions/
│           └── {session-id}.jsonl  # 会话存储
├── skills/
│   └── {skill-id}/
│       ├── SKILL.md            # 技能说明和指令
│       ├── scripts/            # 可执行脚本
│       └── resources/         # 资源文件
├── users/
│   └── {user-id}/
│       ├── user.yaml           # 用户身份记录
│       └── preferences.yaml     # 用户偏好设置
└── artifacts/
    └── {session-id}/
        └── {artifact-id}.*     # 制品文件
```

## Impact

### Affected Capabilities

* 多会话并发管理

* 多模型API路由（含Provider抽象和回退）

* Skill动态加载与调用

* 制品持久化与检索

* Agent切换机制

* 四层提示词合并

### Affected Code

* 会话服务核心模块

* Agent实例化逻辑

* 配置加载与管理

* Skill调用框架

* 制品存储服务

* API路由层

* 提示词构建器

## 接口设计

### ConfigService接口

```typescript
interface ConfigService {
  loadSystemConfig(): SystemConfig;
  getProvider(providerId: string): ModelProvider | null;
  listProviders(): ModelProvider[];
  getDefaultProvider(): ModelProvider;
  detectApiKeyFormat(apiKey: string): ApiKeyDetection;
  registerProvider(provider: ModelProvider): void;
  reloadConfig(): void;
}

interface ApiKeyDetection {
  provider: 'openai' | 'anthropic' | 'openrouter' | 'perplexity' | 'custom';
  baseUrl: string;
  modelPrefix?: string;
}
```

### AgentService接口

```typescript
interface AgentService {
  getAgent(agentId: string): Agent;
  listAgents(): Agent[];
  getDefaultAgent(): Agent;
  createAgent(agentId: string): Agent;
  updateSoul(agentId: string, soul: Soul): void;
  bindUserToAgent(userId: string, agentId: string): void;
  getAgentForUser(userId: string): Agent;
}
```

### SessionService接口

```typescript
interface SessionService {
  createSession(userId: string, agentId?: string): Session;
  sendMessage(sessionId: string, message: Message): Promise<SendMessageResult>;
  getSessionHistory(sessionId: string): Message[];
  getSession(sessionId: string): Session | null;
  deleteSession(sessionId: string): void;
  addMessage(sessionId: string, message: Message): void;
}

interface SendMessageResult {
  response: AssistantMessage;
  artifacts: Artifact[];
  routedTo?: {
    type: 'skill' | 'model';
    targetId: string;
  };
}

interface AssistantMessage {
  id: string;
  sessionId: string;
  role: 'assistant';
  content: MessageContent;
  modelId: string;
  providerId: string;
  artifacts: string[];
  createdAt: string;
}
```

### SkillService接口

```typescript
interface SkillService {
  loadSkill(skillId: string): Skill;
  listAgentSkills(agentId: string): Skill[];
  listAllSkills(): Skill[];
  executeSkill(skillId: string, context: SkillContext): Promise<SkillResult>;
  validateSkill(skillId: string): ValidationResult;
}

interface SkillContext {
  sessionId: string;
  userId: string;
  agentId: string;
  currentPrompt: string;
  artifacts: Artifact[];
  history: Message[];
}

interface SkillResult {
  success: boolean;
  output?: string;
  artifacts?: Artifact[];
  error?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface ValidationWarning {
  field: string;
  message: string;
}
```

### ArtifactService接口

```typescript
interface ArtifactService {
  saveArtifact(sessionId: string, artifact: Artifact): Promise<string>;
  getArtifact(artifactId: string): Artifact | null;
  listSessionArtifacts(sessionId: string): Artifact[];
  deleteArtifact(artifactId: string): boolean;
  updateArtifact(artifactId: string, artifact: Artifact): boolean;
  createSessionStorage(sessionId: string): Promise<void>;
  deleteSessionStorage(sessionId: string): Promise<void>;
}
```

### Artifact生命周期管理

```
会话创建流程中的Artifact处理：

1. SessionService.createSession(userId, agentId)
   │
   ├──► ArtifactService.createSessionStorage(sessionId)  // 创建目录
   │
   ├──► Session持久化初始化
   │
   └──► 返回Session对象

2. 会话过程中
   │
   └──► ArtifactService.saveArtifact(sessionId, artifact)
        │
        └──► 存储到 artifacts/{sessionId}/{artifactId}

3. 会话结束
   │
   └──► ArtifactService.deleteSessionStorage(sessionId)  // 可选：清理或保留
```

### 核心业务流程

#### 会话创建流程

```
用户发起新会话
    │
    ▼
SessionService.createSession(userId, agentId?)
    │
    ├──► 1. 获取用户信息 (UserService.getUser(userId))
    │       └──► 若用户未指定agentId，使用用户的默认agentId或系统默认agentId
    │
    ├──► 2. 获取Agent信息 (AgentService.getAgent(agentId))
    │       └──► 加载 capability.yaml, soul.yaml
    │
    ├──► 3. 确定Provider
    │       └──► 优先使用用户偏好中的defaultModelId
    │       └──► 否则使用Agent的defaultModelId
    │       └──► RouterService.selectProviderForModel(modelId)
    │
    ├──► 4. 创建Session对象
    │       ├── sessionId: 生成UUID
    │       ├── userId, agentId, modelId, providerId
    │       ├── status: 'active'
    │       └── createdAt: 当前时间
    │
    ├──► 5. 初始化存储
    │       └──► ArtifactService.createSessionStorage(sessionId)
    │
    └──► 6. 返回Session对象
```

#### 消息处理流程

```
用户发送消息
    │
    ▼
SessionService.sendMessage(sessionId, message)
    │
    ├──► 1. 获取Session
    │       └──► 若不存在，抛出SessionNotFoundError
    │
    ├──► 2. 构建RoutingContext
    │       ├── session: 当前Session
    │       ├── agent: AgentService.getAgent(session.agentId)
    │       ├── skills: SkillService.listAgentSkills(agentId)
    │       └── artifacts: ArtifactService.listSessionArtifacts(sessionId)
    │
    ├──► 3. 路由决策
    │       └──► RouterService.routeMessage(message, context)
    │           └──► 根据triggerConditions判断路由到skill还是model
    │
    ├──► 4a. 若路由到Skill
    │       └──► SkillService.executeSkill(skillId, skillContext)
    │           ├──► 应用Agent.boundaries约束
    │           ├──► 执行Skill脚本
    │           └──► 返回SkillResult
    │
    ├──► 4b. 若路由到Model
    │       ├──► PromptBuilder.buildPrompt(context)
    │       │   ├──► System层 + Agent层 + Skill层(可选) + Session层
    │       │   └──► 合并约束，检测冲突
    │       │
    │       └──► RouterService.routeAPI(apiRequest)
    │           └──► 调用ModelProvider API
    │
    ├──► 5. 构建AssistantMessage
    │       ├── id: 生成UUID
    │       ├── sessionId, role: 'assistant'
    │       ├── content: 响应内容
    │       └── artifacts: 生成的制品ID列表
    │
    ├──► 6. 保存消息和制品
    │       ├──► SessionService.addMessage(sessionId, assistantMessage)
    │       └──► ArtifactService.saveArtifact(sessionId, artifact)
    │
    └──► 7. 返回SendMessageResult
```

#### Skill边界约束执行流程

```
SkillService.executeSkill(skillId, context)
    │
    ├──► 1. 加载Skill
    │       └──► SkillService.loadSkill(skillId)
    │
    ├──► 2. 获取Agent boundaries
    │       └──► AgentService.getAgent(context.agentId)
    │           └──► agent.capability.boundaries
    │
    ├──► 3. 应用边界约束
    │       └──► PromptBuilder.applyBoundaries(skill.instructions, boundaries)
    │           ├──► 若instruction违反forbid类型boundary
    │           │       └──► 抛出ConstraintViolationError
    │           │
    │           ├──► 若instruction超出restrict范围
    │           │       └──► 截断或修改instruction
    │           │
    │           └──► 若instruction触发warn类型boundary
    │                   └──► 添加警告到结果
    │
    ├──► 4. 执行Skill脚本
    │       └──► 执行scripts/目录下的脚本
    │
    └──► 5. 返回SkillResult
```

### RouterService接口

```typescript
interface RouterService {
  routeAPI(request: APIRequest, providerId?: string): Promise<APIResponse>;
  routeMessage(message: Message, context: RoutingContext): RoutingResult;
  switchProvider(providerId: string): boolean;
  getActiveProvider(): ModelProvider;
  getFallbackChain(): string[];
  selectProviderForModel(modelId: string): ModelProvider;
}

interface RoutingContext {
  session: Session;
  agent: Agent;
  skills: Skill[];
  artifacts: Artifact[];
}

interface RoutingResult {
  destination: 'skill' | 'model';
  targetId: string;
  providerId?: string;
  confidence: number;
  reasoning: string;
}

interface APIRequest {
  modelId: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

interface APIResponse {
  id: string;
  modelId: string;
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  finishReason: string;
}
```

### PromptBuilder接口

```typescript
interface PromptBuilder {
  buildPrompt(context: PromptBuildContext): CompiledPrompt;
  mergeConstraints(layers: ConstraintLayer[]): ConstraintSet;
  resolveConflicts(constraints: ConstraintSet): ResolvedConstraint;
  applyBoundaries(skillInstructions: string, boundaries: Boundary[]): string;
}

interface PromptBuildContext {
  system: SystemConfig;
  agent: Agent;
  skills: Skill[];
  session: Session;
  activeSkillId?: string;
}

interface CompiledPrompt {
  system: string;
  agent: string;
  skill?: string;
  session: string;
  constraints: string[];
  modelConfig: ModelDefaults;
}

interface ConstraintLayer {
  level: 'system' | 'agent' | 'skill' | 'session';
  constraints: string[];
  priority: number;
}

interface ConstraintSet {
  all: string[];
  byLevel: Record<string, string[]>;
  conflicts: ConflictPair[];
}

interface ConflictPair {
  constraintA: string;
  constraintB: string;
  levelA: string;
  levelB: string;
}

interface ResolvedConstraint {
  effective: string[];
  blocked: string[];
  warnings: string[];
}
```

## 核心实体定义

### System

```typescript
interface System {
  id: string;
  name: string;
  version: string;
  metadata: Record<string, any>;
  defaultAgentId: string;
  defaultProviderId: string;
  createdAt: string;
  updatedAt: string;
}

interface SystemConfig {
  system: System;
  providers: ModelProvider[];
  agents: Record<string, AgentConfig>;
  skills: Record<string, SkillConfig>;
}

interface AgentConfig {
  id: string;
  name: string;
  defaultModelId: string;
  skillIds: string[];
  capabilityPath: string;
  soulPath: string;
}

interface SkillConfig {
  id: string;
  name: string;
  description: string;
  path: string;
}
```

### User

```typescript
interface User {
  id: string;
  name: string;
  systemId: string;
  agentId: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

interface UserPreferences {
  language: string;
  theme?: string;
  notificationEnabled: boolean;
  defaultModelId?: string;
}
```

### Agent

```typescript
interface Agent {
  id: string;
  name: string;
  systemId: string;
  defaultModelId: string;
  skillIds: string[];
  capability: Capability;
  soul: Soul;
  createdAt: string;
  updatedAt: string;
}
```

### Capability

```typescript
interface Capability {
  agentId: string;
  features: string[];
  permissions: Permission[];
  boundaries: Boundary[];
}

interface Permission {
  resource: string;
  actions: string[];
}

interface Boundary {
  type: 'forbid' | 'restrict' | 'warn';
  scope: string;
  description: string;
}
```

### Soul

```typescript
interface Soul {
  agentId: string;
  identity: string;
  personality: Personality;
  memory: Memory[];
  coreMemories: CoreMemory[];
}

interface Personality {
  traits: Record<string, number>;
  communicationStyle: string;
  values: string[];
}

interface Memory {
  id: string;
  type: 'episodic' | 'semantic';
  content: string;
  importance: number;
  timestamp: string;
}

interface CoreMemory {
  key: string;
  value: string;
  description: string;
}
```

### Skill

```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  instructions: string;
  contextFormat: string;
  outputFormat: string;
  constraints: SkillConstraint[];
  scripts: string[];
  resources: string[];
  triggerConditions: TriggerCondition[];
}

interface SkillConstraint {
  type: 'input' | 'output' | 'behavior';
  rule: string;
  action: 'block' | 'warn' | 'modify';
}

interface TriggerCondition {
  type: 'keyword' | 'pattern' | 'intent';
  pattern: string;
  weight: number;
}
```

### Session

```typescript
interface Session {
  id: string;
  userId: string;
  agentId: string;
  modelId: string;
  providerId: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  endedAt?: string;
  metadata: Record<string, any>;
}

type SessionStatus = 'active' | 'completed' | 'abandoned' | 'error';
```

### Message

```typescript
interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: MessageContent;
  modelId?: string;
  providerId?: string;
  skillId?: string;
  artifacts: string[];
  createdAt: string;
}

type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

interface MessageContent {
  type: 'text' | 'image' | 'audio' | 'file' | 'tool_call' | 'tool_result';
  text?: string;
  url?: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

interface ToolResult {
  toolCallId: string;
  success: boolean;
  output?: string;
  error?: string;
}
```

### Artifact

```typescript
interface Artifact {
  id: string;
  sessionId: string;
  type: ArtifactType;
  name: string;
  content: any;
  mimeType: string;
  size: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

type ArtifactType = 'document' | 'code' | 'image' | 'data' | 'config' | 'other';
```

### 异常类型定义

```typescript
class ConstraintViolationError extends Error {
  constructor(
    message: string,
    public violatedConstraint: string,
    public blockedByLevel: 'system' | 'agent' | 'skill',
    public attemptedAction: string
  ) {
    super(message);
    this.name = 'ConstraintViolationError';
  }
}

class ProviderNotFoundError extends Error {
  constructor(providerId: string) {
    super(`Provider not found: ${providerId}`);
    this.name = 'ProviderNotFoundError';
  }
}

class SessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`);
    this.name = 'SessionNotFoundError';
  }
}

class SkillExecutionError extends Error {
  constructor(
    message: string,
    public skillId: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'SkillExecutionError';
  }
}
```

### ModelProvider

```typescript
interface ModelProvider {
  id: string;
  name: string;
  providerType: ProviderType;
  apiEndpoint: string;
  apiKey?: string;
  capabilities: string[];
  supportedModels: string[];
  defaults: ModelDefaults;
  fallbackProviderId?: string;
  retryConfig: RetryConfig;
  cacheConfig: CacheConfig;
}

type ProviderType = 'openai' | 'anthropic' | 'openrouter' | 'perplexity' | 'custom';

interface ModelDefaults {
  temperature: number;
  maxTokens: number;
  topP: number;
  timeout: number;
}

interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  retryOn: string[];
}

interface CacheConfig {
  enabled: boolean;
  ttlMinutes: number;
  maxSize: number;
}
```

## 提示词系统设计

### 四层提示词架构

```
┌─────────────────────────────────────────────────────────┐
│                    系统层 (System)                       │
│  元数据、模型配置、Agent基础能力定义                      │
│  优先级: 1 (最高)                                        │
├─────────────────────────────────────────────────────────┤
│                    Agent层 (Agent)                       │
│  Soul(身份) + Capability(能力边界) + Skill绑定           │
│  优先级: 2                                              │
├─────────────────────────────────────────────────────────┤
│                    Skill层 (Skills)                      │
│  当前激活Skill的instructions + 执行历史                  │
│  优先级: 3                                              │
├─────────────────────────────────────────────────────────┤
│                    会话层 (Session)                      │
│  历史消息 + 当前用户输入 + 制品上下文                    │
│  优先级: 4 (最低)                                        │
└─────────────────────────────────────────────────────────┘
```

### 提示词合并规则

| 层级      | 来源                          | 优先级 | 合并时机     | 覆盖规则          |
| ------- | --------------------------- | --- | -------- | ------------- |
| System  | system.yaml, providers.yaml | 1   | 构建时      | 不可被下层覆盖       |
| Agent   | soul.yaml, capability.yaml  | 2   | 实例化时     | 限定范围外不可覆盖     |
| Skill   | SKILL.md instructions       | 3   | Skill调用时 | 仅在Skill执行期间有效 |
| Session | 历史消息 + 用户输入                 | 4   | 每次消息时    | 可补充，不可替换上层    |

### 冲突解决策略

1. **硬约束冲突** (System vs 其他)

   * System层的constraints具有最高优先级

   * 下层尝试突破时，抛出ConstraintViolationError

2. **软约束冲突** (Agent vs Skill)

   * Agent boundaries 定义活动范围

   * Skill instructions 只能在边界内

   * 超出范围时，Skill指令被截断或降级

3. **上下文冲突** (Session vs Skill)

   * Skill执行结果更新session context

   * 历史对话优先级高于Skill临时输出

   * 制品内容作为独立上下文引用

### 提示词构建流程

```
用户输入
    │
    ▼
┌─────────────────────────────────────────┐
│  1. 构建System层                          │
│     system.yaml + providers.yaml         │
│     → baseInstructions + constraints      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  2. 合并Agent层                           │
│     soul.yaml + capability.yaml          │
│     → identity + boundaries              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  3. 注入Skill层                           │
│     当前激活的SKILL.md                    │
│     → instructions + constraints          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  4. 追加Session层                         │
│     历史消息 + 用户输入 + 制品引用        │
│     → conversation context                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  5. 编译最终Prompt                        │
│     → 发送给ModelProvider                │
└─────────────────────────────────────────┘
```

## API改造影响分析

### 影响范围概述

| 模块         | 影响程度 | 改造类型 | 兼容性策略                |
| ---------- | ---- | ---- | -------------------- |
| 会话管理API    | 高    | 重构   | LegacySessionAdapter |
| 模型调用API    | 高    | 重构   | LegacyModelAdapter   |
| Agent配置API | 中    | 扩展   | 配置转换层                |
| Skill调用API | 中    | 扩展   | 向后兼容                 |
| 制品管理API    | 低    | 新增   | 无影响                  |

### 迁移策略

1. **双轨运行**: 新旧接口并行，逐步迁移
2. **适配器模式**: Legacy\*Adapter适配旧调用
3. **配置驱动**: 开关切换新旧实现
4. **数据迁移**: 一次性脚本转换历史数据

### OpenClaw设计模式借鉴

| 设计模式        | OpenClaw实现         | 本系统应用              |
| ----------- | ------------------ | ------------------ |
| Provider抽象  | 多搜索引擎可插拔           | ModelProvider统一接口  |
| 配置层级化       | plugins.entries.\* | providers.yaml分层   |
| 回退机制        | Firecrawl备选        | fallbackChain      |
| API Key自动识别 | Key前缀判断Provider    | detectApiKeyFormat |
| 缓存机制        | 15分钟TTL            | CacheConfig        |

## ADDED Requirements

### Requirement: System Configuration Management

系统 SHALL 提供系统配置管理能力，包括元数据定义、Provider配置等。

#### Scenario: 加载系统配置

* **WHEN** 系统启动时

* **THEN** ConfigService加载system.yaml和providers.yaml

#### Scenario: Provider注册

* **WHEN** 新Provider配置添加时

* **THEN** ConfigService注册Provider并验证连接

#### Scenario: API Key自动识别

* **WHEN** 配置API Key时

* **THEN** 系统自动识别Key格式并设置对应的baseUrl

### Requirement: Agent Lifecycle Management

系统 SHALL 提供Agent的创建、初始化、运行、销毁等生命周期管理。

#### Scenario: Agent实例化

* **WHEN** 创建新会话时

* **THEN** AgentService加载capability.yaml和soul.yaml实例化Agent

#### Scenario: Soul持久化

* **WHEN** Agent运行中或结束时

* **THEN** Soul状态被持久化到soul.yaml

### Requirement: Session Management

系统 SHALL 提供会话的创建、消息处理、历史管理能力。

#### Scenario: 创建会话

* **WHEN** 用户发起新会话时

* **THEN** SessionService创建Session，关联User和Agent

#### Scenario: 发送消息

* **WHEN** 用户发送消息时

* **THEN** SessionService路由消息，返回响应

#### Scenario: 会话持久化

* **WHEN** 会话进行中或结束时

* **THEN** 消息被追加写入agents/{agent-id}/sessions/{session-id}.jsonl

#### Scenario: 会话恢复

* **WHEN** 用户恢复历史会话时

* **THEN** SessionService从jsonl加载历史消息

### Requirement: Router Service Management

系统 SHALL 提供API路由、会话路由、消息路由能力。

#### Scenario: API路由选择

* **WHEN** Agent发起请求时

* **THEN** RouterService选择合适的ModelProvider

#### Scenario: Provider回退

* **WHEN** 当前Provider请求失败时

* **THEN** RouterService自动切换到fallbackChain中的下一个Provider

### Requirement: Prompt Engineering System

系统 SHALL 提供四层提示词管理系统。

#### Scenario: 提示词构建

* **WHEN** 用户发送消息时

* **THEN** PromptBuilder按层级合并提示词

#### Scenario: Skill边界约束

* **WHEN** Skill执行时

* **THEN** Skill指令受Agent boundaries约束

### Requirement: Skill Management

系统 SHALL 支持Skill的加载、注册、调用和结果处理。

#### Scenario: Skill加载

* **WHEN** Agent需要调用Skill时

* **THEN** SkillService加载SKILL.md和关联资源

#### Scenario: Skill执行

* **WHEN** Agent触发Skill调用时

* **THEN** SkillService执行脚本，返回结果

### Requirement: Artifact Storage

系统 SHALL 提供制品的创建、存储、检索、删除能力。

#### Scenario: 制品生成

* **WHEN** 会话过程中生成制品时

* **THEN** ArtifactService存储到artifacts/{session-id}/

#### Scenario: 制品检索

* **WHEN** 请求检索制品时

* **THEN** 根据session-id和artifact-id返回

### Requirement: User-Agent Binding

系统 SHALL 支持用户与Agent的绑定关系管理。

#### Scenario: 用户会话初始化

* **WHEN** 用户发起新会话时

* **THEN** 系统加载user.yaml，关联默认Agent

#### Scenario: Agent切换

* **WHEN** 用户请求切换Agent时

* **THEN** 系统更新user.yaml中的agentId绑定

## MODIFIED Requirements

### Requirement: 会话样例.jsonl兼容性

原会话样例消息格式 SHALL 被新架构兼容处理。

**Migration**: 提供迁移脚本转换为新架构的制品格式

## REMOVED Requirements

### Requirement: 旧配置文件格式

原有的分散式配置文件格式 SHALL 被废弃。

**Reason**: 缺乏统一模型，维护困难
**Migration**: 迁移至新设计的目录结构和配置文件格式
