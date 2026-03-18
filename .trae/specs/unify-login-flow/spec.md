# 统一登录流程设计规范

## Why
当前系统存在两个独立的登录入口（`/login` 管理员登录和 `/user/login` 用户登录），导致用户需要区分自己的角色身份才能选择正确的登录页面。登录后的跳转逻辑固定，无法记住用户登录前想要访问的页面，用户体验不佳。需要统一登录入口，实现基于角色的动态菜单和登录后智能跳转。

## What Changes
- ✅ **移除管理员专用登录页**：统一使用 `/user/login` 作为唯一登录入口
- ✅ **添加 redirect 参数支持**：登录页接收 redirect 参数，记录用户登录前想要访问的页面
- ✅ **优化登录后跳转逻辑**：优先跳转到 redirect 参数指定的页面，其次根据角色跳转默认页面
- ✅ **实现基于角色的菜单权限**：登录后根据用户角色动态显示/隐藏菜单项
- ✅ **添加权限验证中间件**：访问受限页面时验证用户角色权限
- ✅ **优化路由守卫**：统一处理未登录和权限不足的跳转逻辑

## Impact
- **Affected specs**: add-account-management（账号管理功能）
- **Affected code**: 
  - `src/views/Login.vue` - 原管理员登录页（移除或重定向）
  - `src/views/user/Login.vue` - 统一登录页（修改跳转逻辑）
  - `src/components/Header.vue` - 导航栏（添加角色菜单权限控制）
  - `src/router/index.js` - 路由配置和守卫（优化权限验证）
  - `src/stores/user.js` - 用户状态管理（添加角色判断）

## ADDED Requirements

### Requirement: 统一登录入口
The system SHALL provide 统一的登录页面：

#### 登录页面配置
- **WHEN** 用户访问任何需要登录的页面但未登录时
- **THEN** 系统统一跳转到 `/user/login` 页面，并携带 redirect 参数
- **redirect 参数格式**：`/user/login?redirect=/原页面路径`

#### 登录页面前端逻辑
- **WHEN** 用户打开登录页面时
- **THEN** 系统从 URL query 参数中读取 redirect 值并保存
- **默认 redirect 值**：
  - 如果提供了 redirect 参数，使用该值
  - 如果没有提供，根据后续登录角色决定（管理员→/training-admin，普通用户→/requirement）

---

### Requirement: 登录后智能跳转
The system SHALL provide 智能跳转逻辑：

#### 跳转优先级
- **WHEN** 用户登录成功后
- **THEN** 系统按以下优先级决定跳转目标：
  1. **最高优先级**：redirect 参数指定的页面（需要验证权限）
  2. **次优先级**：根据用户角色的默认页面
     - 管理员：`/training-admin`
     - 普通用户：`/requirement`
  3. **最低优先级**：首页 `/`

#### 权限验证跳转
- **WHEN** redirect 参数指定的页面需要特定角色权限时
- **THEN** 系统验证用户角色：
  - 如果用户有权限 → 跳转到 redirect 页面
  - 如果用户无权限（如普通用户 redirect 到后台管理）→ 跳转到该角色的默认页面，并提示"您没有访问该页面的权限"

---

### Requirement: 基于角色的菜单权限
The system SHALL provide 动态菜单显示控制：

#### 菜单项权限配置
- **WHEN** 渲染导航栏菜单时
- **THEN** 系统根据用户角色动态显示/隐藏菜单项：

| 菜单项 | 游客 | 普通用户 | 管理员 |
|--------|------|----------|--------|
| 首页 | ✅ 显示 | ✅ 显示 | ✅ 显示 |
| 培训资料 | ✅ 显示 | ✅ 显示 | ✅ 显示 |
| 创意工坊 | ❌ 隐藏 | ✅ 显示 | ✅ 显示 |
| 大赛报名 | ✅ 显示 | ✅ 显示 | ✅ 显示 |
| 后台管理 | ❌ 隐藏 | ❌ 隐藏 | ✅ 显示 |

#### 菜单权限控制实现
- **WHEN** 用户登录后或刷新页面时
- **THEN** 系统从 localStorage 读取用户信息中的 role 字段
- **菜单渲染逻辑**：
  - 使用 `v-if` 或 `v-show` 根据角色控制菜单项显示
  - 管理员显示所有菜单项
  - 普通用户隐藏"后台管理"菜单项
  - 游客隐藏"创意工坊"和"后台管理"菜单项

---

### Requirement: 路由权限守卫
The system SHALL provide 统一的路由权限验证：

#### 路由元数据配置
- **WHEN** 定义路由时
- **THEN** 为需要权限的路由添加 meta 配置：

```javascript
{
  path: '/training-admin',
  component: TrainingAdmin,
  meta: {
    requiresAuth: true,      // 需要登录
    requiresRole: 'admin'    // 需要管理员角色（可选）
  }
}
```

#### 路由守卫逻辑
- **WHEN** 用户尝试访问受保护的路由时
- **THEN** 路由守卫执行以下验证：
  1. 检查 `requiresAuth`：如果为 true 且未登录 → 跳转到 `/user/login?redirect=原路径`
  2. 检查 `requiresRole`：如果需要特定角色但用户角色不匹配 → 跳转到首页或角色默认页面，并提示无权限
  3. 验证通过 → 允许访问

---

## MODIFIED Requirements

### Requirement: 登录页面跳转逻辑（原 Login.vue）
**修改前**：
- 管理员登录页 `/login` 和用户登录页 `/user/login` 独立存在
- 登录后固定跳转（管理员→后台管理，用户→创意工坊）

**修改后**：
- 统一使用 `/user/login` 作为登录入口
- 登录后的跳转逻辑：
  ```javascript
  const redirect = route.query.redirect || 
                   (userInfo.role === 'admin' ? '/training-admin' : '/requirement')
  router.push(redirect)
  ```

### Requirement: 导航栏菜单显示（原 Header.vue）
**修改前**：
- 使用 `v-if="isAdmin"` 控制后台管理菜单显示

**修改后**：
- 使用统一的角色判断逻辑：
  ```javascript
  const showAdminMenu = computed(() => {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || 'null')
    return userInfo?.role === 'admin'
  })
  ```

### Requirement: 路由守卫（原 router/index.js）
**修改前**：
- 分别检查 `requiresAuth` 和 `requiresUserAuth`
- 使用不同的 token（admin_token 和 user_token）

**修改后**：
- 统一使用 `user_token` 和 `user_info`
- 添加角色验证逻辑：
  ```javascript
  if (to.meta.requiresRole) {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || 'null')
    if (userInfo?.role !== to.meta.requiresRole) {
      // 角色不匹配，重定向
      next('/')
      return
    }
  }
  ```

---

## REMOVED Requirements

### Requirement: 管理员专用登录页
**Reason**: 统一登录入口，减少用户混淆  
**Migration**: 
- 将 `/login` 路由重定向到 `/user/login`
- 或在 `/login` 页面自动跳转到 `/user/login`

---

## 用户流程设计

### 流程 1：普通用户访问创意工坊
```
1. 用户（未登录）点击"创意工坊"菜单
   ↓
2. 路由守卫检测到未登录
   ↓
3. 跳转到 /user/login?redirect=/requirement
   ↓
4. 用户输入账号密码登录
   ↓
5. 登录成功，获取用户信息（role: 'user'）
   ↓
6. 验证 redirect 页面权限（/requirement 需要普通用户权限）
   ↓
7. 跳转到 /requirement
   ↓
8. 菜单中不显示"后台管理"
```

### 流程 2：管理员访问后台管理
```
1. 管理员（未登录）点击"后台管理"菜单
   ↓
2. 路由守卫检测到未登录
   ↓
3. 跳转到 /user/login?redirect=/training-admin
   ↓
4. 管理员输入账号密码登录
   ↓
5. 登录成功，获取用户信息（role: 'admin'）
   ↓
6. 验证 redirect 页面权限（/training-admin 需要管理员权限）
   ↓
7. 跳转到 /training-admin
   ↓
8. 菜单中显示"后台管理"
```

### 流程 3：普通用户尝试访问后台管理
```
1. 普通用户（未登录）手动输入 /training-admin
   ↓
2. 路由守卫检测到未登录
   ↓
3. 跳转到 /user/login?redirect=/training-admin
   ↓
4. 用户输入账号密码登录
   ↓
5. 登录成功，获取用户信息（role: 'user'）
   ↓
6. 验证 redirect 页面权限（/training-admin 需要管理员权限，但用户是普通用户）
   ↓
7. 拒绝访问，跳转到 /requirement，并提示"您没有访问后台管理的权限"
   ↓
8. 菜单中不显示"后台管理"
```

---

## 技术实现方案

### 1. 用户角色存储
```javascript
// localStorage 结构
{
  "user_token": "jwt_token_string",
  "user_info": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@ai-contest.com",
    "role": "admin"  // 或 'user'
  }
}
```

### 2. 路由配置示例
```javascript
{
  path: '/training-admin',
  name: 'TrainingAdmin',
  component: () => import('../views/TrainingAdmin.vue'),
  meta: {
    requiresAuth: true,
    requiresRole: 'admin',
    title: '后台管理'
  }
},
{
  path: '/requirement',
  name: 'Requirement',
  component: () => import('../views/requirement/Layout.vue'),
  meta: {
    requiresAuth: true,
    requiresRole: 'user',  // 或 ['user', 'admin']
    title: '创意工坊'
  }
}
```

### 3. 路由守卫伪代码
```javascript
router.beforeEach((to, from, next) => {
  const userInfo = JSON.parse(localStorage.getItem('user_info') || 'null')
  const token = localStorage.getItem('user_token')
  
  // 需要登录
  if (to.meta.requiresAuth && !token) {
    next({
      path: '/user/login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // 需要特定角色
  if (to.meta.requiresRole && userInfo) {
    const requiredRole = to.meta.requiresRole
    const userRole = userInfo.role
    
    // 支持角色数组或单个角色
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    
    if (!allowedRoles.includes(userRole)) {
      // 角色不匹配，重定向到首页或提示
      next('/')
      alert('您没有访问该页面的权限')
      return
    }
  }
  
  next()
})
```

### 4. 登录页跳转逻辑
```javascript
const handleLogin = async () => {
  const res = await userStore.login(username, password)
  
  if (res.code === 0) {
    // 获取 redirect 参数
    const redirect = route.query.redirect
    
    if (redirect) {
      // 验证 redirect 页面的角色要求
      const routeMeta = router.getRoutes()
        .find(r => r.path === redirect)?.meta
      
      if (routeMeta?.requiresRole) {
        const requiredRole = routeMeta.requiresRole
        const userRole = res.data.user.role
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        
        if (allowedRoles.includes(userRole)) {
          router.push(redirect)
        } else {
          // 角色不匹配，跳转到默认页面
          const defaultPath = userRole === 'admin' ? '/training-admin' : '/requirement'
          router.push(defaultPath)
          alert(`您没有访问该页面的权限，已跳转到${defaultPath}`)
        }
      } else {
        // 没有角色要求，直接跳转
        router.push(redirect)
      }
    } else {
      // 没有 redirect 参数，根据角色跳转默认页面
      const defaultPath = res.data.user.role === 'admin' ? '/training-admin' : '/requirement'
      router.push(defaultPath)
    }
  }
}
```

---

## 验收标准

1. ✅ 全系统只有一个登录入口 `/user/login`
2. ✅ 原 `/login` 页面重定向到 `/user/login`
3. ✅ 登录页支持 redirect 参数
4. ✅ 登录成功后优先跳转到 redirect 参数指定的页面（如果权限允许）
5. ✅ 普通用户尝试访问后台管理时被拒绝并提示
6. ✅ 管理员登录后可以看到"后台管理"菜单
7. ✅ 普通用户登录后看不到"后台管理"菜单
8. ✅ 路由守卫正确验证用户角色
9. ✅ 所有受保护的路由都有正确的 meta 配置
10. ✅ 用户流程符合设计预期
