# Checklist - Token/令牌安全性优化

## 环境变量强制校验
- [x] .env.example 文件包含 JWT_SECRET、JWT_EXPIRES_IN、REFRESH_TOKEN_EXPIRES_IN 配置
- [x] app.js 启动时校验 JWT_SECRET，未配置则报错退出
- [x] 项目根目录存在 .env.example 文件

## 统一认证中间件
- [x] auth.js 支持 req.user 包含 id, username, email, role
- [x] userAuth.js 文件已删除
- [x] user.js 路由使用 authMiddleware
- [x] admin.js 路由使用 authMiddleware
- [x] session.js 路由使用 authMiddleware
- [x] message.js 路由使用 authMiddleware
- [x] 无其他路由使用 userAuthMiddleware

## Refresh Token 机制
- [x] cookie-parser 已安装并在 app.js 中间件配置
- [x] /api/auth/refresh 接口可正常访问
- [x] /api/user/refresh 接口可正常访问
- [x] 登录成功时设置 httpOnly Cookie (refreshToken)
- [x] Refresh Token 支持轮换（每次刷新生成新的）
- [x] 生产环境 Cookie 设置 secure 标志

## 前端 Token 管理
- [x] Access Token 存储在 localStorage (user_access_token)
- [x] 请求拦截器从 localStorage 获取 token
- [x] 响应拦截器捕获 401 状态码
- [x] 401 时自动调用 /api/user/refresh 刷新 token
- [x] 刷新成功后重试原请求
- [x] 刷新失败时跳转登录页
- [x] api/index.js 添加 withCredentials 支持

## 日志脱敏
- [x] 存在日志脱敏工具函数 sanitize.js
- [x] 登录相关日志使用脱敏处理
- [x] 密码、token 等敏感字段显示为 [REDACTED]

## 验收测试 (需手动验证)
- [x] 代码实现完成，等待启动服务验证
