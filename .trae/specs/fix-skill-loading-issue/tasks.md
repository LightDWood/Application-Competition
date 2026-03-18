# Tasks - 修复需求收敛技能加载问题

## Phase 1: 诊断与准备

### Task 1: 检查当前配置和依赖
- [x] **Task 1.1**: 检查 package.json 中的依赖
  - [x] 确认已安装 `typescript`, `ts-node`
  - [x] 检查版本号是否兼容
  
- [x] **Task 1.2**: 检查 tsconfig.json 配置
  - [x] 查看当前 TypeScript 配置
  - [x] 确认 module 设置
  
- [x] **Task 1.3**: 检查 index.ts 导出方式
  - [x] 查看当前导出语法
  - [x] 确认是否支持 ES Module

---

## Phase 2: 修复技能加载

### Task 2: 更新 TypeScript 配置
- [x] **Task 2.1**: 修改 tsconfig.json
  - [x] 将 `module` 改为 `ESNext`
  - [x] 添加 `ts-node.esm: true` 配置
  - [x] 确保 `moduleResolution` 正确
  
- [x] **Task 2.2**: 验证配置正确性
  - [x] 使用 tsc 检查语法错误
  - [x] 确认配置与 ES Module 兼容

---

### Task 3: 修复 skillService.js 加载逻辑
- [x] **Task 3.1**: 重构 ts-node 注册方式
  - [x] 使用正确的 ES Module API
  - [x] 从 `import('ts-node/esm')` 中解构 `register` 函数
  - [x] 正确调用 register 方法
  
- [x] **Task 3.2**: 优化错误处理
  - [x] 添加详细的错误日志
  - [x] 提供清晰的降级方案
  - [x] 添加故障排查提示
  
- [x] **Task 3.3**: 测试加载逻辑
  - [x] 重启服务器查看日志
  - [x] 确认技能加载成功
  - [x] 验证技能方法可用

---

### Task 4: 验证技能功能
- [ ] **Task 4.1**: 测试 analyze 方法
  - [ ] 调用 analyze 分析示例需求
  - [ ] 验证返回结果包含完整性评分
  - [ ] 验证返回结果包含风险预警
  
- [ ] **Task 4.2**: 测试其他方法
  - [ ] 测试 validate 方法
  - [ ] 测试 buildGraph 方法
  - [ ] 测试 recommend 方法
  
- [ ] **Task 4.3**: 集成测试
  - [ ] 在聊天窗口发送需求
  - [ ] 验证技能被正确调用
  - [ ] 验证输出结果完整

---

## Phase 3: 备选方案（如主方案失败）

### Task 5: 预编译 TypeScript（备选）
- [ ] **Task 5.1**: 添加构建脚本
  - [ ] 在 package.json 添加 build 命令
  - [ ] 配置 TypeScript 编译
  
- [ ] **Task 5.2**: 编译 TypeScript
  - [ ] 运行编译命令
  - [ ] 验证输出文件
  
- [ ] **Task 5.3**: 修改加载逻辑
  - [ ] 改为加载编译后的 JS 文件
  - [ ] 测试加载成功

---

## Task Dependencies

- **Task 1** 不依赖其他任务，可立即开始
- **Task 2** 依赖 Task 1（需要了解当前配置）
- **Task 3** 依赖 Task 2（需要先更新 TS 配置）
- **Task 4** 依赖 Task 3（需要先修复加载逻辑）
- **Task 5** 是备选方案，仅当 Task 3 失败时执行

---

## 实施顺序

```
Step 1: Task 1 - 诊断当前问题（5 分钟）
Step 2: Task 2 - 更新 TS 配置（5 分钟）
Step 3: Task 3 - 修复加载逻辑（15 分钟）
Step 4: Task 4 - 验证功能（10 分钟）
[如失败] Step 5: Task 5 - 备选方案（20 分钟）
```

---

## 预期结果

✅ 服务器启动时显示："✅ 需求收敛技能加载成功"  
✅ 技能所有方法可用  
✅ 聊天时技能被正确调用  
✅ 输出完整的需求分析结果
