import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/user/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}

const loginReq = http.request(options, (res) => {
  let data = ''
  res.on('data', (chunk) => { data += chunk })
  res.on('end', async () => {
    const loginData = JSON.parse(data)
    if (loginData.code !== 0) {
      console.log('登录失败:', loginData)
      return
    }

    const token = loginData.data.token
    console.log('Token obtained:', token.substring(0, 20) + '...\n')

    const sessionOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/sessions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }

    const sessionReq = http.request(sessionOptions, (sessionRes) => {
      let sessionData = ''
      sessionRes.on('data', (chunk) => { sessionData += chunk })
      sessionRes.on('end', () => {
        const sessionInfo = JSON.parse(sessionData)
        const sessionId = sessionInfo.data.id
        console.log('Session created:', sessionId)
        console.log('\n开始发送聊天消息（测试SSE流式响应）...\n')

        const chatOptions = {
          hostname: 'localhost',
          port: 3000,
          path: `/api/sessions/${sessionId}/messages/chat`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }

        const chatReq = http.request(chatOptions, (chatRes) => {
          console.log('Response status:', chatRes.statusCode)
          console.log('Content-Type:', chatRes.headers['content-type'])
          console.log('\n--- AI 响应流式输出 ---\n')

          let fullContent = ''

          chatRes.on('data', (chunk) => {
            const text = chunk.toString()
            process.stdout.write(text)
            fullContent += text
          })

          chatRes.on('end', () => {
            console.log('\n\n--- 测试结果 ---')
            console.log('响应内容长度:', fullContent.length, '字符')

            if (fullContent.includes('感谢您') || fullContent.includes('需求') || fullContent.includes('了解')) {
              console.log('✅ AI 响应内容包含相关关键词')
            } else {
              console.log('⚠️ 需要进一步检查响应内容')
            }
          })
        })

        chatReq.on('error', (e) => console.error('Chat request error:', e))

        const chatBody = JSON.stringify({ content: '我有个想法，我想做一个任务管理系统' })
        chatReq.write(chatBody)
        chatReq.end()
      })
    })

    sessionReq.on('error', (e) => console.error('Session request error:', e))

    const sessionBody = JSON.stringify({ title: 'API测试会话2' })
    sessionReq.write(sessionBody)
    sessionReq.end()
  })
})

loginReq.on('error', (e) => console.error('Login request error:', e))

const loginBody = JSON.stringify({ username: 'test', password: '123456' })
loginReq.write(loginBody)
loginReq.end()
