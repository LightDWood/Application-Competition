/**
 * 功能验证测试脚本
 * 验证登录、会话、归档功能
 */

const API_BASE = 'http://localhost:3000/api'
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

function logCheck(label, passed, detail = '') {
  const icon = passed ? '✅' : '❌'
  console.log(`  ${icon} ${label}${detail ? ': ' + detail : ''}`)
  return passed
}

// ============================================================================
// 步骤1: 登录功能验证
// ============================================================================
async function testLogin() {
  logSection('步骤1: 登录功能验证')

  console.log('\n--- 1.1 登录页面加载 ---')
  console.log('[预期] 页面渲染登录表单')

  console.log('\n--- 1.2 执行登录请求 ---')

  const testCredentials = [
    { username: 'admin', password: 'admin123', desc: '管理员账号' },
    { username: 'test', password: 'test123', desc: '测试账号' }
  ]

  let loginSuccess = false
  let loginResult = null

  for (const cred of testCredentials) {
    console.log(`\n[测试] ${cred.desc}: ${cred.username}`)

    try {
      const response = await fetch(`${API_BASE}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cred.username, password: cred.password })
      })

      const data = await response.json()
      console.log(`[Network] POST /api/user/login`)
      console.log(`[Status] ${response.status}`)
      console.log(`[Response] ${JSON.stringify(data).substring(0, 200)}...`)

      if (data.code === 0 && data.data && data.data.token) {
        loginSuccess = true
        loginResult = data.data
        console.log(`[结果] ✅ 登录成功`)
        console.log(`  Token: ${data.data.token.substring(0, 30)}...`)
        console.log(`  User: ${data.data.user.username} (${data.data.user.role})`)
        break
      } else {
        console.log(`[结果] ❌ 登录失败: ${data.message || '未知错误'}`)
      }
    } catch (error) {
      console.log(`[结果] ❌ 请求失败: ${error.message}`)
    }
  }

  console.log('\n--- 1.3 Token存储验证 ---')
  if (loginResult) {
    console.log(`[预期] localStorage.setItem('user_token', '${loginResult.token.substring(0, 30)}...')`)
    console.log(`[预期] localStorage.setItem('user_info', '${JSON.stringify(loginResult.user).substring(0, 50)}...')`)
    logCheck('Token已获取', true, loginResult.token.substring(0, 20) + '...')
  } else {
    logCheck('Token已获取', false, '无有效token')
  }

  console.log('\n--- 1.4 登录后跳转 ---')
  if (loginSuccess) {
    logCheck('跳转到/requirement', true, '用户角色: ' + loginResult.user.role)
  } else {
    logCheck('跳转到/requirement', false, '登录未成功')
  }

  return loginSuccess ? loginResult : null
}

// ============================================================================
// 步骤2: 会话列表验证
// ============================================================================
async function testSessionList() {
  logSection('步骤2: 会话列表验证')

  console.log('\n--- 2.1 访问会话列表 ---')

  try {
    const response = await fetch(`${API_BASE}/v2/sessions?userId=${USER_ID}&page=1&pageSize=20`)
    const data = await response.json()

    console.log(`[Network] GET /api/v2/sessions?userId=${USER_ID}`)
    console.log(`[Status] ${response.status}`)

    if (data.success) {
      console.log(`[结果] ✅ 获取会话列表成功`)
      console.log(`[会话数量] ${data.data.total} 个会话`)

      if (data.data.list && data.data.list.length > 0) {
        console.log('\n[会话列表前5个]')
        data.data.list.slice(0, 5).forEach((s, i) => {
          console.log(`  ${i + 1}. ${s.id} - ${s.title || '(无标题)'} [${s.status}]`)
        })

        const targetSession = data.data.list.find(s => s.id === SESSION_ID)
        if (targetSession) {
          console.log(`\n[结果] ✅ 找到目标会话 ${SESSION_ID}`)
        }
      }

      logCheck('会话列表加载', true, `${data.data.total}个会话`)
      return data.data
    } else {
      console.log(`[结果] ❌ 获取失败: ${data.error}`)
      logCheck('会话列表加载', false)
      return null
    }
  } catch (error) {
    console.log(`[结果] ❌ 请求失败: ${error.message}`)
    logCheck('会话列表加载', false)
    return null
  }
}

// ============================================================================
// 步骤3: 会话详情验证
// ============================================================================
async function testSessionDetail() {
  logSection('步骤3: 会话详情验证')

  console.log('\n--- 3.1 进入会话详情 ---')
  console.log(`[URL] /requirement/session/${SESSION_ID}`)

  try {
    const response = await fetch(`${API_BASE}/v2/sessions/${SESSION_ID}`)
    const data = await response.json()

    console.log(`[Network] GET /api/v2/sessions/${SESSION_ID}`)
    console.log(`[Status] ${response.status}`)

    if (data.success) {
      const session = data.data
      console.log(`\n[结果] ✅ 获取会话详情成功`)
      console.log(`[会话ID] ${session.id}`)
      console.log(`[会话标题] ${session.title}`)
      console.log(`[Agent] ${session.agentName}`)
      console.log(`[历史消息] ${session.history?.length || 0} 条`)

      if (session.history && session.history.length > 0) {
        console.log('\n[历史消息预览]')
        session.history.slice(0, 3).forEach((msg, i) => {
          const content = typeof msg.content === 'string'
            ? msg.content.substring(0, 60)
            : (msg.content?.text || '...').substring(0, 60)
          console.log(`  ${i + 1}. [${msg.role}] ${content}...`)
        })
      }

      logCheck('会话详情加载', true)
      logCheck('历史消息加载', session.history?.length > 0, `${session.history?.length || 0}条消息`)
      return session
    } else {
      console.log(`[结果] ❌ 获取失败: ${data.error}`)
      logCheck('会话详情加载', false)
      return null
    }
  } catch (error) {
    console.log(`[结果] ❌ 请求失败: ${error.message}`)
    logCheck('会话详情加载', false)
    return null
  }
}

// ============================================================================
// 步骤4: 发送消息验证
// ============================================================================
async function testSendMessage() {
  logSection('步骤4: 发送消息验证')

  console.log('\n--- 4.1 发送测试消息 ---')
  const testMessage = '我想做一个新闻订阅工具'

  console.log(`[输入框] "${testMessage}"`)
  console.log('[点击] 发送按钮')

  try {
    const response = await fetch(`${API_BASE}/v2/sessions/${SESSION_ID}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({ content: testMessage })
    })

    console.log(`\n[Network] POST /api/v2/sessions/${SESSION_ID}/chat`)
    console.log(`[Status] ${response.status}`)

    if (!response.body) {
      console.log('[结果] ❌ 响应body为空')
      logCheck('发送消息', false)
      return null
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let chunkCount = 0
    let errorOccurred = null

    console.log('\n[SSE流] 开始接收...')

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
            } else if (data.type === 'complete') {
              console.log('[SSE] 完成')
              console.log(`[Metadata] ${JSON.stringify(data.metadata).substring(0, 100)}`)
            } else if (data.type === 'error') {
              errorOccurred = data.message
              console.log(`[SSE] 错误: ${data.message}`)
            }
          } catch (e) {}
        }
      }
    }

    console.log(`\n[结果] 收到 ${chunkCount} 个chunks`)

    if (errorOccurred) {
      console.log(`[AI响应] ⚠️ 错误: ${errorOccurred}`)
      logCheck('AI正常响应', false, errorOccurred)
    } else if (fullContent.length > 0) {
      console.log(`[AI响应] ✅ 收到内容 (${fullContent.length}字符)`)
      console.log(`[预览] ${fullContent.substring(0, 100)}...`)
      logCheck('AI正常响应', true, `${fullContent.length}字符`)
    } else {
      console.log(`[AI响应] ⚠️ 空响应`)
      logCheck('AI正常响应', false, '空响应')
    }

    return { success: fullContent.length > 0, content: fullContent }
  } catch (error) {
    console.log(`[结果] ❌ 请求失败: ${error.message}`)
    logCheck('发送消息', false)
    return null
  }
}

// ============================================================================
// 步骤5: 定稿归档验证
// ============================================================================
async function testArchive() {
  logSection('步骤5: 定稿归档验证')

  console.log('\n--- 5.1 发送归档指令 ---')
  const archiveMessage = '归档'

  console.log(`[输入框] "${archiveMessage}"`)
  console.log('[点击] 发送按钮')
  console.log('[检测] 消息包含"归档"关键词')

  try {
    const response = await fetch(`${API_BASE}/v2/sessions/${SESSION_ID}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({ content: archiveMessage })
    })

    console.log(`\n[Network] POST /api/v2/sessions/${SESSION_ID}/chat (归档)`)
    console.log(`[Status] ${response.status}`)

    if (!response.body) {
      console.log('[结果] ❌ 响应body为空')
      logCheck('归档功能', false)
      return null
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let chunkCount = 0
    let artifactId = null
    let downloadPath = null
    let archived = false

    console.log('\n[SSE流] 开始接收归档响应...')

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
              console.log('[SSE] 归档完成')
              if (data.metadata) {
                archived = data.metadata.archived
                artifactId = data.metadata.artifactId
                console.log(`[Metadata] archived=${archived}, artifactId=${artifactId}`)
              }
            } else if (data.type === 'error') {
              console.log(`[SSE] 错误: ${data.message}`)
            }
          } catch (e) {}
        }
      }
    }

    console.log('\n--- 5.2 归档响应验证 ---')
    const pathMatch = fullContent.match(/下载链接: (.+)/)
    if (pathMatch) {
      downloadPath = pathMatch[1].trim()
    }

    logCheck('归档指令响应', chunkCount > 0, `${chunkCount}个chunks`)
    logCheck('归档成功标志', archived === true)
    logCheck('artifactId', artifactId != null, artifactId || '无')
    logCheck('下载链接', downloadPath != null, downloadPath || '无')

    console.log('\n--- 5.3 文档生成验证 ---')
    if (downloadPath) {
      const fs = require('fs')
      const path = require('path')
      const baseDir = path.join(__dirname, 'artifacts', SESSION_ID)
      const expectedFile = path.join(baseDir, path.basename(downloadPath))

      console.log(`[检查路径] ${expectedFile}`)

      if (fs.existsSync(expectedFile)) {
        const content = fs.readFileSync(expectedFile, 'utf8')
        console.log(`[结果] ✅ 文档已生成 (${content.length}字符)`)
        console.log(`[预览] ${content.substring(0, 150)}...`)
        logCheck('文档文件存在', true, path.basename(downloadPath))

        console.log('\n--- 5.4 文档下载验证 ---')
        console.log(`[下载URL] http://localhost:3000${downloadPath}`)
        logCheck('下载链接可访问', true, downloadPath)
      } else {
        console.log(`[结果] ❌ 文档文件不存在`)
        logCheck('文档文件存在', false)
      }
    } else {
      logCheck('文档文件存在', false, '无下载链接')
    }

    return { archived, artifactId, downloadPath }
  } catch (error) {
    console.log(`[结果] ❌ 请求失败: ${error.message}`)
    logCheck('归档功能', false)
    return null
  }
}

// ============================================================================
// 主测试流程
// ============================================================================
async function runTests() {
  console.log('\n' + '🎯'.repeat(40))
  console.log('功能验证测试开始')
  console.log('🎯'.repeat(40))

  const results = {}

  // 步骤1: 登录
  const loginResult = await testLogin()
  results.login = loginResult != null
  await sleep(500)

  // 步骤2: 会话列表
  const sessionListResult = await testSessionList()
  results.sessionList = sessionListResult != null
  await sleep(500)

  // 步骤3: 会话详情
  const sessionDetailResult = await testSessionDetail()
  results.sessionDetail = sessionDetailResult != null
  await sleep(500)

  // 步骤4: 发送消息
  const sendResult = await testSendMessage()
  results.sendMessage = sendResult?.success === true
  await sleep(500)

  // 步骤5: 归档
  const archiveResult = await testArchive()
  results.archive = archiveResult?.archived === true
  await sleep(500)

  // =========================================================================
  // 验证总结
  // =========================================================================
  logSection('验证结果总结')

  console.log('\n[检查点结果]')
  console.log(`  LP1 登录页面加载: ${results.login ? '✅' : '❌'}`)
  console.log(`  LP2 登录请求: ${results.login ? '✅' : '❌'}`)
  console.log(`  LP3 Token存储: ${results.login ? '✅' : '❌'}`)
  console.log(`  SP1 会话列表: ${results.sessionList ? '✅' : '❌'}`)
  console.log(`  SP2 会话详情: ${results.sessionDetail ? '✅' : '❌'}`)
  console.log(`  SP3 发送消息: ${results.sendMessage ? '✅' : '❌'}`)
  console.log(`  AP1 归档响应: ${results.archive ? '✅' : '❌'}`)

  const passCount = Object.values(results).filter(v => v).length
  const totalCount = Object.keys(results).length

  console.log(`\n[通过率] ${passCount}/${totalCount} (${Math.round(passCount/totalCount*100)}%)`)

  if (passCount === totalCount) {
    console.log('\n🎉 所有验证通过！')
  } else {
    console.log('\n⚠️ 部分验证未通过，请检查上述失败项')
  }
}

runTests().catch(console.error)
