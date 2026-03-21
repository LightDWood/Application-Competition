# Bug 修复计划

## Bug 1: 用户登录调用了管理员登录 API

### 问题分析
1. [Login.vue:49](file:///d:\DFX\Code\AIbisai-wangzhan - 副本\ai-contest-web\src\views\Login.vue#L49) 导入的是 `authApi`（管理员登录）
2. [Login.vue:70](file:///d:\DFX\Code\AIbisai-wangzhan - 副本\ai-contest-web\src\views\Login.vue#L70) 调用 `authApi.login()` 实际请求的是 `/auth/login`（管理员接口）
3. 正确的用户登录接口是 `/user/login`（后端 [routes/user.js:84](file:///d:\DFX\Code\AIbisai-wangzhan - 副本\ai-contest-web\server\routes\user.js#L84)）

### 修复步骤

#### 步骤 1: 修改 [src/api/user.js](file:///d:\DFX\Code\AIbisai-wangzhan - 副本\ai-contest-web\src\api\user.js)
- 将 `userAuthApi.login` 函数的 URL 从 `/auth/login` 修改为 `/user/login`

#### 步骤 2: 修改 [src/views/Login.vue](file:///d:\DFX\Code\AIbisai-wangzhan - 副本\ai-contest-web\src\views\Login.vue)
- 将导入从 `import { authApi } from '../api/auth.js'` 改为 `import { userAuthApi } from '../api/user.js'`
- 将 `authApi.login()` 调用改为 `userAuthApi.login()`
- 将 `admin_token` 改为 `user_token`
- 将 `admin_info` 改为 `user_info`
- 将登录成功后的跳转目标从 `/admin` 改为 `/requirement`

---

## Bug 2: API 路由前缀不匹配（contest/info 404）

### 问题分析
前端请求 `GET http://localhost:3000/contest/info` 返回 404，但后端正确路径应该是 `/api/contest/info`。

需要检查：
1. 前端 axios 实例的 baseURL 配置
2. 环境变量 VITE_API_BASE_URL 是否设置

### 修复步骤

#### 步骤 3: 检查并创建环境变量文件
- 检查 `.env` 或 `.env.local` 文件是否存在于 `ai-contest-web` 目录
- 如果不存在，创建 `.env` 文件并设置 `VITE_API_BASE_URL=http://localhost:3000/api`

---

## 修复文件清单

| 文件 | 修改内容 |
|------|----------|
| `ai-contest-web/src/api/user.js` | 修正 `userAuthApi.login` 的 URL |
| `ai-contest-web/src/views/Login.vue` | 改用 `userAuthApi`，修正 token 存储 key |
| `ai-contest-web/.env` | 确保环境变量正确设置 |

---

## 验证方法

修复完成后，启动后端和前端，执行以下操作验证：
1. 访问首页 → `/contest/info` 应该返回 200
2. 进行登录操作 → `/user/login` 应该返回 200，token 存储在 `user_token`
