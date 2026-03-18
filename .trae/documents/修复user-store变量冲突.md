# 修复 user.js 变量命名冲突问题

## 问题描述

在 `src/stores/user.js` 的 `login` 函数中存在变量命名冲突：

```javascript
// 第6行定义了 ref
const token = ref(localStorage.getItem('user_token') || '')

// 第43行覆盖了 token 变量
token = res.data.token  // 现在 token 是字符串，不再是 ref

// 第64行报错
token.value = token  // 试图给字符串设置 .value 属性
```

## 修复方案

将 `login` 函数中的局部变量 `token` 重命名为 `tokenStr` 或 `jwtToken`，避免与 ref 变量 `token` 冲突。

## 修复步骤

### 步骤 1: 修改 login 函数中的变量名

将第34行的 `let user, token` 改为 `let user, jwtToken`

### 步骤 2: 更新赋值语句

- 第43行: `token = res.data.token` → `jwtToken = res.data.token`
- 第45行: `({ user, token } = args[0])` → `({ user, token: jwtToken } = args[0])`

### 步骤 3: 更新 localStorage 和 ref 赋值

- 第50行: `localStorage.setItem('user_token', token)` → `localStorage.setItem('user_token', jwtToken)`
- 第64行: `token.value = token` → `token.value = jwtToken`

## 修复后代码

```javascript
async function login(...args) {
  let user, jwtToken
  
  if (args.length === 2) {
    const [username, password] = args
    const res = await userAuthApi.login(username, password)
    if (res.code !== 0) {
      throw new Error(res.message || '登录失败')
    }
    user = res.data.user
    jwtToken = res.data.token
  } else if (args.length === 1 && args[0].user && args[0].token) {
    ({ user, token: jwtToken } = args[0])
  } else {
    throw new Error('无效的登录参数')
  }
  
  localStorage.setItem('user_token', jwtToken)
  localStorage.setItem('user_info', JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  }))
  
  userInfo.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  }
  token.value = jwtToken
  
  return { code: 0, data: { user, token: jwtToken } }
}
```

## 验证

修复后测试管理员登录，确保不再报错。
