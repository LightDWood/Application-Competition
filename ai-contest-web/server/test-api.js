import SKILL_CONFIG from './config/skill.js'
import skillService from './services/skillService.js'

async function testAPI() {
  console.log('=== 开始测试 AI API ===\n')
  console.log('API 配置:')
  console.log('- Base URL:', SKILL_CONFIG.api.baseUrl)
  console.log('- Model:', SKILL_CONFIG.api.model)
  console.log('- API Key:', SKILL_CONFIG.api.apiKey.substring(0, 10) + '...')
  console.log()

  try {
    console.log('测试 1: 普通调用...')
    const response = await skillService.processMessage('你好，请介绍一下你自己')
    
    if (response.type === 'response') {
      console.log('✅ 普通调用成功')
      console.log('回复内容:', response.content.substring(0, 100) + '...')
      console.log('使用模型:', response.metadata.model)
      console.log()
    } else if (response.type === 'error') {
      console.log('❌ 普通调用失败:', response.content)
      console.log()
    }

    console.log('测试 2: 流式调用...')
    const stream = await skillService.chatStream('用一句话总结什么是需求收敛')
    
    let fullContent = ''
    let chunkCount = 0
    
    for await (const chunk of stream) {
      if (chunk.type === 'chunk') {
        fullContent += chunk.content
        chunkCount++
        process.stdout.write(chunk.content)
      } else if (chunk.type === 'complete') {
        console.log('\n✅ 流式调用成功')
        console.log('接收 chunk 数量:', chunkCount)
        console.log('总内容长度:', fullContent.length)
      } else if (chunk.type === 'error') {
        console.log('\n❌ 流式调用失败:', chunk.content)
      }
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }

  console.log('\n=== 测试结束 ===')
}

testAPI()
