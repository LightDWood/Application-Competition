# Checklist - 重构会话核心服务

## 架构基础设施

- [x] 目录结构规范已创建，包含 config/, agents/, skills/, users/, artifacts/
- [x] TypeScript 实体接口已完整定义（System, User, Agent, Session, Message, Artifact, ModelProvider等）
- [x] 实体间关系映射已定义并验证
- [x] 异常类型已定义（ConstraintViolationError, ProviderNotFoundError, SessionNotFoundError, SkillExecutionError）
- [x] 接口一致性验证通过

## 配置服务

- [x] system.yaml 配置文件符合规范
- [x] providers.yaml 配置文件符合规范（支持Provider抽象）
- [x] ConfigService 类已实现
- [x] detectApiKeyFormat 方法正常工作
- [x] Provider 注册和发现机制正常
- [x] 默认模型选择逻辑正常
- [x] fallbackChain 机制正常

## 路由服务

- [x] RouterService 接口已定义
- [x] API路由选择逻辑正常
- [x] 会话路由机制正常
- [x] 消息路由分发正常
- [x] Provider动态切换正常
- [x] 路由信息监控正常

## API适配器层

- [x] LegacySessionAdapter 已实现并正常工作
- [x] LegacyModelAdapter 已实现并正常工作
- [x] LegacySkillAdapter 已实现并正常工作
- [x] 配置开关切换正常

## Agent服务

- [x] capability.yaml 配置文件符合规范
- [x] soul.yaml 配置文件符合规范
- [x] skills.yaml 配置文件符合规范
- [x] AgentService 类已实现
- [x] Agent实例化逻辑正常
- [x] Soul状态持久化正常
- [x] Agent生命周期管理正常

## 会话服务

- [x] 会话创建和销毁功能正常
- [x] 消息发送和接收功能正常
- [x] 会话上下文管理正常
- [x] User-Agent绑定逻辑正常
- [x] jsonl 存储格式符合规范
- [x] 会话历史加载正常
- [x] 会话恢复机制正常

## 提示词系统

- [x] PromptBuilder 接口已定义
- [x] 四层提示词合并逻辑正常
- [x] 约束冲突检测和解决正常
- [x] Skill边界约束执行正常

## Skill服务

- [x] Skill 目录结构符合规范
- [x] SKILL.md 解析器正常工作
- [x] SkillService 类已实现
- [x] Skill注册和发现机制正常
- [x] Skill脚本执行器正常工作
- [x] Skill资源加载正常
- [x] Skill结果处理正常
- [x] Skill约束验证正常

## 制品服务

- [x] Artifact 实体定义完整
- [x] ArtifactService 类已实现
- [x] 制品存储功能正常
- [x] 制品检索功能正常
- [x] 制品删除功能正常

## 用户服务

- [x] user.yaml 配置文件符合规范
- [x] preferences.yaml 配置文件符合规范
- [x] UserService 类已实现
- [x] 用户偏好管理正常

## 数据迁移

- [x] 会话样例格式分析完成
- [x] 迁移脚本已创建
- [x] 迁移完整性验证通过

## 整体验证

- [x] 所有配置文件格式正确
- [x] 所有服务类可正常实例化
- [x] 实体关系符合需求描述
- [x] 目录结构符合规范
- [x] 代码无语法错误
- [x] 接口一致性验证通过

## 业务流程验证

- [x] 会话创建流程逻辑正确
- [x] 消息处理流程逻辑正确
- [x] Skill边界约束执行流程逻辑正确
- [x] Provider回退机制逻辑正确
- [x] 异常处理逻辑完整
