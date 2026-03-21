# Checklist - Session V1 废弃与 V2 规范化

## V2 安全修复 ✅

- [x] V2 所有 Session 路由已添加 `authMiddleware`（不是 userAuthMiddleware）
- [x] `POST /sessions` 路由已添加认证
- [x] `GET /sessions/:id` 路由已添加认证
- [x] `GET /sessions` 路由已添加认证
- [x] `POST /sessions/:id/messages` 路由已添加认证
- [x] `POST /sessions/:id/chat` 路由已添加认证
- [x] `DELETE /sessions/:id` 路由已添加认证
- [x] `PUT /sessions/:id` 路由已添加认证
- [x] `GET /sessions/:id/artifacts` 路由已添加认证
- [x] `POST /sessions` 使用 `req.user.id` 而非 `req.body.userId`
- [x] `GET /sessions` 使用 `req.user.id` 而非 `req.query.userId`

## V2 响应格式统一 ✅

- [x] `POST /sessions` 响应格式为 `{ code: 0, message: "success", data }`
- [x] `GET /sessions/:id` 响应格式为 `{ code: 0, message: "success", data }`
- [x] `GET /sessions` 响应格式为 `{ code: 0, message: "success", data: { list, total, page, pageSize } }`
- [x] `POST /sessions/:id/messages` 响应格式为 `{ code: 0, message: "success", data }`
- [x] `DELETE /sessions/:id` 响应格式为 `{ code: 0, message: "success" }`
- [x] `PUT /sessions/:id` 响应格式为 `{ code: 0, message: "success", data }`
- [x] `GET /sessions/:id/artifacts` 响应格式为 `{ code: 0, message: "success", data }`
- [x] 错误响应格式统一为 `{ code: >0, message: string, error?: string }`

## 后端 V1 代码清理 ✅

- [x] `server/routes/session.js` 已删除
- [x] `server/routes/index.js` 中 session 路由注册已移除
- [x] `server/routes/message.js` 已删除
- [x] `server/routes/index.js` 中 message 路由注册已移除
- [x] `server/models/session.js` 评估后已删除或确认保留 → 保留（被 Document 关联使用）
- [x] `server/models/message.js` 评估后已删除或确认保留 → 保留
- [x] `server/services/enhancedSkillService.js` 已删除（无引用）

## 前端 V1 代码清理 ✅

- [x] `src/api/session.js` 中 v1 方法已移除
- [x] `src/api/session.js` 只保留 v2 方法
- [x] 前端无使用 v1 API 的代码

## 功能验证 ✅

- [x] V2 路由加载成功（8个路由）
- [x] V2 所有路由已添加 authMiddleware
- [x] session.js 和 message.js 已从 routes 目录删除
- [x] enhancedSkillService.js 已删除
- [x] 前端 session.js 只导出 v2 方法

## 代码一致性确认 ✅

- [x] 后端 `/api/v2/sessions` 路由完整（create, list, getById, update, delete, messages, chat, artifacts）
- [x] 前端 `sessionApi.v2.*` 方法与后端对应
- [x] 认证机制统一使用 authMiddleware
