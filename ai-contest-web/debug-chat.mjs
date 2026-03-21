/**
 * 调试Chat接口完整流程
 */

import configService from './server/services/core/ConfigService.js';
import routerService from './server/services/core/RouterService.js';

const SESSION_ID = '3434a043-c01b-4a79-8149-8302918fb9f3';
const API_BASE = 'http://localhost:3000/api/v2';

async function debugChat() {
  console.log('=== 调试 Chat 接口 ===\n');

  // 1. 检查会话
  console.log('1. 检查会话...');
  const sessionRes = await fetch(`${API_BASE}/sessions/${SESSION_ID}`);
  const sessionData = await sessionRes.json();
  console.log(`   会话存在: ${sessionData.success}`);
  if (sessionData.success) {
    console.log(`   modelId: ${sessionData.data.modelId}`);
    console.log(`   providerId: ${sessionData.data.providerId}`);
  }

  // 2. 检查Provider配置
  console.log('\n2. 检查Provider配置...');
  const defaultProvider = configService.getDefaultProvider();
  console.log(`   默认Provider: ${defaultProvider?.id}`);
  console.log(`   API Endpoint: ${defaultProvider?.apiEndpoint}`);
  console.log(`   API Key: ${defaultProvider?.apiKey?.substring(0, 10)}...`);

  // 3. 检查ModelProviderMap
  console.log('\n3. 检查ModelProviderMap...');
  console.log(`   modelProviderMap size: ${configService.modelProviderMap?.size || 0}`);
  if (configService.modelProviderMap) {
    for (const [model, provider] of configService.modelProviderMap) {
      console.log(`   ${model} -> ${provider}`);
    }
  }

  // 4. 检查会话使用的modelId
  console.log('\n4. 分析会话请求...');
  const modelId = sessionData.data?.modelId;
  console.log(`   会话modelId: ${modelId}`);

  const selectedProvider = configService.selectProviderForModel(modelId);
  console.log(`   选择的Provider: ${selectedProvider?.id}`);
  console.log(`   Provider API: ${selectedProvider?.apiEndpoint}`);

  // 5. 构建请求体
  console.log('\n5. 构建请求体...');
  const requestBody = {
    model: modelId || 'Qwen3.5-35B-A3B',
    messages: [
      { role: 'user', content: '测试' }
    ],
    temperature: 0.7,
    max_tokens: 2000
  };
  console.log(`   Request: ${JSON.stringify(requestBody, null, 2)}`);

  // 6. 直接调用API测试
  console.log('\n6. 直接调用API...');
  const endpoint = `${selectedProvider?.apiEndpoint}/chat/completions`;
  console.log(`   Endpoint: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${selectedProvider?.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`   Status: ${response.status}`);
    const data = await response.json();
    console.log(`   Response: ${JSON.stringify(data).substring(0, 200)}...`);
    console.log('   ✅ API调用成功');
  } catch (error) {
    console.log(`   ❌ API调用失败: ${error.message}`);
  }

  // 7. 测试chat接口
  console.log('\n7. 测试Chat接口...');
  try {
    const chatRes = await fetch(`${API_BASE}/sessions/${SESSION_ID}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '你好' })
    });

    console.log(`   Status: ${chatRes.status}`);

    if (chatRes.body) {
      const reader = chatRes.body.getReader();
      const decoder = new TextDecoder();
      let firstChunk = null;

      const result = await reader.read();
      if (!result.done) {
        const text = decoder.decode(result.value);
        console.log(`   First chunk: ${text.substring(0, 100)}...`);
        firstChunk = JSON.parse(text.replace('data: ', ''));
      }

      if (firstChunk?.type === 'error') {
        console.log(`   ❌ Chat错误: ${firstChunk.message}`);
      } else {
        console.log('   ✅ Chat正常');
      }
    }
  } catch (error) {
    console.log(`   ❌ Chat请求失败: ${error.message}`);
  }
}

debugChat().catch(console.error);
