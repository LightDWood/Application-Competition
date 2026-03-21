# Tasks - Session V1 废弃与 V2 规范化

## 阶段一：V2 安全修复

- [x] Task 1: 为 V2 所有 Session 路由添加认证中间件
  - [x] SubTask 1.1: 在 `server/routes/v2.js` 顶部导入 `authMiddleware`（不是 userAuthMiddleware）
  - [x] SubTask 1.2: 为 `POST /sessions` 添加认证
  - [x] SubTask 1.3: 为 `GET /sessions/:id` 添加认证
  - [x] SubTask 1.4: 为 `GET /sessions` 添加认证
  - [x] SubTask 1.5: 为 `POST /sessions/:id/messages` 添加认证
  - [x] SubTask 1.6: 为 `POST /sessions/:id/chat` 添加认证
  - [x] SubTask 1.7: 为 `DELETE /sessions/:id` 添加认证
  - [x] SubTask 1.8: 为 `PUT /sessions/:id` 添加认证
  - [x] SubTask 1.9: 为 `GET /sessions/:id/artifacts` 添加认证

- [x] Task 2: 修复 userId 信任问题
  - [x] SubTask 2.1: 修改 `POST /sessions` 路由，使用 `req.user.id` 替代 `req.body.userId`
  - [x] SubTask 2.2: 修改 `GET /sessions` 路由，使用 `req.user.id` 替代 `req.query.userId`

## 阶段二：统一响应格式

- [x] Task 3: V2 响应格式统一为 { code, message, data }
  - [x] SubTask 3.1: 修改 `POST /sessions` 成功响应格式
  - [x] SubTask 3.2: 修改 `GET /sessions/:id` 成功响应格式
  - [x] SubTask 3.3: 修改 `GET /sessions` 成功响应格式
  - [x] SubTask 3.4: 修改 `POST /sessions/:id/messages` 成功响应格式
  - [x] SubTask 3.5: 修改 `DELETE /sessions/:id` 成功响应格式
  - [x] SubTask 3.6: 修改 `PUT /sessions/:id` 成功响应格式
  - [x] SubTask 3.7: 修改 `GET /sessions/:id/artifacts` 成功响应格式
  - [x] SubTask 3.8: 统一错误响应格式 `{ code: >0, message, error? }`

## 阶段三：后端 V1 代码清理

- [x] Task 4: 删除 V1 Session 路由
  - [x] SubTask 4.1: 删除 `server/routes/session.js`
  - [x] SubTask 4.2: 从 `server/routes/index.js` 移除 session 路由注册

- [x] Task 5: 删除 V1 Message 路由
  - [x] SubTask 5.1: 删除 `server/routes/message.js`
  - [x] SubTask 5.2: 从 `server/routes/index.js` 移除 message 路由注册

- [x] Task 6: 评估删除 V1 Models
  - [x] SubTask 6.1: 检查 `server/models/session.js` 是否被其他代码引用 → 确认保留（被 Document 关联使用）
  - [x] SubTask 6.2: 检查 `server/models/message.js` 是否被其他代码引用 → 确认保留
  - [x] SubTask 6.3: 如无引用，删除这两个文件 → 保留因有关联

- [x] Task 7: 评估删除 enhancedSkillService
  - [x] SubTask 7.1: 检查 `server/services/enhancedSkillService.js` 是否被使用 → 确认无引用
  - [x] SubTask 7.2: 已删除该文件

## 阶段四：前端 V1 代码清理

- [x] Task 8: 清理 src/api/session.js
  - [x] SubTask 8.1: 移除 v1 方法（getList, create, getById, update, delete, getMessages, sendMessage, updateMessage, chat）
  - [x] SubTask 8.2: 只保留 v2 namespace 下的方法
  - [x] SubTask 8.3: 清理无用的导入

- [x] Task 9: 检查前端组件使用情况
  - [x] SubTask 9.1: 搜索前端代码中是否有仍在使用 v1 API 的地方 → 确认无
  - [x] SubTask 9.2: 如有发现，更新为使用 v2 API → 无需更新

## 阶段五：验证与测试

- [ ] Task 10: 验证 V2 认证功能
  - [ ] SubTask 10.1: 测试未登录访问 V2 API 返回 401
  - [ ] SubTask 10.2: 测试登录后正常访问

- [ ] Task 11: 验证 V2 功能正常
  - [ ] SubTask 11.1: 测试会话创建
  - [ ] SubTask 11.2: 测试会话列表获取
  - [ ] SubTask 11.3: 测试会话详情获取
  - [ ] SubTask 11.4: 测试发送消息
  - [ ] SubTask 11.5: 测试聊天功能

- [ ] Task 12: 验证前端功能正常
  - [ ] SubTask 12.1: 测试会话列表页面
  - [ ] SubTask 12.2: 测试聊天页面
  - [ ] SubTask 12.3: 测试文档列表页面

## Task Dependencies

- Task 3 依赖 Task 1 和 Task 2（需要先添加认证） ✅ 已完成
- Task 4-7 可以在 Task 1-3 完成后并行执行 ✅ 已完成
- Task 8-9 可以在 Task 4-7 完成后执行 ✅ 已完成
- Task 10-12 在所有清理工作完成后执行 → 待测试验证
