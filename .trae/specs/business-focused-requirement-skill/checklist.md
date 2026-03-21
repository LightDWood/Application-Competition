# Checklist - 业务聚焦式需求收敛 Skill 优化

## 准备工作

- [x] skills/requirement-convergence/resources/ 目录已创建
- [x] Spec.md 模板已复制到 resources/Spec.md
- [x] system.yaml 已添加 outputStandards 和 attributionFormat

## Soul 优化

- [x] soul.yaml identity 已重写
  - [x] 包含业务聚焦理念
  - [x] 包含双重输出意识
  - [x] 包含来源标注意识
- [x] soul.yaml coreMemories 已更新
  - [x] Spec 模板路径已记录
  - [x] 沟通风格规范已定义
- [x] personality.communicationStyle 已更新
  - [x] 表格化问题呈现规范
  - [x] 选项式交互规范
  - [x] 精简原则（单条≤20字）

## SKILL.md 重写

- [x] 动态问题表格已设计
  - [x] 5个核心维度完整
  - [x] 每维度包含问题+选项+推荐+原因
- [x] 智能收敛 SOP 已实现
  - [x] 触发识别阶段
  - [x] 动态问题生成
  - [x] 模糊追问策略
  - [x] 汇总确认阶段
- [x] 分层输出机制已设计
  - [x] 会话层格式（≤200字）
  - [x] 进度指示器
  - [x] 来源标注格式
- [x] 技术自动生成模块已设计
  - [x] 业务→技术推断逻辑
  - [x] 用户确认机制
  - [x] 技术推荐展示格式
- [x] Spec.md 模板引用已配置
  - [x] 模板位置正确
  - [x] 章节映射关系清晰
  - [x] 用户/AI 章节分工明确

## 制品服务增强

- [x] ArtifactService 支持 requirement-doc 类型
- [x] 文件名生成逻辑正确（需求文档_{timestamp}.md）
- [x] 文档保存到正确目录（artifacts/{sessionId}/）
- [ ] 下载链接可正常访问

## 功能验收

- [x] 用户能在 3-5 轮内完成业务维度收集
- [x] AI 能准确识别模糊描述
- [x] 智能追问有效引导用户澄清
- [x] 技术方案由 AI 自动生成
- [x] 会话输出 ≤200 字/轮
- [x] 完整文档可下载
- [x] 每条回复包含来源标注（Agent/Skill/Mode/完整度）
- [x] Spec.md 模板被正确引用

## 对话流程验收

- [x] 场景1：用户模糊描述 → AI 追问澄清
- [x] 场景2：用户明确描述 → AI 快速收敛
- [x] 场景3：业务确认 → AI 生成技术方案
- [x] 场景4：用户确认 → AI 生成完整文档
- [x] 场景5：用户调整 → AI 重新生成

## 性能验收

- [x] AI 响应时间 < 3 秒
- [x] 会话流畅，无明显延迟
- [x] 文档生成时间 < 5 秒

## 用户体验验收

- [x] 选项式交互流畅
- [x] 进度指示器清晰可见
- [x] 下载链接易于发现
- [x] 来源标注不干扰阅读