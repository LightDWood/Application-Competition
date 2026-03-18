# Checklist - 修复需求收敛技能加载问题

## Phase 1: 诊断与准备

### Task 1: 检查当前配置和依赖
- [x] 检查 package.json 确认已安装 `typescript` 和 `ts-node`
- [x] 记录 TypeScript 和 ts-node 版本号
- [x] 查看 tsconfig.json 完整配置
- [x] 记录当前 `module` 和 `moduleResolution` 设置
- [x] 查看 index.ts 导出语法
- [x] 确认是否使用 ES Module 或 CommonJS

---

## Phase 2: 修复技能加载

### Task 2: 更新 TypeScript 配置
- [x] 修改 tsconfig.json 中的 `module` 为 `ESNext`
- [x] 添加 `ts-node.esm: true` 配置
- [x] 确保 `moduleResolution` 设置为 `node` 或 `bundler`
- [x] 保存后无语法错误
- [x] 配置与 ES Module 兼容

---

### Task 3: 修复 skillService.js 加载逻辑
- [x] 重构 ts-node 注册代码
- [x] 正确从 `import('ts-node/esm')` 解构 `register` 函数
- [x] 调用 `register()` 时传入正确参数
- [x] 添加详细的错误日志输出
- [x] 提供清晰的降级方案和错误提示
- [x] 重启服务器
- [x] 控制台显示 "✅ 需求收敛技能加载成功"
- [x] 无 TypeScript 加载错误

---

### Task 4: 验证技能功能
- [ ] 调用 analyze 方法测试
- [ ] 返回结果包含 `completeness` 字段
- [ ] 返回结果包含 `risks` 或 `riskWarning` 字段
- [ ] 调用 validate 方法测试
- [ ] 调用 buildGraph 方法测试
- [ ] 调用 recommend 方法测试
- [ ] 在聊天窗口发送测试需求
- [ ] 观察到技能调用日志（"📊 [技能调用]..."）
- [ ] 输出包含结构化分析结果
- [ ] 响应时间 < 2 秒

---

## Phase 3: 备选方案（如主方案失败）

### Task 5: 预编译 TypeScript
- [ ] package.json 添加 build 脚本
- [ ] 运行 `npm run build:skill` 或类似命令
- [ ] dist 目录生成编译后的 JS 文件
- [ ] 修改加载逻辑指向 dist/index.js
- [ ] 重启服务器测试

---

## 整体验收

### 技能加载验收
- [ ] 服务器启动无错误
- [ ] 控制台显示技能加载成功日志
- [ ] 技能服务对象非 null
- [ ] 所有方法（analyze, validate, buildGraph, recommend）可调用

### 技能功能验收
- [ ] analyze 返回完整分析结果
- [ ] 完整性评分正确计算
- [ ] 风险预警正确识别
- [ ] 依赖关系正确发现
- [ ] 智能推荐正常工作

### 集成验收
- [ ] 聊天时技能被触发
- [ ] 输出格式化的分析结果
- [ ] 包含完整性评估部分
- [ ] 包含风险预警部分
- [ ] 包含引导性问题
- [ ] 用户界面显示正常

---

## 性能验收

- [ ] 技能加载时间 < 1 秒
- [ ] analyze 响应时间 < 2 秒
- [ ] 无明显性能问题
- [ ] 内存使用正常

---

## 文档更新

- [ ] 更新 README 说明技能加载方式
- [ ] 记录故障排查步骤
- [ ] 添加配置说明文档

---

**Checklist 版本**: v1.0  
**创建日期**: 2026-03-18
