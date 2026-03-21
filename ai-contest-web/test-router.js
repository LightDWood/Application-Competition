/**
 * 测试RouterService的executeRequest是否正常
 */

async function testRouterService() {
  console.log('测试RouterService.executeRequest...\n')

  const provider = {
    id: 'haier-primary',
    apiEndpoint: 'https://modelapi-test.haier.net/model/v1',
    apiKey: 'apikey-69b8f5c1e4b0c281b94a4c49',
    defaults: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1.0
    }
  }

  const request = {
    modelId: 'Qwen3.5-35B-A3B',
    messages: [
      { role: 'system', content: '你是一个助手' },
      { role: 'user', content: '你好' }
    ],
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1.0
  }

  const endpoint = `${provider.apiEndpoint}/chat/completions`
  console.log(`Endpoint: ${endpoint}\n`)

  try {
    const startTime = Date.now()
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: request.modelId,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2000,
        top_p: request.topP ?? 1.0
      })
    })

    const duration = Date.now() - startTime
    console.log(`Status: ${response.status}`)
    console.log(`Duration: ${duration}ms`)

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`Error: ${errorText}`)
      return
    }

    const data = await response.json()
    console.log(`\nResponse:`)
    console.log(`Model: ${data.model}`)
    console.log(`Content: ${data.choices?.[0]?.message?.content?.substring(0, 100)}...`)
    console.log(`\n✅ RouterService应该可以正常工作`)
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }
}

testRouterService()
