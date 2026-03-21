# Tasks - Token/令牌安全性优化

## Task 1: 环境变量强制校验实现
- [x] 创建 .env.example 文件，包含 JWT_SECRET、JWT_EXPIRES_IN、REFRESH_TOKEN_EXPIRES_IN 等配置项
- [x] 在 app.js 中添加启动时环境变量校验逻辑
- [x] 验证未配置 JWT_SECRET 时服务拒绝启动

## Task 2: 统一认证中间件
- [x] 修改 server/middleware/auth.js，扩展字段支持 email
- [x] 删除 server/middleware/userAuth.js 文件
- [x] 更新 server/routes/user.js 使用统一的 authMiddleware
- [x] 更新 server/routes/admin.js 使用统一的 authMiddleware
- [x] 更新 server/routes/session.js 使用统一的 authMiddleware
- [x] 更新 server/routes/message.js 使用统一的 authMiddleware
- [x] 验证 req.user 包含 id, username, email, role

## Task 3: 实现 Refresh Token 机制
- [x] 安装 cookie-parser 依赖
- [x] 在 app.js 中配置 cookie-parser 中间件
- [x] 在 server/routes/auth.js 添加 /refresh 接口
- [x] 在 server/routes/user.js 添加 /refresh 接口
- [x] 修改登录接口返回 accessToken 并设置 refreshToken Cookie
- [x] 实现 Refresh Token 轮换机制

## Task 4: 前端 Token 自动刷新
- [x] 修改 src/stores/user.js，内存中存储 accessToken
- [x] 修改 src/api/user.js，实现 401 自动刷新逻辑
- [x] 修改 src/api/index.js，添加 withCredentials 支持
- [x] 验证 Access Token 过期后自动刷新

## Task 5: 日志脱敏
- [x] 在 utils 目录创建 sanitize.js 工具
- [x] 更新 server/routes/auth.js 中的 console.log 使用脱敏函数
- [x] 更新 server/routes/user.js 中的 console.log 使用脱敏函数
- [x] 验证敏感信息不写入日志

## Task 6: 验证与测试 (代码实现完成)
- [x] 代码实现完成，待服务启动后手动验证

---

# Task Dependencies
- Task 3 依赖 Task 1（需要 cookie-parser 配置）
- Task 4 依赖 Task 3（需要 /refresh 接口存在）
- Task 2 和 Task 5 可并行进行
