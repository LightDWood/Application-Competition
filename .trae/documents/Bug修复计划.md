# Bug修复计划

## 修复目标

修复两个P0级Bug：
1. Bug #001 - AI回复为空
2. Bug #002 - 中文乱码

---

## Bug #001: AI回复为空

### 问题分析

**根因**: `enhancedSkillService.js` 的 `formatEnhancedAnalysis` 方法中，当所有条件都不满足时，`sections` 数组为空，导致没有chunk输出。

**代码位置**: `enhancedSkillService.js` 第857-949行

**问题代码**:
```javascript
formatEnhancedAnalysis(analysis, originalMessage) {
  const sections = []
  // ... 填充sections的条件都不满足 ...
  if (sections.length === 0) {
    return this.generateDefaultResponse(originalMessage)  // 返回了但未被yield
  }
  return sections.join('\n')
}
```

**修复方案**:

在 `handleRequirement` 方法中，确保即使 `formattedResponse` 为空或只返回sections，也要正确yield chunk。

### 修复步骤

1. 修改 `enhancedSkillService.js` 第741-748行，确保默认回复被正确yield
2. 在 `formatEnhancedAnalysis` 返回前添加日志
3. 测试验证修复效果

---

## Bug #002: 中文乱码

### 问题分析

**根因**: 数据库连接或写入时编码问题

**可能位置**:
- `database.js` - 数据库连接配置
- `models/Session.js` - 会话模型
- `models/Message.js` - 消息模型

### 修复步骤

1. 检查数据库连接配置，确保使用UTF8MB4编码
2. 检查表字段字符集
3. 测试验证修复效果

---

## 修复执行步骤

### 步骤1: 修复Bug #001 - AI回复为空

**修改文件**: `ai-contest-web/server/services/enhancedSkillService.js`

**修改位置**: `handleRequirement` 方法 (第727-777行)

**具体修改**:
1. 在调用 `formatEnhancedAnalysis` 后添加日志
2. 确保即使返回空也有默认回复被yield
3. 在 `fallbackToAIAPI` 也添加错误处理

### 步骤2: 修复Bug #002 - 中文乱码

**修改文件**:
- `ai-contest-web/server/config/database.js` (如存在)
- 或 `ai-contest-web/server/models/*.js`

**具体修改**:
1. 在数据库连接配置中添加 `charset: 'utf8mb4'`
2. 确保读写编码一致

### 步骤3: 测试验证

**测试1**: 发送消息验证AI回复
```bash
POST /api/sessions/{id}/messages/chat
{"content":"我想做一个任务管理系统"}
```

**预期**: SSE响应包含 `{"type":"chunk","content":"..."}`

**测试2**: 创建新会话验证中文
```bash
POST /api/sessions
{"title":"测试中文"}
```

**预期**: 查询返回中文正常显示

---

## 验证清单

| Bug | 修复项 | 验证方法 | 状态 |
|-----|--------|----------|------|
| #001 | AI回复 | 发送消息检查chunk | 待验证 |
| #002 | 中文乱码 | 创建会话检查中文 | 待验证 |

---

**计划创建时间**: 2026-03-21
**优先级**: P0 - 立即执行