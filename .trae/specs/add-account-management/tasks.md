# Tasks

- [x] Task 1: 数据库模型层 - 添加用户角色字段
  - [x] SubTask 1.1: 修改 User.js 模型，添加 role 字段（'user' | 'admin'）
  - [x] SubTask 1.2: 创建数据库迁移脚本，为现有用户添加默认角色
  - [x] SubTask 1.3: 创建默认管理员账号（admin/admin123）

- [x] Task 2: 后端 API 层 - 实现用户管理接口
  - [x] SubTask 2.1: 创建 admin 路由文件，实现管理员专用接口
  - [x] SubTask 2.2: 实现 GET /api/admin/users（获取用户列表，支持分页、搜索、筛选）
  - [x] SubTask 2.3: 实现 GET /api/admin/users/:id（获取用户详情）
  - [x] SubTask 2.4: 实现 DELETE /api/admin/users/:id（删除用户）
  - [x] SubTask 2.5: 实现 PUT /api/admin/users/:id/role（更新用户角色）
  - [x] SubTask 2.6: 添加管理员权限验证中间件

- [x] Task 3: 前端 API 层 - 添加用户管理 API 调用
  - [x] SubTask 3.1: 修改 src/api/user.js，添加用户管理相关方法
  - [x] SubTask 3.2: 添加获取用户列表方法（支持分页参数）
  - [x] SubTask 3.3: 添加删除用户方法
  - [x] SubTask 3.4: 添加更新用户角色方法

- [x] Task 4: 后台管理页面 - 添加账号管理 Tab
  - [x] SubTask 4.1: 修改 TrainingAdmin.vue，添加第四个 Tab（账号管理）
  - [x] SubTask 4.2: 实现用户列表展示（序号、用户名、邮箱、角色、注册时间）
  - [x] SubTask 4.3: 实现搜索框和角色筛选器
  - [x] SubTask 4.4: 实现"查看文档"按钮跳转逻辑
  - [x] SubTask 4.5: 实现"删除用户"功能
  - [x] SubTask 4.6: 实现分页功能

- [x] Task 5: 导航栏权限控制 - 根据角色显示菜单
  - [x] SubTask 5.1: 修改 Header.vue，添加角色判断逻辑
  - [x] SubTask 5.2: "后台管理"菜单项仅对管理员显示
  - [x] SubTask 5.3: 添加获取当前用户角色的方法

- [x] Task 6: 登录页面 - 优化登录跳转逻辑
  - [x] SubTask 6.1: 修改 Login.vue，登录成功后判断用户角色
  - [x] SubTask 6.2: 管理员跳转到后台管理页面
  - [x] SubTask 6.3: 一般用户跳转到创意工坊或 redirect 参数指定的页面

- [x] Task 7: 路由守卫 - 增强权限验证
  - [x] SubTask 7.1: 修改 router/index.js，添加角色验证逻辑
  - [x] SubTask 7.2: 后台管理页面验证管理员角色
  - [x] SubTask 7.3: 非管理员访问后台管理时拒绝并跳转

- [x] Task 8: 用户注册 - 添加默认角色
  - [x] SubTask 8.1: 修改 Register.vue，注册时默认角色为'user'
  - [x] SubTask 8.2: 修改后端注册接口，接受并存储角色字段

- [ ] Task 9: 测试验证
  - [ ] SubTask 9.1: 测试管理员登录和跳转
  - [ ] SubTask 9.2: 测试一般用户登录和跳转
  - [ ] SubTask 9.3: 测试账号管理 Tab 功能
  - [ ] SubTask 9.4: 测试搜索和筛选功能
  - [ ] SubTask 9.5: 测试查看文档跳转
  - [ ] SubTask 9.6: 测试删除用户功能
  - [ ] SubTask 9.7: 测试导航栏权限控制
  - [ ] SubTask 9.8: 测试路由守卫权限验证

# Task Dependencies
- Task 2 depends on Task 1（API 依赖数据模型）
- Task 3 depends on Task 2（前端 API 依赖后端接口）
- Task 4 depends on Task 3（页面依赖前端 API）
- Task 5 depends on Task 1（角色判断依赖用户数据）
- Task 6 depends on Task 1（登录跳转依赖角色字段）
- Task 7 depends on Task 1（路由守卫依赖角色字段）
- Task 8 depends on Task 1（注册依赖角色字段）
- Task 9 depends on all previous tasks
