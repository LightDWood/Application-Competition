/**
 * 直接测试 /v2/sessions/:id/chat 接口
 */

const API_BASE = 'http://localhost:3000/api/v2'
const SESSION_ID = '3434a043-c01b-4a79-8149-8302918fb9f3'

async function testChat() {
  console.log('测试 POST /v2/sessions/:id/chat 接口\n')

  const message = '你好，请回复'

  try {
    const response = await fetch(`${API_BASE}/sessions/${SESSION_ID}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: message })
    })

    console.log(`Status: ${response.status}`)
    console.log(`Content-Type: ${response.headers.get('content-type')}`)

    if (!response.body) {
      console.log('❌ 响应body为空')
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let chunkCount = 0

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
              process.stdout.write(data.content)
            } else if (data.type === 'complete') {
              console.log('\n\n[SSE] 完成')
              console.log(`Metadata: ${JSON.stringify(data.metadata)}`)
            } else if (data.type === 'error') {
              console.log(`\n\n[SSE] 错误: ${data.message}`)
            }
          } catch (e) {
            // ignore parse errors
          }
        }
      }
    }

    console.log(`\n\n总计: ${chunkCount} chunks, ${fullContent.length} 字符`)
    if (fullContent.length > 0) {
      console.log('✅ AI回复正常')
    } else {
      console.log('⚠️ 无内容')
    }
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`)
  }
}

testChat()
