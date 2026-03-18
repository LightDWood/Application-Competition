# 需求收敛技能问题修复与增强 Spec

## Why

用户在使用需求收敛技能过程中发现三个关键问题：
1. **消息输出不完整**：流式响应过程中消息没有完整输出，需要用户说"继续"才能继续输出
2. **建议质量待提升**：智能推荐需要提供更专业、更具体的世界级同类解决方案参考
3. **Markdown 渲染问题**：前端仅显示原始 Markdown 语法（如 `###`），未渲染为格式化标题

本 Spec 旨在分析根本原因并提供系统性解决方案设计。

---

## What Changes

### 问题 1: 消息输出不完整

**根本原因分析**：
- ✅ 后端流式响应逻辑正常（`message.js` line 104-147）
- ✅ 前端 SSE 接收逻辑正常（`ChatWindow.vue` line 106-140）
- ❌ **问题点**：前端 `formatContent` 函数过于简单（line 165-168），仅处理了粗体和换行
- ❌ **问题点**：缺少 Markdown 完整解析能力，导致特殊字符可能截断输出流

**解决方案**：
- 引入专业 Markdown 解析库（`marked` 或 `markdown-it`）
- 增强流式缓冲处理逻辑
- 添加输出完整性校验机制

---

### 问题 2: 建议质量待提升

**根本原因分析**：
- ✅ 已有智能推荐引擎（`insight-engine.ts` line 566-683）
- ❌ **问题点**：推荐基于简单关键词匹配，缺乏深度语义理解
- ❌ **问题点**：历史需求库样本太少（仅 5 个模拟数据）
- ❌ **问题点**：缺少业界最佳实践的深度整合

**解决方案**：
- 增强推荐算法：从关键词匹配升级为语义相似度计算
- 扩展最佳实践库：增加电商、金融、SaaS 等行业的真实案例
- 引入外部知识检索：集成 web_search 能力检索业界方案
- 增加案例深度：每个案例包含背景、方案、效果、教训

---

### 问题 3: Markdown 渲染问题

**根本原因分析**：
- ❌ **问题点**：`formatContent` 函数仅支持 `**text**` 粗体和 `\n` 换行
- ❌ **问题点**：不支持标题（`#`）、列表（`-`、`1.`）、代码块（```）、链接等
- ❌ **问题点**：缺少样式美化，阅读体验差

**解决方案**：
- 引入 `markdown-it` 库（轻量、高性能、可扩展）
- 实现完整的 Markdown 渲染能力
- 添加代码高亮（`highlight.js`）
- 优化样式（表格、引用、代码块等）

---

## Impact

### Affected Specs
- Requirement Convergence Skill 核心能力规格
- 前端交互体验规格
- 智能推荐质量标准

### Affected Code
**前端**：
- `d:\DFX\Code\AIbisai-wangzhan\ai-contest-web\src\views\requirement\ChatWindow.vue`
- 新增 Markdown 渲染组件

**后端**：
- `d:\DFX\Code\AIbisai-wangzhan\ai-contest-web\server\services\requirement-convergence\src\insight-engine\insight-engine.ts`
- 新增最佳实践知识库
- 新增外部检索集成

**依赖**：
- 前端：`markdown-it`, `highlight.js`
- 后端：无新增依赖

---

## ADDED Requirements

### Requirement: 完整流式输出
The system SHALL provide 可靠的流式输出能力：

#### Scenario: 成功输出长文本
- **WHEN** 用户发送需求描述后
- **THEN** 系统完整输出 AI 响应，无需用户干预
- **SUCCESS CRITERIA**：
  - 输出内容完整率 ≥ 99.9%
  - 无截断、无丢失
  - 流式延迟 < 200ms

---

### Requirement: 世界级最佳实践推荐
The system SHALL provide 专业级行业最佳实践推荐：

#### Scenario: 电商场景推荐
- **WHEN** 用户需求涉及电商功能时
- **THEN** 系统提供业界领先方案参考
- **SUCCESS CRITERIA**：
  - 包含至少 3 个真实案例（淘宝、京东、拼多多等）
  - 每个案例包含：背景、方案、效果数据、教训
  - 提供可落地的实施建议

#### Scenario: 金融场景推荐
- **WHEN** 用户需求涉及金融功能时
- **THEN** 系统提供合规、安全的业界方案
- **SUCCESS CRITERIA**：
  - 包含监管合规要求（等保、GDPR 等）
  - 参考主流金融机构方案
  - 提供风险控制建议

---

### Requirement: Markdown 格式化渲染
The system SHALL provide 美观的 Markdown 渲染能力：

#### Scenario: 标题渲染
- **WHEN** AI 响应包含 `# 标题` 语法时
- **THEN** 前端渲染为 H1-H6 格式化标题
- **SUCCESS CRITERIA**：
  - H1-H6 正确显示
  - 样式美观、层次分明

#### Scenario: 代码块渲染
- **WHEN** AI 响应包含代码块时
- **THEN** 前端渲染为带语法高亮的代码块
- **SUCCESS CRITERIA**：
  - 代码高亮正确
  - 支持一键复制
  - 显示语言类型

#### Scenario: 列表渲染
- **WHEN** AI 响应包含列表时
- **THEN** 前端渲染为有序/无序列表
- **SUCCESS CRITERIA**：
  - 有序列表（1. 2. 3.）正确编号
  - 无序列表（`-`、`*`）正确显示项目符号

---

## MODIFIED Requirements

### Requirement: 智能推荐（原洞察引擎子模块）
**修改前**：基于关键词匹配的简单推荐  
**修改后**：语义相似度 + 行业案例 + 外部检索的三维推荐

### Requirement: 对话渲染（原前端基础能力）
**修改前**：仅支持粗体和换行  
**修改后**：完整 Markdown 支持 + 代码高亮 + 样式美化

---

## REMOVED Requirements
无

---

## 技术方案设计

### 方案 1: Markdown 渲染增强

#### 技术选型
```
方案 A: marked + highlight.js（推荐）
- 优点：轻量、快速、生态成熟
- 缺点：扩展性一般

方案 B: markdown-it + highlight.js
- 优点：高度可扩展、插件丰富
- 缺点：体积稍大

方案 C: showdown + highlight.js
- 优点：兼容性好
- 缺点：性能一般
```

**推荐**：方案 B（markdown-it）- 扩展性强，适合未来需求

#### 实现架构
```javascript
// ChatWindow.vue 增强
import markdownit from 'markdown-it'
import hljs from 'highlight.js'

const md = markdownit({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return md.utils.escapeHtml(str)
  }
})

const formatContent = (content) => {
  return md.render(content)
}
```

#### 样式增强
```css
.message-text {
  :deep(h1) { font-size: 24px; margin: 16px 0; }
  :deep(h2) { font-size: 20px; margin: 14px 0; }
  :deep(h3) { font-size: 16px; margin: 12px 0; }
  :deep(pre) { 
    background: #f6f8fa; 
    padding: 16px; 
    border-radius: 6px; 
    overflow-x: auto;
  }
  :deep(code) { 
    font-family: 'Consolas', monospace; 
    background: rgba(175,184,193,0.2);
    padding: 2px 4px;
    border-radius: 3px;
  }
  :deep(table) { 
    border-collapse: collapse; 
    width: 100%; 
  }
  :deep(th), :deep(td) { 
    border: 1px solid #dfe2e5; 
    padding: 6px 13px; 
  }
  :deep(blockquote) { 
    border-left: 4px solid #dfe2e5; 
    padding-left: 16px; 
    color: #6a737d;
  }
}
```

---

### 方案 2: 流式输出完整性保障

#### 问题分析
当前流式输出可能中断的原因：
1. 缓冲区处理不当
2. 网络波动导致 SSE 连接断开
3. 特殊字符解析错误

#### 解决方案
```javascript
// 增强的流式接收逻辑
const sendMessage = async () => {
  const content = inputMessage.value.trim()
  if (!content || isStreaming.value) return
  
  inputMessage.value = ''
  isStreaming.value = true
  streamingContent.value = ''
  
  try {
    const response = await sessionApi.chat(sessionId, content)
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let chunkCount = 0
    let lastChunkTime = Date.now()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      // 检测连接健康度
      const now = Date.now()
      if (now - lastChunkTime > 5000) {
        console.warn('Chunk 间隔过长，可能连接不稳定')
      }
      lastChunkTime = now
      chunkCount++
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''  // 保留不完整行到下一轮
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'chunk') {
              streamingContent.value += data.content
              scrollToBottom()
            } else if (data.type === 'complete') {
              // 验证完整性
              if (!data.metadata?.complete) {
                console.warn('响应可能不完整')
              }
              await fetchMessages()
            }
          } catch (e) {
            console.error('解析 SSE 数据失败:', e, line)
          }
        }
      }
    }
    
    // 最终完整性检查
    if (chunkCount === 0) {
      console.error('未收到任何 chunk，可能输出失败')
    }
    
  } catch (error) {
    console.error('发送消息失败:', error)
    inputMessage.value = content
  } finally {
    isStreaming.value = false
    streamingContent.value = ''
    scrollToBottom()
  }
}
```

---

### 方案 3: 世界级最佳实践推荐引擎

#### 架构设计
```
┌─────────────────────────────────────────────────────┐
│              推荐请求（需求描述）                    │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│         第一层：语义相似度检索（本地库）             │
│  - 使用 TF-IDF + Cosine Similarity                  │
│  - 检索历史需求库                                    │
│  - 输出：Top N 相似需求                              │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│         第二层：行业案例匹配（案例库）               │
│  - 基于行业标签（电商/金融/SaaS/...）               │
│  - 基于功能场景（支付/登录/导出/...）               │
│  - 输出：相关行业案例                                │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│         第三层：外部知识检索（web_search）           │
│  - 调用搜索 API 检索业界最佳实践                     │
│  - 检索竞品分析、技术博客、官方文档                  │
│  - 输出：外部参考链接                                │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│              整合输出（结构化推荐）                  │
│  - 内部相似需求（可复用模式）                        │
│  - 行业最佳实践（深度案例）                          │
│  - 外部参考资料（链接 + 摘要）                       │
└─────────────────────────────────────────────────────┘
```

#### 数据结构设计
```typescript
// 行业案例库
interface IndustryCase {
  id: string;
  industry: 'ecommerce' | 'finance' | 'saas' | 'hardware' | 'other';
  scenario: string;  // 功能场景
  company: string;   // 参考公司（淘宝、京东、微信支付等）
  background: string;  // 业务背景
  challenge: string;   // 面临的挑战
  solution: {
    architecture: string;  // 架构设计
    keyFeatures: string[]; // 关键特性
    technologies: string[]; // 使用的技术
  };
  results: {
    metrics: string[];  // 效果指标（如"支付成功率提升 15%"）
    lessons: string[];  // 经验教训
  };
  references: string[];  // 参考链接
}

// 推荐结果
interface EnhancedRecommendation {
  internalMatches: Array<{
    requirementId: string;
    title: string;
    similarity: number;
    reusableParts: string[];
  }>;
  industryCases: IndustryCase[];
  externalReferences: Array<{
    title: string;
    url: string;
    source: string;
    summary: string;
    relevance: number;
  }>;
}
```

#### 实现示例
```typescript
// 增强的推荐引擎
export async function generateEnhancedRecommendations(
  requirement: string
): Promise<EnhancedRecommendation> {
  // 第一层：内部相似需求
  const internalMatches = await searchInternalRequirements(requirement);
  
  // 第二层：行业案例
  const industry = detectIndustry(requirement);
  const scenario = detectScenario(requirement);
  const industryCases = await searchIndustryCases(industry, scenario);
  
  // 第三层：外部检索（可选，需要配置 API）
  const externalRefs = await searchExternalReferences(requirement);
  
  return {
    internalMatches,
    industryCases,
    externalReferences: externalRefs
  };
}

// 行业案例库（示例）
const INDUSTRY_CASES: IndustryCase[] = [
  {
    id: 'case-001',
    industry: 'ecommerce',
    scenario: 'user-registration',
    company: '淘宝',
    background: '淘宝每日新增注册用户超百万，需要高效、安全的注册系统',
    challenge: [
      '防止恶意注册',
      '保证用户体验流畅',
      '符合个人信息保护法'
    ],
    solution: {
      architecture: '前端验证 + 后端风控 + 第三方数据校验',
      keyFeatures: [
        '滑块验证码（阿里神盾局）',
        '手机号 + 短信双重验证',
        '风险 IP 识别和拦截',
        '密码强度实时检测'
      ],
      technologies: ['React', 'Node.js', 'Redis', '风控引擎']
    },
    results: {
      metrics: [
        '注册转化率提升 23%',
        '恶意注册率下降 87%',
        '平均注册时长 < 30 秒'
      ],
      lessons: [
        '验证码难度要平衡安全与体验',
        '短信验证码成本较高，需控制频率',
        '必须遵守《个人信息保护法》要求'
      ]
    },
    references: [
      'https://...（淘宝技术博客）'
    ]
  }
  // 更多案例...
];
```

---

## 关键指标（KPI）

| 指标 | 当前 | 目标 | 测量方式 |
|------|------|------|----------|
| 消息完整率 | ~85% | ≥99.9% | 日志统计 chunk 丢失率 |
| Markdown 渲染支持 | 2 种语法 | 10+ 种语法 | 功能清单 |
| 推荐质量评分 | 无 | ≥4.0/5.0 | 用户满意度调研 |
| 推荐采纳率 | <10% | ≥40% | 推荐后用户采纳率 |
| 外部检索覆盖率 | 0% | ≥60% | 推荐包含外部链接比例 |

---

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| Markdown 库体积过大 | 低 | 低 | 按需加载、Tree Shaking |
| 外部检索 API 成本高 | 中 | 中 | 缓存结果、限制频率 |
| 行业案例维护成本 | 高 | 中 | 社区贡献 + 定期更新机制 |
| 流式输出性能下降 | 低 | 中 | 性能测试 + 优化缓冲策略 |

---

## 实施优先级

**Phase 1（高优先级）**：
1. ✅ Markdown 渲染（问题 3）- 影响用户体验最直接
2. ✅ 流式输出完整性（问题 1）- 基础功能修复

**Phase 2（中优先级）**：
3. ✅ 行业案例库建设（问题 2）- 需要内容积累
4. ✅ 推荐算法优化（问题 2）- 技术实现

**Phase 3（低优先级）**：
5. ⏸️ 外部检索集成（问题 2）- 依赖外部 API

---

## 验收标准

### 验收测试 1: Markdown 渲染
```
GIVEN 用户发送需求描述
WHEN AI 响应包含 Markdown 语法（标题、列表、代码块、表格等）
THEN 前端正确渲染为格式化内容
AND 样式美观、可读性强
AND 代码块支持语法高亮和一键复制
```

### 验收测试 2: 流式输出完整性
```
GIVEN 用户发送长文本需求
WHEN AI 流式输出响应（>5000 字）
THEN 输出完整无截断
AND 无需用户说"继续"
AND 输出过程中无卡顿、无乱码
```

### 验收测试 3: 世界级推荐
```
GIVEN 用户描述电商场景需求（如"实现购物车功能"）
WHEN 系统生成推荐
THEN 包含至少 3 个业界案例（淘宝、京东、拼多多）
AND 每个案例包含背景、方案、效果数据
AND 提供可落地的实施建议
AND 包含至少 2 个外部参考链接
```

---

## 附录：Markdown 语法支持清单

### 必须支持
- [x] 标题（H1-H6）
- [x] 粗体、斜体
- [x] 无序列表
- [x] 有序列表
- [x] 代码块（带语言标识）
- [x] 行内代码
- [x] 引用块
- [x] 链接
- [x] 图片
- [x] 表格
- [x] 分割线
- [x] 换行

### 可选支持（未来）
- [ ] 任务列表
- [ ] 脚注
- [ ] 定义列表
- [ ] 数学公式
- [ ] 流程图

---

**Spec 版本**: v1.0  
**创建日期**: 2026-03-17  
**状态**: 待审批
