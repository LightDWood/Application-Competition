# Session V1 废弃与 V2 规范化整改规范

## Why

当前系统存在双轨 Session 架构（V1 基于数据库，V2 基于内存 SessionService），但 V2 存在严重的安全漏洞（无认证机制），且两套系统响应格式不统一。前端已全面迁移到 V2，但 V1 代码仍存在造成维护负担。需要通过本次整改：1) 修复 V2 安全问题；2) 统一响应格式；3) 清理废弃的 V1 代码。

## 与 optimize-token-security 规范的关系

**冲突说明**：`optimize-token-security` 规范已经：
1. 删除了 `userAuthMiddleware`，统一使用 `authMiddleware`
2. 修改了 `session.js` 和 `message.js` 使用 `authMiddleware`

**本规范需注意**：
- V2 路由应使用 `authMiddleware`（不是 `userAuthMiddleware`）
- 删除 V1 文件时需确认 `optimize-token-security` 的修改已应用

## What Changes

### 1. V2 安全修复（高优先级）

- [ ] V2 所有路由添加 `authMiddleware` 认证中间件（不是 userAuthMiddleware）
- [ ] 移除直接信任客户端传入 `userId` 的逻辑，改为从认证中间件获取
- [ ] V2 创建会话时使用 `req.user.id` 而非 `req.body.userId`

### 2. 响应格式统一（中优先级）

- [ ] V2 响应格式统一为 `{ code, message, data }`（与 V1 保持一致）
- [ ] 错误响应格式统一为 `{ code: >0, message: string, error?: string }`

### 3. V1 代码清理（高优先级）

**后端清理**：
- [ ] 删除 `server/routes/session.js`（Session v1 路由）
- [ ] 删除 `server/routes/message.js`（Message v1 路由）
- [ ] 从 `server/routes/index.js` 移除 session 和 message 路由注册
- [ ] 评估删除 `server/models/session.js` 和 `server/models/message.js`（如无其他引用）
- [ ] 评估删除 `server/services/enhancedSkillService.js`（如仅为 V1 服务）

**前端清理**：
- [ ] 删除 `src/api/session.js` 中的 v1 方法（保留 v2 方法）
- [ ] 清理任何仍在使用 v1 API 的前端组件

### 4. 前端 API 导出清理

- [ ] `src/api/session.js` 只保留 v2 相关方法
- [ ] 确保 `sessionApi.v2.*` 是唯一导出路径
- [ ] 更新 TypeScript 类型定义（如有）

## Impact

### Affected Capabilities

- Session CRUD 操作（现有功能不受影响，统一到 V2）
- 消息发送与聊天功能（流式响应保持不变）
- 会话历史查询

### Affected Code

| 文件/模块                      | 操作 | 原因          |
| -------------------------- | -- | ----------- |
| `server/routes/v2.js`      | 修改 | 添加认证、统一响应格式 |
| `server/routes/session.js` | 删除 | V1 废弃       |
| `server/routes/message.js` | 删除 | V1 废弃       |
| `server/routes/index.js`   | 修改 | 移除 V1 路由注册  |
| `src/api/session.js`       | 修改 | 清理 v1 方法    |
| 前端 Vue 组件                  | 检查 | 确保使用 v2 API |

## ADDED Requirements

### Requirement: V2 认证保护

V2 所有 session 相关路由 SHALL 使用 `authMiddleware` 进行认证保护。

#### Scenario: 访问受保护的 V2 路由

* **WHEN** 未登录用户尝试访问 `/api/v2/sessions/*`
* **THEN** 返回 401 Unauthorized

#### Scenario: 创建会话时获取用户身份

* **WHEN** 用户调用 `POST /api/v2/sessions` 创建会话
* **THEN** 使用 `req.user.id` 而非客户端传入的 `userId`

### Requirement: 统一响应格式

V2 API SHALL 使用统一的响应格式 `{ code, message, data }`。

#### Scenario: 成功响应

* **WHEN** API 调用成功
* **THEN** 返回 `{ code: 0, message: "success", data: {...} }`

#### Scenario: 错误响应

* **WHEN** API 调用失败
* **THEN** 返回 `{ code: 500, message: "错误描述", error?: "详细错误" }`

## MODIFIED Requirements

### Requirement: Session 创建

会话创建 SHALL 从请求体获取 `agentId` 和 `title`，用户 ID 从认证上下文获取。

**Migration**: 原 `req.body.userId` → `req.user.id`

## REMOVED Requirements

### Requirement: V1 Session API

V1 Session API (基于 Sequelize + MySQL) SHALL 被废弃。

**Reason**: 前端已全面迁移到 V2，V1 代码无人使用且维护负担

**Migration**: 所有调用方迁移到 V2 API

### Requirement: V1 Message API

V1 Message API SHALL 被废弃。

**Reason**: V2 已包含完整的消息处理能力

**Migration**: 所有调用方迁移到 V2 API

### Requirement: enhancedSkillService

`enhancedSkillService.js` SHALL 被评估后删除或整合。

**Reason**: 如果仅为 V1 服务，则应废弃
