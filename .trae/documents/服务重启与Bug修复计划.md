# 服务重启与Bug修复计划

## 目标

重启后端服务使代码修改生效，并修复第二阶段Bug清单中的Bug。

---

## 当前Bug状态

| Bug ID | 描述 | 严重程度 | 当前状态 |
|--------|------|----------|----------|
| 001 | AI回复为空 | P0 | 代码已修改，待重启验证 |
| 002 | 数据库中文乱码 | P0 | 代码已修改，待重启验证 |
| 003 | 归档API返回404 | P0 | 待修复 |
| 004 | 文档API返回404 | P1 | 待修复 |
| 005 | 会话标题中文乱码 | P1 | 已随Bug#002修复 |
| 006 | Artifacts API错误 | P2 | 待排查 |

---

## 执行步骤

### 步骤1: 重启后端服务

**操作**:
1. 停止当前运行的后端服务
2. 重新启动后端服务

**重启命令**:
```bash
# 在 ai-contest-web/server 目录
# Ctrl+C 停止现有服务
node app.js
```

**验证**:
- 检查健康状态: `GET /health`
- 检查服务日志中是否有 `📝 [DEBUG]` 日志输出

---

### 步骤2: 验证Bug#001和Bug#002修复效果

**验证1: AI回复测试**
```bash
POST /api/sessions/{sessionId}/messages/chat
{"content":"我想做一个任务管理系统"}
```
**预期**: SSE响应包含 `{"type":"chunk","content":"..."}`

**验证2: 中文乱码测试**
```bash
POST /api/sessions
{"title":"测试中文标题"}
```
**预期**: 查询返回中文正常显示

---

### 步骤3: 修复Bug #003 - 归档API返回404

**问题**: `/api/sessions/{id}/archive` 接口不存在

**根因**: 系统中没有 `/archive` 路由

**修复方案**:
1. 检查是否应该使用 `/sessions/:id/artifacts` 端点代替
2. 或在 `session.js` 路由中添加 `/archive` 端点

**修改文件**: `ai-contest-web/server/routes/session.js`

**修改内容**:
```javascript
// 添加归档端点
router.post('/:id/archive', userAuthMiddleware, async (req, res) => {
  const { id } = req.params
  // 实现归档逻辑
})
```

---

### 步骤4: 修复Bug #004 - 文档API返回404

**问题**: `/api/documents` 接口不存在

**修复方案**:
1. 创建文档路由文件 `document.js`
2. 在 `app.js` 中注册文档路由

**修改文件**:
- `ai-contest-web/server/routes/document.js` (新建)
- `ai-contest-web/server/app.js` (修改)

**实现内容**:
```javascript
// routes/document.js
router.get('/', userAuthMiddleware, async (req, res) => {
  // 获取文档列表
})

router.get('/:id', userAuthMiddleware, async (req, res) => {
  // 获取文档详情
})
```

---

### 步骤5: 排查Bug #006 - Artifacts API错误

**问题**: `/api/v2/sessions/{id}/artifacts` 返回 "Session not found"

**排查方向**:
1. 检查v2路由中session查询逻辑
2. 验证sessionId是否正确传递
3. 检查用户权限验证

**修改文件**: `ai-contest-web/server/routes/v2.js`

---

### 步骤6: 验证所有修复

**测试清单**:
- [ ] AI回复有chunk输出
- [ ] 新建会话中文正常
- [ ] 归档API返回200
- [ ] 文档API返回200
- [ ] Artifacts API正常

---

## 预期结果

| Bug ID | 描述 | 修复后状态 |
|--------|------|------------|
| 001 | AI回复为空 | ✅ 应修复 |
| 002 | 数据库中文乱码 | ✅ 应修复 |
| 003 | 归档API返回404 | ✅ 应修复 |
| 004 | 文档API返回404 | ✅ 应修复 |
| 005 | 会话标题中文乱码 | ✅ 应修复 |
| 006 | Artifacts API错误 | 🔍 待排查 |

---

**计划创建时间**: 2026-03-21
**优先级**: P0 - 立即执行