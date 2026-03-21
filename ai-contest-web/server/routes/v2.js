import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { sessionService, agentService, configService, routerService, promptBuilder, artifactService } from '../services/core/index.js'
import authMiddleware from '../middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

function loadSpecTemplate() {
  const specPath = path.join(__dirname, '../skills/requirement-convergence/resources/Spec.md')
  try {
    if (fs.existsSync(specPath)) {
      return fs.readFileSync(specPath, 'utf8')
    }
  } catch (error) {
    console.error('Failed to load Spec template:', error.message)
  }
  return null
}

function generateShortTitle(userMessage, assistantMessage) {
  const userContent = typeof userMessage.content === 'string' ? userMessage.content : (userMessage.content?.text || '')
  const assistantContent = typeof assistantMessage.content === 'string' ? assistantMessage.content : (assistantMessage.content?.text || '')

  const patterns = [
    /我要做[一个件款种台套系统]?(.{0,8})/,
    /目标[是是为做]?(.{0,8})/,
    /核心[是是做]?(.{0,8})/,
    /开发[一个件款种台套系统]?(.{0,8})/,
    /构建[一个件款种台套系统]?(.{0,8})/,
  ]

  for (const pattern of patterns) {
    const match = userContent.match(pattern)
    if (match && match[1]) {
      return match[1].trim().slice(0, 10)
    }
  }

  const keywords = []
  const keywordPatterns = [
    /资讯|新闻|信息|文章/g,
    /订阅|推送|通知/g,
    /工具|系统|平台|应用|网站|机器人/g,
    /AI|智能|自动化/g,
    /飞书|钉钉|微信/g,
    /新能源|光伏|储能|风电/g,
  ]

  for (const kp of keywordPatterns) {
    const found = userContent.match(kp)
    if (found) {
      keywords.push(found[0])
      if (keywords.length >= 2) break
    }
  }

  if (keywords.length >= 2) {
    return keywords.join('+').slice(0, 10)
  }

  if (userContent.length <= 10) {
    return userContent
  }

  return userContent.slice(0, 8) + '...'
}

function checkRequirementConvergence(history) {
  const userMessages = history.filter(m => m.role === 'user').map(m => {
    const content = m.content?.text || m.content
    return typeof content === 'string' ? content : ''
  })
  const assistantMessages = history.filter(m => m.role === 'assistant').map(m => {
    const content = m.content?.text || m.content
    return typeof content === 'string' ? content : ''
  })

  const allMessages = userMessages.concat(assistantMessages).join('\n').toLowerCase()

  const convergenceIndicators = {
    '背景': /背景|业务背景|项目背景/.test(allMessages),
    '目标': /目标|设计目标|期望状态/.test(allMessages),
    '用户': /用户|目标用户|使用对象/.test(allMessages),
    '约束': /约束|限制|条件/.test(allMessages),
    '验收标准': /验收|成功标准|acceptance|成功标准/.test(allMessages),
    '痛点': /痛点|问题|困扰/.test(allMessages),
    '方案': /方案|解决方案|solution|设计/.test(allMessages)
  }

  const completedCount = Object.values(convergenceIndicators).filter(Boolean).length
  const totalIndicators = Object.keys(convergenceIndicators).length
  const progressPercent = Math.round((completedCount / totalIndicators) * 100)

  return {
    isConverged: completedCount >= 5,
    progress: progressPercent,
    completedItems: Object.entries(convergenceIndicators)
      .filter(([, completed]) => completed)
      .map(([item]) => item),
    missingItems: Object.entries(convergenceIndicators)
      .filter(([, completed]) => !completed)
      .map(([item]) => item),
    message: completedCount >= 5
      ? '✅ 需求已收敛完成！您可以输入"归档"生成需求文档。'
      : `📊 需求收敛进度: ${completedCount}/${totalIndicators} (${progressPercent}%)。还需补充: ${Object.entries(convergenceIndicators).filter(([,v])=>!v).map(([k])=>k).join('、')}`
  }
}

function generateRequirementDoc(sessionId, history, specTemplate) {
  const userMessages = history.filter(m => m.role === 'user').map(m => m.content?.text || m.content)
  const assistantMessages = history.filter(m => m.role === 'assistant').map(m => m.content?.text || m.content)

  let coreGoal = ''
  let targetUsers = ''
  let successCriteria = ''
  let currentPainPoints = ''
  let constraints = ''

  for (const msg of userMessages) {
    const msgContent = typeof msg === 'string' ? msg : (msg.text || String(msg))
    const lowerMsg = msgContent.toLowerCase()
    if (lowerMsg.includes('资讯订阅') || lowerMsg.includes('新能源')) {
      coreGoal = msgContent
    }
    if (lowerMsg.includes('小团队') || lowerMsg.includes('个人') || lowerMsg.includes('企业')) {
      targetUsers = msgContent
    }
  }

  for (const msg of assistantMessages) {
    const msgContent = typeof msg === 'string' ? msg : (msg.text || String(msg))
    const lowerMsg = msgContent.toLowerCase()
    if (lowerMsg.includes('成功标准') || lowerMsg.includes('观点提炼')) {
      successCriteria = msgContent
    }
    if (lowerMsg.includes('痛点') || lowerMsg.includes('筛选耗时')) {
      currentPainPoints = msgContent
    }
    if (lowerMsg.includes('预算') || lowerMsg.includes('周期') || lowerMsg.includes('3个月')) {
      constraints = msgContent
    }
  }

  const now = new Date().toISOString().split('T')[0]

  return `# 需求规格文档（Spec）

## 1. 基本信息

| 字段 | 内容 |
|------|------|
| 需求名称 | ${coreGoal ? coreGoal.substring(0, 50) : 'AI资讯订阅工具'} |
| 需求编号 | REQ-${Date.now().toString().slice(-6)} |
| 需求类型 | ☑ 功能开发 |
| 提出人 | 用户 |
| 提出日期 | ${now} |
| 需求优先级 | ☐ P0（紧急） ☑ P1（高） ☐ P2（中） ☐ P3（低） |
| 目标版本 | V1.0 |

---

## 2. 设计目标（Expected State）

### 2.1 能力维度与目标

| 能力维度 | 当前状态 | 期望状态 |
|----------|----------|----------|
| 资讯获取 | 人工搜索 | 自动抓取+AI筛选 |
| 信息处理 | 手动筛选 | AI观点提炼 |
| 推送方式 | 无 | 飞书每日早8点推送 |

### 2.2 期望状态描述

实现一个AI资讯订阅工具，自动跟踪新能源领域的资讯，每日早8点通过飞书向用户推送包含观点提炼的每日总结和洞察。

---

## 3. 业务现状分析（Current Space）

### 3.1 当前实现方式

| 项目 | 说明 |
|------|------|
| 现有流程 | 人工搜索、筛选资讯，耗时且效率低 |
| 技术实现 | 手动浏览网站 |
| 用户交互 | 被动等待信息 |

### 3.2 关键优点

| 优点 | 说明 |
|------|------|
| 人工判断准确 | 用户自行判断资讯相关性 |
| 灵活性高 | 可随时调整搜索策略 |

### 3.3 关键不足

| 不足 | 影响 | 严重程度 |
|------|------|----------|
| 信息筛选耗时 | 每天需要花费大量时间 | P1 |
| 容易遗漏重要资讯 | 人工监控难免有疏漏 | P2 |
| 缺乏洞察提炼 | 仅有列表，没有分析 | P2 |

---

## 4. 目标维度分析

### 4.1 消除原方案的缺陷/不足

| 缺陷 | 解决方案 |
|------|----------|
| 信息筛选耗时 | AI自动抓取+智能筛选 |
| 容易遗漏重要资讯 | 设定关键词监控，自动提醒 |
| 缺乏洞察提炼 | LLM生成观点提炼和总结 |

### 4.2 保持原方案的优点

| 优点 | 如何保持 |
|------|----------|
| 人工判断准确 | 提供用户反馈机制，持续优化 |
| 灵活性高 | 支持用户自定义订阅源和关键词 |

### 4.3 不增加系统复杂性

利用现有开源工具和云服务，避免过度设计。

### 4.4 不引入新的缺点/危害

风险：依赖第三方API服务
应对：选择稳定的云服务商，设置降级策略

---

## 5. 方案设计（Solution Design）

### 5.1 理想度评估

#### 方案A（推荐方案）

| 评估维度 | 评分（1-10） | 说明 |
|----------|--------------|------|
| 功能完整性 | 8 | 覆盖订阅、抓取、推送全流程 |
| 技术可行性 | 9 | 采用成熟技术栈 |
| 性能效率 | 8 | 云函数按需执行 |
| 可维护性 | 8 | 模块化设计，易于维护 |
| 安全性 | 8 | 飞书官方API，安全性高 |
| 成本效益 | 9 | 按使用量付费，成本可控 |
| 用户体验 | 8 | 每日定时推送，开箱即用 |
| **总分** | **58** | |

### 5.2 系统架构图

\`\`\`mermaid
graph TB
    subgraph 用户层
        U[用户]
    end
    subgraph 飞书平台
        FB[飞书机器人]
    end
    subgraph 云服务层
        CF[云函数]
        OSS[对象存储]
        SCH[定时调度]
    end
    subgraph 数据层
        RSS[RSS源]
        CRAW[爬虫]
        VDB[向量数据库]
    end
    U <--> FB
    FB <--> CF
    CF <--> RSS
    CF <--> CRAW
    CF <--> OSS
    CF <--> SCH
    CF <--> VDB
\`\`\`

### 5.3 核心服务模块

| 服务名称 | 职责 | 技术栈 |
|----------|------|--------|
| 订阅管理服务 | 管理用户的订阅主题 | Node.js/FastAPI |
| 资讯采集服务 | 抓取RSS和网站内容 | Python爬虫 |
| AI处理服务 | 内容去重、分类、观点提炼 | LLM API |
| 推送服务 | 定时推送飞书消息 | 飞书Webhook |
| 调度服务 | 管理每日定时任务 | 云调度服务 |

### 5.4 用户故事设计

| 故事ID | 标题 | 角色 | 场景 | 目标 |
|--------|------|------|------|------|
| US-001 | 订阅资讯主题 | 团队成员 | 想关注新能源动态 | 设定关键词，系统自动推送 |
| US-002 | 接收每日摘要 | 团队成员 | 每天早上 | 收到飞书推送，了解今日资讯 |
| US-003 | 管理订阅源 | 管理员 | 需要调整来源 | 添加/删除RSS源 |

---

## 6. 非功能性需求

### 6.1 性能要求

| 指标 | 要求 |
|------|------|
| 响应时间 | 消息推送在30秒内完成 |
| 并发能力 | 支持100个用户同时使用 |

### 6.2 安全要求

| 要求项 | 说明 |
|--------|------|
| 认证授权 | 飞书机器人需企业认证 |
| 数据安全 | 用户数据加密存储 |

---

## 7. 接口设计

| 接口名称 | 类型 | 说明 |
|----------|------|------|
| /subscribe | POST | 订阅主题 |
| /unsubscribe | POST | 取消订阅 |
| /getSubscriptions | GET | 获取订阅列表 |
| /webhook/feishu | POST | 飞书回调 |

---

## 8. 数据需求

### 8.1 数据模型

| 表/集合名 | 用途 | 主要字段 |
|-----------|------|----------|
| subscriptions | 订阅配置 | userId, keywords, sources |
| articles | 资讯存储 | url, title, content, timestamp |
| summaries | 摘要记录 | date, summary, insights |

---

## 9. 依赖分析

| 依赖项 | 版本要求 | 备注 |
|--------|----------|------|
| 飞书API | v3 | 消息推送 |
| LLM API | - | 观点提炼 |
| RSS解析库 | - | 资讯采集 |
| 云函数 | - | 部署环境 |

---

## 10. 附录

### 10.1 术语表

| 术语 | 定义 |
|------|------|
| RSS | 简易信息聚合，用于资讯订阅 |
| Webhook | 回调机制，用于飞书推送 |
| LLM | 大语言模型，用于内容分析 |

### 10.2 变更记录

| 版本 | 日期 | 修改内容 |
|------|------|----------|
| 1.0 | ${now} | 初始版本 |
`
}

router.post('/sessions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || 'default-user'
    const { agentId, title } = req.body

    const effectiveUserId = userId || 'default-user'
    const session = sessionService.createSession(effectiveUserId, agentId, title)

    if (!session) {
      return res.status(500).json({
        code: 500,
        message: 'Failed to create session'
      })
    }

    if (title && session.metadata) {
      session.metadata.title = title
    }

    res.status(201).json({
      code: 0,
      message: 'success',
      data: {
        id: session.id,
        userId: session.userId,
        agentId: session.agentId,
        modelId: session.modelId,
        providerId: session.providerId,
        status: session.status,
        title: session.title,
        createdAt: session.createdAt
      }
    })
  } catch (error) {
    console.error('Create session error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '创建会话失败',
      error: error.message
    })
  }
})

router.get('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const session = sessionService.getSession(id)

    if (!session) {
      return res.status(404).json({
        code: 404,
        message: 'Session not found'
      })
    }

    const agent = agentService.getAgent(session.agentId)
    const history = sessionService.getSessionHistory(id)

    res.json({
      code: 0,
      message: 'success',
      data: {
        id: session.id,
        userId: session.userId,
        agentId: session.agentId,
        agentName: agent?.name || 'Unknown',
        modelId: session.modelId,
        providerId: session.providerId,
        status: session.status,
        title: session.title || session.metadata?.title || '新会话',
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        history: history.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content?.text || msg.content,
          createdAt: msg.createdAt
        }))
      }
    })
  } catch (error) {
    console.error('Get session error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取会话失败',
      error: error.message
    })
  }
})

router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || 'default-user'
    const { page = 1, pageSize = 20 } = req.query
    const effectiveUserId = userId || 'default-user'

    const userSessions = sessionService.getUserSessions(effectiveUserId)
    const start = (parseInt(page) - 1) * parseInt(pageSize)
    const end = start + parseInt(pageSize)
    const paginatedSessions = userSessions.slice(start, end)

    res.json({
      code: 0,
      message: 'success',
      data: {
        list: paginatedSessions.map(s => ({
          id: s.id,
          userId: s.userId,
          agentId: s.agentId,
          modelId: s.modelId,
          providerId: s.providerId,
          status: s.status,
          title: s.title || s.metadata?.title,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt
        })),
        total: userSessions.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('List sessions error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取会话列表失败',
      error: error.message
    })
  }
})

router.post('/sessions/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { content, role = 'user' } = req.body

    const session = sessionService.getSession(id)
    if (!session) {
      return res.status(404).json({
        code: 404,
        message: 'Session not found'
      })
    }

    const message = {
      id: null,
      sessionId: id,
      role,
      content: {
        type: 'text',
        text: content
      },
      artifacts: [],
      createdAt: new Date().toISOString()
    }

    sessionService.addMessage(id, message)

    res.status(201).json({
      code: 0,
      message: 'success',
      data: message
    })
  } catch (error) {
    console.error('Add message error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '添加消息失败',
      error: error.message
    })
  }
})

router.post('/sessions/:id/chat', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body

    const session = sessionService.getSession(id)
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      })
    }

    const userMessage = {
      id: null,
      sessionId: id,
      role: 'user',
      content: {
        type: 'text',
        text: content
      },
      artifacts: [],
      createdAt: new Date().toISOString()
    }

    sessionService.addMessage(id, userMessage)

    if (content.includes('归档')) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      try {
        const history = sessionService.getSessionHistory(id)
        const specTemplate = loadSpecTemplate()
        const docContent = generateRequirementDoc(id, history, specTemplate)

        const artifactId = await artifactService.saveArtifact(id, {
          type: 'requirement-doc',
          name: `需求文档_${Date.now()}`,
          content: docContent
        })

        const artifactData = artifactService.getArtifact(artifactId)
        const baseUrl = `${req.protocol}://${req.get('host')}`
        const downloadPath = artifactData ? `${baseUrl}/artifacts/${id}/${artifactData.fileName}` : `${baseUrl}/artifacts/${id}/需求文档_${Date.now()}.md`

        const archiveResponseContent = `✅ 归档成功！\n📄 文档已保存\n📥 下载链接: ${downloadPath}\n`

        res.write(`data: ${JSON.stringify({ type: 'chunk', content: archiveResponseContent })}\n\n`)

        const assistantMessage = {
          id: null,
          sessionId: id,
          role: 'assistant',
          content: {
            type: 'text',
            text: archiveResponseContent
          },
          artifacts: [{ id: artifactId, type: 'requirement-doc', name: `需求文档_${Date.now()}`, path: downloadPath }],
          createdAt: new Date().toISOString()
        }
        sessionService.addMessage(id, assistantMessage)

        await new Promise(resolve => setTimeout(resolve, 50))
        res.write(`data: ${JSON.stringify({ type: 'complete', metadata: { archived: true, artifactId } })}\n\n`)
        res.end()
        return
      } catch (archiveError) {
        console.error('Archive error:', archiveError)
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: '⚠️ 归档过程出现问题，请稍后重试\n' })}\n\n`)
        res.write(`data: ${JSON.stringify({ type: 'complete', metadata: { archived: false, error: archiveError.message } })}\n\n`)
        res.end()
        return
      }
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const agent = agentService.getAgent(session.agentId)
    const skills = agent?.skillIds ? agent.skillIds.map(sid => ({ id: sid })) : []
    const artifacts = []

    const context = {
      session,
      agent,
      skills,
      artifacts
    }

    const routingResult = routerService.routeMessage(userMessage, context)

    if (routingResult.destination === 'skill') {
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: `[Skill routing: ${routingResult.targetId}] ` })}\n\n`)
      await new Promise(resolve => setTimeout(resolve, 100))
      res.write(`data: ${JSON.stringify({ type: 'complete', metadata: { routedTo: routingResult } })}\n\n`)
      res.end()
      return
    }

    const history = sessionService.getSessionHistory(id)
    const promptContext = {
      system: configService.loadSystemConfigMethod(),
      agent,
      skills,
      session,
      activeSkillId: undefined
    }

    const compiledPrompt = promptBuilder.buildPrompt(promptContext, session)

    const modelRequest = {
      modelId: session.modelId,
      messages: [
        { role: 'system', content: compiledPrompt.system + '\n\n' + compiledPrompt.agent },
        ...history.map(m => {
          const content = typeof m.content === 'string' ? m.content : (m.content?.text || '')
          return { role: m.role, content }
        }),
        { role: 'user', content }
      ],
      temperature: compiledPrompt.modelConfig?.temperature ?? 0.7,
      maxTokens: compiledPrompt.modelConfig?.maxTokens ?? 2000,
      topP: compiledPrompt.modelConfig?.topP ?? 1.0
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('API call timeout')), 30000)
    })

    let routeInfo
    try {
      routeInfo = routerService.routeAPI(modelRequest)
      const result = await Promise.race([
        routerService.executeRequest(modelRequest, routeInfo.provider),
        timeoutPromise
      ])

      const assistantMessage = {
        id: null,
        sessionId: id,
        role: 'assistant',
        content: {
          type: 'text',
          text: result.choices?.[0]?.message?.content || ''
        },
        modelId: session.modelId,
        providerId: routeInfo.provider.id,
        artifacts: [],
        createdAt: new Date().toISOString()
      }

      sessionService.addMessage(id, assistantMessage)

      if (session.title === '新会话' || !session.title) {
        const history = sessionService.getSessionHistory(id)
        const userMsgs = history.filter(m => m.role === 'user')
        const assistantMsgs = history.filter(m => m.role === 'assistant')
        if (userMsgs.length > 0 && assistantMsgs.length > 0) {
          const shortTitle = generateShortTitle(userMsgs[userMsgs.length - 1], assistantMsgs[assistantMsgs.length - 1])
          session.title = shortTitle
          session.metadata = session.metadata || {}
          session.metadata.title = shortTitle
        }
      }

      const responseContent = result.choices?.[0]?.message?.content || ''
      for (const char of responseContent) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: char })}\n\n`)
        await new Promise(resolve => setTimeout(resolve, 5))
      }

      const updatedHistory = sessionService.getSessionHistory(id)
      const convergenceStatus = checkRequirementConvergence(updatedHistory)
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: '\n\n' + convergenceStatus.message + '\n' })}\n\n`)

      res.write(`data: ${JSON.stringify({ 
        type: 'complete', 
        metadata: { 
          routedTo: routingResult,
          modelId: session.modelId,
          providerId: routeInfo.provider.id,
          usage: result.usage,
          convergenceStatus: {
            isConverged: convergenceStatus.isConverged,
            progress: convergenceStatus.progress
          }
        }
      })}\n\n`)
      res.end()

    } catch (apiError) {
      console.error('API call error:', apiError)

      const fallbackChain = routerService.getFallbackChain()
      let fallbackSuccess = false
      const currentProviderId = routeInfo?.provider?.id

      for (const provider of fallbackChain) {
        if (currentProviderId && provider.id === currentProviderId) continue

        try {
          const result = await routerService.executeRequest(modelRequest, provider)

          const responseContent = result.choices?.[0]?.message?.content || ''
          for (const char of responseContent) {
            res.write(`data: ${JSON.stringify({ type: 'chunk', content: char })}\n\n`)
            await new Promise(resolve => setTimeout(resolve, 5))
          }

          res.write(`data: ${JSON.stringify({
            type: 'complete',
            metadata: {
              routedTo: routingResult,
              fallbackTo: provider.id
            }
          })}\n\n`)
          res.end()
          fallbackSuccess = true
          break
        } catch (e) {
          console.warn(`Fallback to ${provider.id} failed:`, e.message)
        }
      }

      if (!fallbackSuccess) {
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'AI 服务暂时不可用，请稍后重试' })}\n\n`)
        res.end()
      }
    }

  } catch (error) {
    console.error('Chat error:', error)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || '处理消息失败'
      })
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: '处理消息失败' })}\n\n`)
      res.end()
    }
  }
})

router.delete('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const session = sessionService.getSession(id)

    if (!session) {
      return res.status(404).json({
        code: 404,
        message: 'Session not found'
      })
    }

    sessionService.deleteSession(id)

    res.json({
      code: 0,
      message: 'success'
    })
  } catch (error) {
    console.error('Delete session error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '删除会话失败',
      error: error.message
    })
  }
})

router.put('/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { title } = req.body
    const session = sessionService.getSession(id)

    if (!session) {
      return res.status(404).json({
        code: 404,
        message: 'Session not found'
      })
    }

    if (title !== undefined) {
      session.title = title
      session.metadata = session.metadata || {}
      session.metadata.title = title
    }

    res.json({
      code: 0,
      message: 'success',
      data: session
    })
  } catch (error) {
    console.error('Update session error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '更新会话失败',
      error: error.message
    })
  }
})

router.get('/sessions/:id/artifacts', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const session = sessionService.getSession(id)

    if (!session) {
      return res.status(404).json({
        code: 404,
        message: 'Session not found'
      })
    }

    const requirementDoc = artifactService.getRequirementDoc(id)
    const artifacts = artifactService.listSessionArtifacts(id)

    const baseUrl = `${req.protocol}://${req.get('host')}`
    res.json({
      code: 0,
      message: 'success',
      data: {
        sessionId: id,
        requirementDoc: requirementDoc ? {
          fileName: requirementDoc.fileName,
          downloadUrl: `${baseUrl}/artifacts/${id}/${requirementDoc.fileName}`
        } : null,
        artifacts: artifacts.map(a => ({
          id: a.id,
          type: a.type,
          name: a.name,
          createdAt: a.createdAt,
          downloadUrl: `${baseUrl}/artifacts/${id}/${a.fileName || a.id}.md`
        }))
      }
    })
  } catch (error) {
    console.error('List artifacts error:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取文档列表失败',
      error: error.message
    })
  }
})

export default router