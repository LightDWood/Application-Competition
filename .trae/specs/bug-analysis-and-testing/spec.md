# 系统 Bug 分析与测试计划 Spec

## Why

通过分析 admin 用户的对话日志，发现系统存在多个潜在 bug，需要系统性地进行测试和修复。

## What Changes

### 从对话日志中识别的潜在 Bug

**Bug 1: AI 回答被截断（严重）**
- **现象**: 会话 1 消息 4 和消息 6，AI 回答不完整，突然中断
- **位置**: `skillService.js` 流式输出处理
- **影响**: 用户体验差，信息传递不完整

**Bug 2: 空消息处理异常（中等）**
- **现象**: 会话 1 消息 2、6、8，AI 返回空内容或只有换行符
- **位置**: `skillService.js` handleRequirement 处理器
- **影响**: 用户看到空白回复

**Bug 3: 意图识别后处理不一致（中等）**
- **现象**: 会话 4 消息 2-10，问答被当作需求处理（已修复但历史数据存在）
- **位置**: `intentRecognizer.js`
- **影响**: 回答不符合预期

**Bug 4: 会话状态管理问题（低）**
- **现象**: 会话 2、3 为空会话，可能创建后未使用
- **位置**: 前端会话管理或后端会话创建逻辑
- **影响**: 数据库冗余

**Bug 5: 消息时间戳跳跃（低）**
- **现象**: 会话 4 中消息 1-2（18:35:49）和消息 3-8（09:43:24 次日）
- **位置**: 消息保存逻辑
- **影响**: 对话上下文可能不连贯

### 技术实现问题

**问题 1: 流式输出中断**
- SSE 解析可能存在问题
- reader 提前释放
- 网络超时处理不当

**问题 2: 需求收敛技能返回空值**
- createLocalRequirementService 可能返回空字符串
- formatRequirementAnalysis 可能未正确处理

**问题 3: 错误处理不完善**
- 缺少降级策略
- 错误日志不详细

---

## Impact

### Affected Code
- `server/services/skillService.js` - 流式输出、处理器逻辑
- `server/services/intentRecognizer.js` - 意图识别
- `server/routes/message.js` - 消息处理
- `frontend/src/views/Chat.vue` - 前端展示

### Affected Specs
- AI 对话能力规格
- 流式输出规格
- 错误处理规格

---

## ADDED Requirements

### Requirement: Bug 修复
The system SHALL 修复所有识别出的真实 bug：

#### Scenario: AI 回答完整性
- **WHEN** AI 生成回复时
- **THEN** 回答必须完整，不被截断
- **SUCCESS CRITERIA**：
  - 所有 AI 消息都有完整内容
  - 无突然中断的情况
  - 流式输出正常完成

#### Scenario: 空消息处理
- **WHEN** 技能返回空内容时
- **THEN** 系统应提供默认回复或重试
- **SUCCESS CRITERIA**：
  - 无空白回复
  - 有友好的错误提示

---

## MODIFIED Requirements

### Requirement: 测试覆盖
**修改前**：无明确测试要求  
**修改后**：必须包含完整的测试计划和执行记录

---

## 测试计划

### Phase 1: Bug 复现测试
1. 测试流式输出完整性
2. 测试空消息处理
3. 测试意图识别准确性

### Phase 2: 压力测试
1. 长消息测试
2. 并发请求测试
3. 网络延迟模拟

### Phase 3: 回归测试
1. 验证已修复 bug
2. 确保无新问题

---

**Spec 版本**: v1.0  
**创建日期**: 2026-03-18  
**状态**: 待审批
