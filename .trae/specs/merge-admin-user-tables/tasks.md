# Tasks - 合并 Admin 和 User 表

## Task 1: 数据迁移准备
- [x] 分析 admins 和 users 表数据冲突情况（User表已包含所有必要字段）
- [x] 确认迁移方案

## Task 2: 更新 User 模型
- [x] User 模型已包含所有必要字段（id, username, email, password_hash, role, avatar_url, last_login_at, is_active）
- [x] User 模型的 role 字段支持 'admin' 值

## Task 3: 更新 models/index.js
- [x] 移除 Admin 模型导入
- [x] 移除 Admin 关联定义
- [x] 验证 User 模型关联正常

## Task 4: 更新认证路由 auth.js
- [x] 修改 login 接口改用 User 表
- [x] 修改 refresh 接口改用 User 表
- [x] 修改 change-password 接口改用 User 表
- [x] 验证 /api/auth/login 可正常工作

## Task 5: 更新用户路由 user.js
- [x] /api/user/login 已支持 admin 角色用户登录
- [x] /api/user/refresh 可正常刷新 token

## Task 6: 删除 Admin 模型文件
- [x] 确认数据已迁移完成（app.js 使用 User 表创建默认管理员）
- [x] 删除 server/models/Admin.js

## Task 7: 验证与测试
- [x] 后端服务启动成功
- [x] 服务使用 User 表查询管理员
- [ ] 前端登录测试
- [ ] 管理员权限测试

---

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 依赖 Task 2
- Task 4 依赖 Task 3
- Task 5 依赖 Task 4
- Task 6 依赖 Task 1 和 Task 5
- Task 7 依赖 Task 4、5、6
