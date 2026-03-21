# 合并 Admin 和 User 表为统一用户表

## Why
当前系统存在两套独立的管理员和用户认证体系：
- **Admin 表** (admins): id, username, password_hash, role
- **User 表** (users): id(UUID), username, email, password_hash, role, avatar_url, last_login_at, is_active

这种双表架构导致：
1. 维护成本高 - 需要同步管理两个模型和两套登录接口
2. 扩展性差 - 新功能需要在两个地方同时添加
3. 权限模型混乱 - 管理员和用户分散在不同表
4. 数据冗余 - username 可能在两表重复

## What Changes
- ✅ **废弃 Admin 表** - 数据迁移到 User 表后删除 Admin 模型
- ✅ **统一用户表** - 以 User 表为基础，所有用户（包括管理员）使用同一张表
- ✅ **简化登录接口** - 移除 `/api/auth/login`，统一使用 `/api/user/login`
- ✅ **统一认证中间件** - 所有路由使用同一个认证逻辑
- ✅ **数据迁移脚本** - 将 admins 表数据迁移到 users 表

## Impact
- **Affected specs**: optimize-token-security（依赖统一的用户认证体系）
- **Affected code**:
  - `server/models/Admin.js` - 删除
  - `server/models/index.js` - 移除 Admin 引用
  - `server/routes/auth.js` - 废弃或重定向到 user 登录
  - `server/routes/user.js` - 扩展登录逻辑支持 admin
  - `server/app.js` - 更新路由注册

---

## 当前表结构对比

| 字段 | Admin 表 (admins) | User 表 (users) | 合并后 |
|------|-------------------|------------------|--------|
| id | INTEGER 自增 | UUID | UUID |
| username | VARCHAR(50) 唯一 | VARCHAR(50) 唯一 | VARCHAR(50) 唯一 |
| email | ❌ 无 | VARCHAR(100) 唯一 | VARCHAR(100) 唯一 |
| password_hash | VARCHAR(255) | VARCHAR(255) | VARCHAR(255) |
| role | VARCHAR(20) 默认'admin' | ENUM('user','admin') | ENUM('user','admin') |
| avatar_url | ❌ 无 | VARCHAR(255) | VARCHAR(255) |
| last_login_at | ❌ 无 | DATETIME | DATETIME |
| is_active | ❌ 无 | BOOLEAN 默认true | BOOLEAN 默认true |

---

## ADDED Requirements

### Requirement: 数据迁移脚本
The system SHALL 提供一次性数据迁移脚本：

#### 迁移逻辑
- **WHEN** 执行迁移脚本时
- **THEN** 将 admins 表中所有数据迁移到 users 表
- **AND** 解决 username/email 冲突（详见迁移规则）

#### 迁移规则
1. admins.username → users.username（如冲突，保留 admins 数据）
2. admins.password_hash → users.password_hash
3. admins.role = 'admin' → users.role = 'admin'
4. 对于无 email 的 admin，生成占位 email: `{username}@admin.local`
5. 迁移完成后，admins 表可安全删除

#### 冲突处理
- **IF** users 表中已存在相同的 username
- **THEN** 比较 last_login_at，保留最近登录的记录
- **OR** 保留 role='admin' 的记录（管理员优先）

---

### Requirement: 统一登录接口
The system SHALL 提供统一的登录接口：

#### 登录请求
- **PATH**: `POST /api/user/login`
- **Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### 登录响应
```json
{
  "code": 0,
  "data": {
    "accessToken": "eyJhbG...",
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@ai-contest.com",
      "role": "admin",
      "avatar_url": null,
      "is_active": true
    }
  }
}
```

#### 登录路由映射
- **原**: `POST /api/auth/login` (Admin)
- **新**: `POST /api/user/login` (统一)
- **处理**: auth.js 中的 login 路由保留但内部调用 user.js 的逻辑

---

### Requirement: 角色权限判断
The system SHALL 通过 role 字段区分用户权限：

#### 权限级别
| role 值 | 权限说明 | 可访问页面 |
|---------|---------|-----------|
| 'admin' | 管理员 | 所有页面 |
| 'user' | 普通用户 | /requirement/*, /user/* |

#### 权限检查逻辑
```javascript
// 路由中间件
if (req.user.role !== 'admin') {
  return res.status(403).json({ code: 403, message: '需要管理员权限' })
}
```

---

## MODIFIED Requirements

### Requirement: 认证中间件
**修改前**:
- auth.js 使用 Admin.findOne/Admin.findByPk
- user.js 使用 User.findOne/User.findByPk

**修改后**:
- 统一使用 User.findOne/User.findByPk
- auth.js 作为 authRoutes 保留，但内部改用 User 表

### Requirement: Refresh Token 机制
**修改前**:
- `/api/auth/refresh` 查询 Admin 表
- `/api/user/refresh` 查询 User 表

**修改后**:
- 统一 `/api/user/refresh` 接口
- 查询 User 表，根据 token 中的 id 获取用户信息

---

## REMOVED Requirements

### Requirement: Admin 模型
**Reason**: 与 User 模型功能重叠，合并后减少维护成本
**Migration**:
1. 执行数据迁移脚本
2. 删除 server/models/Admin.js
3. 更新 server/models/index.js
4. 更新所有使用 Admin 的路由

### Requirement: 独立 Admin 登录接口
**Reason**: 统一使用 User 登录接口
**Migration**:
- `/api/auth/login` 保留但重定向到 `/api/user/login` 逻辑
- 或直接废弃 auth.js 中的 login 路由

---

## 技术实现方案

### 1. 数据库迁移 SQL
```sql
-- 迁移 admins 到 users（示例）
INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
SELECT
  UUID(),
  username,
  COALESCE(email, CONCAT(username, '@admin.local')),
  password_hash,
  'admin',
  NOW(),
  NOW()
FROM admins
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE users.username = admins.username
);
```

### 2. 模型更新
```javascript
// server/models/index.js
// 移除 Admin 导入
import User from './User.js'

// 移除 Admin 关联
```

### 3. 路由更新
```javascript
// server/routes/auth.js
// 移除 login 路由，或重定向到 user.js

// server/routes/user.js
// 确保支持 role='admin' 的用户登录
```

### 4. 中间件统一
```javascript
// 所有使用 authMiddleware 的路由无需修改
// 因为 authMiddleware 已使用统一的 User 表
```

---

## 风险与回滚方案

### 风险评估
| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 数据迁移丢失 | 高 | 迁移前备份数据库 |
| username 冲突 | 中 | 冲突检测和合并逻辑 |
| 业务中断 | 中 | 提供废弃过渡期 |

### 回滚方案
1. 保留 admins 表备份（迁移后重命名为 admins_backup）
2. 如有问题，可快速恢复 Admin 模型
3. 数据库事务保证迁移原子性

---

## 验收标准

1. ✅ 数据迁移脚本成功将 admins 数据迁移到 users
2. ✅ 迁移后 admins 表可安全删除（或保留备份）
3. ✅ 管理员使用 /api/user/login 可正常登录
4. ✅ 普通用户使用 /api/user/login 可正常登录
5. ✅ /api/user/refresh 可正确刷新 token
6. ✅ 所有需要 admin 权限的路由正常工作
7. ✅ /api/auth/login 保留但调用统一登录逻辑
8. ✅ 前端无需修改（接口 URL 可能需调整）
