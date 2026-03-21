# 登录接口不存在 - 诊断与修复计划

## 问题现象
- 访问：`http://localhost:5173/ai-contest/user/login`
- 登录失败，显示"接口不存在"
- 用户名：admin，密码：admin123

## 已确认的修复
- ✅ `userAuthApi.login` 路径已从 `/user/login` 改为 `/auth/login`

## 诊断步骤

### 步骤1：确认后端 API 可用
- 测试 `POST http://localhost:3000/api/auth/login`
- 预期：返回 token

### 步骤2：确认前端配置
- 检查 `VITE_API_BASE_URL` 环境变量
- 确认前端请求是否发送到正确地址

### 步骤3：检查跨域问题
- 确认后端 CORS 配置允许前端域名

### 步骤4：确认前端热更新
- 如需重新构建，确保 Vite 服务重启

## 修复方案

### 方案A：后端路由修复（如果需要）
如果后端缺少 `/user/login` 路由但其他系统依赖它，可以添加代理路由

### 方案B：确认后端正常运行
- 检查后端服务是否在端口 3000 运行
- 检查日志是否有错误

## 验证方法
1. 使用 curl 测试后端 API
2. 检查浏览器 Network 面板
3. 确认完整登录流程

## 预期结果
- 后端 API `/api/auth/login` 可正常返回 token
- 前端登录页面可成功登录并跳转