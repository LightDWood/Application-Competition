# Token/令牌安全性优化方案

## Why
当前系统的JWT Token设计存在以下安全隐患：
1. **JWT密钥硬编码**：默认密钥 `ai-contest-secret-key` 直接写在代码中，生产环境存在泄露风险
2. **双认证体系混乱**：系统同时存在 `admin` 和 `user` 两套认证中间件，增加维护复杂度和安全风险
3. **Token续期机制缺失**：Token 24小时过期后没有刷新机制，用户体验差且容易引发重新登录问题
4. **敏感信息日志**：密码验证等敏感操作可能产生日志，存在信息泄露风险

## What Changes
- ✅ **环境变量强制校验**：启动服务时检查 JWT_SECRET 是否已正确配置，未配置则拒绝启动
- ✅ **统一认证中间件**：合并 `authMiddleware` 和 `userAuthMiddleware` 为单一的 `authMiddleware`
- ✅ **Token刷新机制**：实现 Access Token + Refresh Token 双Token机制
- ✅ **敏感操作日志脱敏**：确保密码、Token等敏感信息不写入日志

## Impact
- **Affected specs**: unify-login-flow（依赖统一的用户认证体系）
- **Affected code**:
  - `server/middleware/auth.js` - 合并认证中间件
  - `server/middleware/userAuth.js` - 移除（合并到 auth.js）
  - `server/routes/auth.js` - 添加 token 刷新接口
  - `server/routes/user.js` - 使用统一的认证中间件
  - `server/routes/admin.js` - 使用统一的认证中间件
  - `.env.example` - 添加环境变量示例
  - `package.json` - 添加 dotenv 依赖

---

## ADDED Requirements

### Requirement: 环境变量强制校验
The system SHALL 在服务启动时强制校验 JWT_SECRET 环境变量：

#### 启动校验逻辑
- **WHEN** 服务启动时
- **THEN** 检查 `process.env.JWT_SECRET` 是否存在且非空
- **IF** JWT_SECRET 未配置或为空
- **THEN** 拒绝启动并抛出错误：`"FATAL: JWT_SECRET environment variable is required but not set"`

#### 配置示例
```bash
# .env 文件
JWT_SECRET=your-secure-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
```

---

### Requirement: 统一认证中间件
The system SHALL 提供统一的认证中间件 `authMiddleware`：

#### 中间件合并
- **源文件**：
  - `server/middleware/auth.js` (admin认证)
  - `server/middleware/userAuth.js` (user认证)
- **目标文件**：
  - `server/middleware/auth.js` (统一认证)
- **移除文件**：
  - `server/middleware/userAuth.js`

#### 统一后的认证逻辑
- **WHEN** 请求携带 `Authorization: Bearer <token>`
- **THEN** 解析 token 并验证签名
- **IF** token 有效
- **THEN** 将用户信息挂载到 `req.user`（包含 id, username, role, email）
- **NOTE**: 不再区分 `req.admin` 和 `req.user`，统一使用 `req.user`

#### 路由守卫适配
- **WHEN** 访问需要管理员权限的路由
- **THEN** 通过 `req.user.role === 'admin'` 判断
- **示例**：
```javascript
const authMiddleware = require('../middleware/auth')

// 需要管理员权限
router.get('/admin/dashboard', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '需要管理员权限' })
  }
  // 处理逻辑
})
```

---

### Requirement: Token刷新机制
The system SHALL 提供 Access Token + Refresh Token 双Token机制：

#### 双Token设计
| Token类型 | 过期时间 | 用途 | 存储位置 |
|-----------|----------|------|----------|
| Access Token | 1h | API接口访问 | memory (不持久化) |
| Refresh Token | 7d | 刷新Access Token | httpOnly Cookie |

#### 登录接口响应
- **WHEN** 用户登录成功时
- **THEN** 返回结构：
```json
{
  "code": 0,
  "data": {
    "user": { "id": 1, "username": "xxx", "role": "admin" },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..." 
  }
}
```
- **AND** 将 Refresh Token 写入 httpOnly Cookie

#### 刷新Token接口
- **PATH**: `POST /api/auth/refresh`
- **Request**: Cookie 中携带 Refresh Token（自动发送）
- **Response**: 新的 Access Token + Refresh Token
- **逻辑**：
```javascript
// 验证 Refresh Token
const refreshToken = req.cookies.refreshToken
if (!refreshToken) {
  return res.status(401).json({ code: 401, message: 'Refresh Token缺失' })
}

// 验证 Refresh Token 有效性
const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

// 生成新的 Access Token
const newAccessToken = jwt.sign(
  { id: decoded.id, username: decoded.username, role: decoded.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
)

// 生成新的 Refresh Token（轮换）
const newRefreshToken = jwt.sign(
  { id: decoded.id, type: 'refresh' },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

// 设置新的 Cookie
res.cookie('refreshToken', newRefreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
})

res.json({
  code: 0,
  data: { accessToken: newAccessToken }
})
```

#### 前端Token管理
- **Access Token**: 存储在内存变量中（不存 localStorage）
- **Refresh Token**: 存储在 httpOnly Cookie 中
- **请求拦截器**：
```javascript
// 在内存中存储 Access Token
let accessToken = null

// 请求拦截器
axios.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// 响应拦截器 - 自动刷新Token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !isRefreshing) {
      isRefreshing = true
      try {
        const res = await axios.post('/api/auth/refresh')
        accessToken = res.data.accessToken
        error.config.headers.Authorization = `Bearer ${accessToken}`
        return axios(error.config)
      } catch (refreshError) {
        // 刷新失败，跳转登录
        window.location.href = '/user/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)
```

---

### Requirement: 敏感操作日志脱敏
The system SHALL 确保敏感信息不写入日志：

#### 日志脱敏规则
- **FORBIDDEN** 记录以下字段的明文值：
  - `password`
  - `password_hash`
  - `token`
  - `accessToken`
  - `refreshToken`
  - `Authorization` header 值
  - `Cookie` header 值

#### 日志安全实现
```javascript
// 通用日志脱敏函数
const sanitizeForLog = (obj) => {
  const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie']
  const sanitized = { ...obj }
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]'
    }
  }
  
  return sanitized
}

// 使用示例
console.log('Login attempt:', sanitizeForLog({ username, password: 'secret123' }))
// 输出: { username: 'admin', password: '[REDACTED]' }
```

---

## MODIFIED Requirements

### Requirement: 登录接口响应格式
**修改前**：
```json
{
  "code": 0,
  "data": {
    "token": "jwt_token",
    "user": { "id": 1, "username": "xxx", "role": "admin" }
  }
}
```

**修改后**：
```json
{
  "code": 0,
  "data": {
    "accessToken": "eyJhbG...",
    "user": { "id": 1, "username": "xxx", "role": "admin" }
  }
}
```
- **AND**: Refresh Token 通过 httpOnly Cookie 设置

---

### Requirement: 路由中间件配置
**修改前**：路由使用不同的中间件
```javascript
// admin.js
const authMiddleware = require('../middleware/auth')
router.post('/xxx', authMiddleware, handler)

// user.js
const userAuthMiddleware = require('../middleware/userAuth')
router.post('/xxx', userAuthMiddleware, handler)
```

**修改后**：统一使用 authMiddleware
```javascript
const authMiddleware = require('../middleware/auth')
router.post('/xxx', authMiddleware, handler)
```

---

## REMOVED Requirements

### Requirement: userAuthMiddleware 中间件
**Reason**: 与 authMiddleware 功能重复，统一后减少维护成本  
**Migration**:
1. 将所有使用 `userAuthMiddleware` 的路由改为使用 `authMiddleware`
2. 删除 `server/middleware/userAuth.js` 文件
3. 确保 `req.user` 包含所有必要字段（id, username, role, email）

---

## 技术实现方案

### 1. 项目依赖
```bash
npm install cookie-parser
npm install dotenv --save-dev
```

### 2. 环境变量文件 (.env.example)
```bash
# JWT配置（必填）
JWT_SECRET=your-secure-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Node环境
NODE_ENV=development
```

### 3. 服务启动校验 (app.js)
```javascript
import 'dotenv/config'

// 启动时校验必需环境变量
const requiredEnvVars = ['JWT_SECRET']
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: ${envVar} environment variable is required but not set`)
    process.exit(1)
  }
}
```

### 4. 统一认证中间件
```javascript
// server/middleware/auth.js
import jwt from 'jsonwebtoken'

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 401, message: '未提供认证令牌' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    }

    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ code: 401, message: '无效的认证令牌' })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, message: '认证令牌已过期' })
    }
    return res.status(500).json({ code: 500, message: '认证失败' })
  }
}

export default authMiddleware
```

### 5. Refresh Token 路由
```javascript
// server/routes/auth.js 新增
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res.status(401).json({ code: 401, message: 'Refresh Token缺失' })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

    const newAccessToken = jwt.sign(
      { id: decoded.id, username: decoded.username, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    )

    const newRefreshToken = jwt.sign(
      { id: decoded.id, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    )

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ code: 0, data: { accessToken: newAccessToken } })
  } catch (error) {
    res.status(401).json({ code: 401, message: 'Refresh Token无效' })
  }
})
```

---

## 验收标准

1. ✅ 服务启动时检测到 JWT_SECRET 未配置会报错退出
2. ✅ 所有路由统一使用 authMiddleware
3. ✅ userAuthMiddleware.js 文件已删除
4. ✅ 登录接口同时返回 accessToken 和设置 refreshToken Cookie
5. ✅ /auth/refresh 接口可以刷新 Access Token
6. ✅ Access Token 过期后前端自动刷新
7. ✅ 日志中不出现敏感信息明文
8. ✅ Refresh Token 存储在 httpOnly Cookie 中
9. ✅ 生产环境 Cookie 设置 secure 标志
