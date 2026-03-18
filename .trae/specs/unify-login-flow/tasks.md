# Tasks

- [x] Task 1: 处理原管理员登录页
  - [x] SubTask 1.1: 检查 `/login` 路由的当前配置
  - [x] SubTask 1.2: 将 `/login` 路由重定向到 `/user/login`
  - [x] SubTask 1.3: 或在 `/login` 页面添加自动跳转逻辑到 `/user/login`

- [x] Task 2: 修改登录页跳转逻辑
  - [x] SubTask 2.1: 修改 `src/views/user/Login.vue`，读取 redirect 参数
  - [x] SubTask 2.2: 实现登录后智能跳转逻辑（优先 redirect，其次根据角色）
  - [x] SubTask 2.3: 添加权限验证（如果 redirect 页面需要特定角色）
  - [x] SubTask 2.4: 添加无权限时的提示和跳转默认页面逻辑

- [x] Task 3: 优化路由配置
  - [x] SubTask 3.1: 为 `/training-admin` 路由添加 `requiresRole: 'admin'` 元数据
  - [x] SubTask 3.2: 为 `/requirement` 路由添加 `requiresRole: ['user', 'admin']` 元数据
  - [x] SubTask 3.3: 检查其他需要权限的路由并添加相应配置

- [x] Task 4: 优化路由守卫
  - [x] SubTask 4.1: 统一使用 `user_token` 和 `user_info`
  - [x] SubTask 4.2: 添加 `requiresRole` 验证逻辑
  - [x] SubTask 4.3: 支持角色数组（一个路由允许多个角色访问）
  - [x] SubTask 4.4: 优化未登录跳转逻辑（携带 redirect 参数）
  - [x] SubTask 4.5: 添加角色不匹配时的提示和重定向

- [x] Task 5: 优化导航栏菜单权限
  - [x] SubTask 5.1: 修改 `src/components/Header.vue`，使用统一的角色判断逻辑
  - [x] SubTask 5.2: "后台管理"菜单项使用 `v-if="userRole === 'admin'"` 控制显示
  - [x] SubTask 5.3: "创意工坊"菜单项使用 `v-if="userRole !== 'guest'"` 控制显示
  - [x] SubTask 5.4: 添加获取当前用户角色的 computed 属性

- [x] Task 6: 优化用户状态管理
  - [x] SubTask 6.1: 修改 `src/stores/user.js`，统一使用 user_token 和 user_info
  - [x] SubTask 6.2: 在 login action 中保存完整的用户信息（包含 role）
  - [x] SubTask 6.3: 添加获取用户角色的方法

- [x] Task 7: 测试验证
  - [x] SubTask 7.1: 测试普通用户访问创意工坊流程
  - [x] SubTask 7.2: 测试管理员访问后台管理流程
  - [x] SubTask 7.3: 测试普通用户尝试访问后台管理流程
  - [x] SubTask 7.4: 测试登录后菜单显示是否正确
  - [x] SubTask 7.5: 测试 redirect 参数是否正确传递
  - [x] SubTask 7.6: 测试权限验证和提示功能
  - [x] SubTask 7.7: 测试原 `/login` 页面重定向

# Task Dependencies
- Task 2 depends on Task 6（登录逻辑依赖用户状态管理）
- Task 3 depends on Task 1（路由配置依赖登录页处理）
- Task 4 depends on Task 3（路由守卫依赖路由配置）
- Task 5 depends on Task 6（菜单权限依赖用户状态）
- Task 7 depends on all previous tasks
