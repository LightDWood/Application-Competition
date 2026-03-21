# Checklist - 合并 Admin 和 User 表

## 数据迁移
- [x] 分析表结构和冲突（User表更完整）
- [x] 确认迁移方案（以User表为基础）
- [x] app.js 使用 User 表创建默认管理员

## 模型更新
- [x] User 模型包含所有必要字段
- [x] User 模型的 role 字段支持 'admin' 值
- [x] models/index.js 移除 Admin 引用
- [x] User 模型关联正确（Session, Document, DocumentVersion）

## 认证路由更新
- [x] /api/auth/login 使用 User 表查询
- [x] /api/auth/refresh 使用 User 表查询
- [x] /api/auth/change-password 使用 User 表查询
- [x] /api/user/login 支持 admin 角色用户登录

## 功能验证
- [x] 后端服务启动成功
- [x] 服务使用 User 表查询
- [ ] 管理员登录测试 (admin/admin123)
- [ ] 普通用户登录测试
- [ ] token 刷新功能测试
- [ ] /api/admin/* 路由管理员可访问测试

## 代码清理
- [x] server/models/Admin.js 已删除
- [x] 无其他代码引用 Admin 模型（仅Vue组件TrainingAdmin）

## 前端影响
- [ ] 前端登录接口测试
- [ ] 前端 token 自动刷新测试
- [ ] 角色权限控制测试
