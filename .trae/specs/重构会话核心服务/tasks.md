# Tasks - 重构会话核心服务

## 阶段一：架构基础设施

- [x] Task 1: 创建统一的目录结构规范
  - [x] SubTask 1.1: 创建 config/ 目录结构（system.yaml, providers.yaml, agents/）
  - [x] SubTask 1.2: 创建 agents/ 目录结构（sessions/ 子目录）
  - [x] SubTask 1.3: 创建 skills/ 目录结构（scripts/, resources/ 子目录）
  - [x] SubTask 1.4: 创建 users/ 目录结构
  - [x] SubTask 1.5: 创建 artifacts/ 目录结构

- [x] Task 2: 定义核心实体和数据模型
  - [x] SubTask 2.1: 定义所有TypeScript接口（System, User, Agent, Session, Message, Artifact等）
  - [x] SubTask 2.2: 定义实体间关系映射
  - [x] SubTask 2.3: 定义异常类型（ConstraintViolationError, ProviderNotFoundError等）
  - [x] SubTask 2.4: 验证接口一致性

## 阶段二：配置服务

- [x] Task 3: 实现系统配置管理
  - [x] SubTask 3.1: 创建 system.yaml 配置文件结构
  - [x] SubTask 3.2: 创建 providers.yaml 配置文件结构（参考OpenClaw）
  - [x] SubTask 3.3: 实现 ConfigService 类
  - [x] SubTask 3.4: 实现 detectApiKeyFormat 方法
  - [x] SubTask 3.5: 实现 Provider 注册和发现机制

- [x] Task 4: 实现多模型API路由
  - [x] SubTask 4.1: 实现模型配置加载器
  - [x] SubTask 4.2: 实现默认模型选择逻辑
  - [x] SubTask 4.3: 实现模型切换机制
  - [x] SubTask 4.4: 实现 fallbackChain 机制

## 阶段三：路由服务

- [x] Task 5: 实现RouterService
  - [x] SubTask 5.1: 设计API路由选择逻辑
  - [x] SubTask 5.2: 实现会话路由机制
  - [x] SubTask 5.3: 实现消息路由分发
  - [x] SubTask 5.4: 实现Provider动态切换
  - [x] SubTask 5.5: 实现路由信息监控

- [x] Task 6: 实现API适配器层
  - [x] SubTask 6.1: 创建LegacySessionAdapter
  - [x] SubTask 6.2: 创建LegacyModelAdapter
  - [x] SubTask 6.3: 创建LegacySkillAdapter
  - [x] SubTask 6.4: 实现配置开关切换

## 阶段四：Agent服务

- [x] Task 7: 实现Agent定义管理
  - [x] SubTask 7.1: 创建 capability.yaml 配置文件结构
  - [x] SubTask 7.2: 创建 soul.yaml 配置文件结构
  - [x] SubTask 7.3: 创建 skills.yaml 配置文件结构
  - [x] SubTask 7.4: 实现 AgentService 类
  - [x] SubTask 7.5: 实现Agent实例化逻辑

- [x] Task 8: 实现Agent生命周期管理
  - [x] SubTask 8.1: 实现Agent创建和初始化
  - [x] SubTask 8.2: 实现Soul状态持久化
  - [x] SubTask 8.3: 实现Agent销毁逻辑

## 阶段五：会话服务

- [x] Task 9: 实现会话管理
  - [x] SubTask 9.1: 实现会话创建和销毁
  - [x] SubTask 9.2: 实现消息发送和接收
  - [x] SubTask 9.3: 实现会话上下文管理
  - [x] SubTask 9.4: 实现User-Agent绑定逻辑

- [x] Task 10: 实现会话持久化
  - [x] SubTask 10.1: 设计 jsonl 存储格式
  - [x] SubTask 10.2: 实现会话历史加载
  - [x] SubTask 10.3: 实现会话恢复机制

## 阶段六：提示词系统

- [x] Task 11: 实现PromptBuilder
  - [x] SubTask 11.1: 实现四层提示词合并逻辑
  - [x] SubTask 11.2: 实现约束冲突检测和解决
  - [x] SubTask 11.3: 实现Skill边界约束执行

## 阶段七：Skill服务

- [x] Task 12: 实现Skill管理
  - [x] SubTask 12.1: 创建 Skill 目录结构
  - [x] SubTask 12.2: 实现 SKILL.md 解析器
  - [x] SubTask 12.3: 实现 SkillService 类
  - [x] SubTask 12.4: 实现Skill注册和发现机制

- [x] Task 13: 实现Skill调用
  - [x] SubTask 13.1: 实现Skill脚本执行器
  - [x] SubTask 13.2: 实现Skill资源加载
  - [x] SubTask 13.3: 实现Skill结果处理
  - [x] SubTask 13.4: 实现Skill约束验证

## 阶段八：制品服务

- [x] Task 14: 实现制品管理
  - [x] SubTask 14.1: 实现 Artifact 实体定义
  - [x] SubTask 14.2: 实现 ArtifactService 类
  - [x] SubTask 14.3: 实现制品存储逻辑
  - [x] SubTask 14.4: 实现制品检索逻辑
  - [x] SubTask 14.5: 实现制品删除逻辑

## 阶段九：用户服务

- [x] Task 15: 实现用户管理
  - [x] SubTask 15.1: 创建 user.yaml 配置文件结构
  - [x] SubTask 15.2: 创建 preferences.yaml 配置文件结构
  - [x] SubTask 15.3: 实现 UserService 类
  - [x] SubTask 15.4: 实现用户偏好管理

## 阶段十：数据迁移

- [x] Task 16: 会话样例数据迁移
  - [x] SubTask 16.1: 分析会话样例格式
  - [x] SubTask 16.2: 创建迁移脚本
  - [x] SubTask 16.3: 验证迁移完整性

## Task Dependencies

- [x] All dependencies resolved
