/**
 * 会话功能全流程测试脚本
 * 模拟用户操作：会话列表 → 会话详情 → 需求收敛对话 → 归档 → 查看文档
 */

const API_BASE = 'http://localhost:3000/api/v2'
const SESSION_ID = '3434a043-c01b-4a79-8149-8302918fb9f3'
const USER_ID = 'default-user'

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function logSection(title) {
  console.log('\n' + '='.repeat(80))
  console.log(`📋 ${title}`)
  console.log('='.repeat(80))
}

async function testStep1_sessionList() {
  logSection('步骤1: 进入会话列表页面')

  console.log('\n[Console] 页面加载 SessionList.vue')
  console.log('[Console] 调用 sessionApi.v2.list()')

  try {
    const response = await fetch(`${API_BASE}/sessions?userId=${USER_ID}&page=1&pageSize=20`)
    const data = await response.json()

    console.log('\n[Network] GET /v2/sessions')
    console.log('[Response]', JSON.stringify(data, null, 2))

    if (data.success) {
      console.log(`\n[Console] ✅ 获取会话列表成功，共 ${data.data.total} 个会话`)

      if (data.data.list && data.data.list.length > 0) {
        console.log('\n[会话列表]')
        data.data.list.forEach((session, index) => {
          console.log(`  ${index + 1}. ID: ${session.id}`)
          console.log(`     标题: ${session.title}`)
          console.log(`     状态: ${session.status}`)
          console.log(`     创建时间: ${session.createdAt}`)
          console.log('')
        })

        const targetSession = data.data.list.find(s => s.id === SESSION_ID)
        if (targetSession) {
          console.log(`[Console] ✅ 找到目标会话: ${targetSession.title}`)
        } else {
          console.log(`[Console] ⚠️ 未找到指定会话 ${SESSION_ID}，使用第一个会话`)
        }
      }
    } else {
      console.log('[Console] ❌ 获取会话列表失败:', data.error)
    }

    return data
  } catch (error) {
    console.error('[Console] ❌ API请求失败:', error.message)
    return null
  }
}

async function testStep2_sessionDetail() {
  logSection('步骤2: 查看会话详情')

  console.log(`\n[Console] 路由跳转到 /requirement/session/${SESSION_ID}`)
  console.log('[Console] 调用 sessionApi.v2.getById()')

  try {
    const response = await fetch(`${API_BASE}/sessions/${SESSION_ID}`)
    const data = await response.json()

    console.log('\n[Network] GET /v2/sessions/:id')
    console.log('[Response]', JSON.stringify(data, null, 2))

    if (data.success) {
      const session = data.data
      console.log(`\n[Console] ✅ 获取会话详情成功`)
      console.log(`[会话信息]`)
      console.log(`  ID: ${session.id}`)
      console.log(`  标题: ${session.title}`)
      console.log(`  状态: ${session.status}`)
      console.log(`  Agent: ${session.agentName}`)
      console.log(`  历史消息数: ${session.history?.length || 0}`)

      if (session.history && session.history.length > 0) {
        console.log('\n[历史消息预览]')
        session.history.slice(0, 5).forEach((msg, index) => {
          const content = typeof msg.content === 'string' ? msg.content.substring(0, 100) : JSON.stringify(msg.content).substring(0, 100)
          console.log(`  ${index + 1}. [${msg.role}] ${content}...`)
        })
      }
    }

    return data
  } catch (error) {
    console.error('[Console] ❌ API请求失败:', error.message)
    return null
  }
}

async function testStep3_sendMessage() {
  logSection('步骤3: 发送需求收敛消息')

  const testMessage = '我想优化首页的加载速度'

  console.log(`\n[Console] 用户输入: "${testMessage}"`)
  console.log('[Console] 点击发送按钮')
  console.log('[Console] 调用 sessionApi.v2.chat()')

  try {
    const token = 'test-token'

    const response = await fetch(`${API_BASE}/sessions/${SESSION_ID}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: testMessage })
    })

    console.log('\n[Network] POST /v2/sessions/:id/chat')
    console.log(`[Status] ${response.status}`)

    if (!response.body) {
      console.error('[Console] ❌ 响应body为空')
      return null
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let chunkCount = 0
    let lastChunkTime = Date.now()

    console.log('\n[SSE Stream] 开始接收流式响应...')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const now = Date.now()
      const interval = now - lastChunkTime
      if (interval > 100) {
        console.log(`[SSE] chunk #${chunkCount + 1} (间隔: ${interval}ms)`)
      }
      lastChunkTime = now
      chunkCount++

      const text = decoder.decode(value, { stream: true })
      const lines = text.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'chunk') {
              fullContent += data.content
            } else if (data.type === 'complete') {
              console.log('\n[SSE] 流式响应完成')
              console.log(`[SSE] metadata:`, JSON.stringify(data.metadata))
            } else if (data.type === 'error') {
              console.error('[SSE] 错误:', data.message)
            }
          } catch (e) {
          }
        }
      }
    }

    console.log(`\n[Console] ✅ 消息发送成功`)
    console.log(`[Console] 收到 ${chunkCount} 个chunks`)
    console.log(`[AI回复预览] ${fullContent.substring(0, 200)}...`)

    return { success: true, chunks: chunkCount, content: fullContent }
  } catch (error) {
    console.error('[Console] ❌ 发送消息失败:', error.message)
    return null
  }
}

async function testStep4_archive() {
  logSection('步骤4: 发送归档指令')

  const archiveMessage = '归档'

  console.log(`\n[Console] 用户输入: "${archiveMessage}"`)
  console.log('[Console] 检测到关键词: "归档"')
  console.log('[Console] 触发归档流程...')

  try {
    const token = 'test-token'

    const response = await fetch(`${API_BASE}/sessions/${SESSION_ID}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: archiveMessage })
    })

    console.log('\n[Network] POST /v2/sessions/:id/chat (归档)')
    console.log(`[Status] ${response.status}`)

    if (!response.body) {
      console.error('[Console] ❌ 响应body为空')
      return null
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let chunkCount = 0
    let artifactId = null

    console.log('\n[SSE Stream] 开始接收归档响应...')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunkCount++
      const text = decoder.decode(value, { stream: true })
      const lines = text.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'chunk') {
              fullContent += data.content
              console.log(`[归档] ${data.content.trim()}`)
            } else if (data.type === 'complete') {
              console.log('\n[SSE] 归档完成')
              console.log(`[SSE] metadata:`, JSON.stringify(data.metadata))
              if (data.metadata) {
                artifactId = data.metadata.artifactId
                if (data.metadata.archived) {
                  console.log('[Console] ✅ 归档成功!')
                }
              }
            } else if (data.type === 'error') {
              console.error('[SSE] 归档错误:', data.message)
            }
          } catch (e) {
          }
        }
      }
    }

    console.log(`\n[归档结果]`)
    console.log(`  chunks: ${chunkCount}`)
    console.log(`  artifactId: ${artifactId}`)

    const pathMatch = fullContent.match(/下载链接: ([^\n]+)/)
    if (pathMatch) {
      console.log(`  downloadPath: ${pathMatch[1].trim()}`)
    }

    return { success: true, artifactId }
  } catch (error) {
    console.error('[Console] ❌ 归档失败:', error.message)
    return null
  }
}

async function testStep5_viewDocument() {
  logSection('步骤5: 查看需求收敛文档')

  console.log('\n[Console] 导航到文档管理页面')
  console.log('[Console] 调用 sessionApi.v2.getById() 或 documentApi.list()')

  const artifactPath = `/artifacts/${SESSION_ID}`

  console.log(`\n[Console] 访问下载链接: ${artifactPath}`)

  try {
    const response = await fetch(`http://localhost:3000${artifactPath}`)
    const text = await response.text()

    console.log('\n[Network] GET /artifacts/:sessionId/...')
    console.log(`[Status] ${response.status}`)

    if (response.ok) {
      console.log('[Console] ✅ 文档加载成功')
      console.log('\n[文档内容预览]')
      console.log(text.substring(0, 500) + '...')
    } else {
      console.log('[Console] ❌ 文档加载失败:', response.status)
    }

    return { success: response.ok, content: text }
  } catch (error) {
    console.error('[Console] ❌ 文档访问失败:', error.message)
    return null
  }
}

async function runTests() {
  console.log('\n' + '🎯'.repeat(40))
  console.log('会话功能全流程测试开始')
  console.log('🎯'.repeat(40))

  await testStep1_sessionList()
  await sleep(500)

  await testStep2_sessionDetail()
  await sleep(500)

  await testStep3_sendMessage()
  await sleep(500)

  await testStep4_archive()
  await sleep(500)

  await testStep5_viewDocument()

  logSection('测试完成')
  console.log('\n请检查上述输出，记录任何异常或Bug。')
}

runTests().catch(console.error)
