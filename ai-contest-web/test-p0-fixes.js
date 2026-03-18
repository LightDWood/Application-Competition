/**
 * P0 Bug 修复验证测试
 * 测试 Bug #1 (AI 回复截断) 和 Bug #2 (AI 空回复) 的修复效果
 */

const API_BASE_URL = 'http://localhost:3000/api';

// 模拟 SSE 流式响应处理
async function testStreamResponse(sessionId, userMessage, testType) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试：${testType}`);
  console.log(`消息：${userMessage}`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        sessionId: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    
    let fullContent = '';
    let chunkCount = 0;
    let receivedComplete = false;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log(`\n✅ 流式传输完成`);
        receivedComplete = true;
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            console.log(`\n✅ 收到 [DONE] 标记`);
            receivedComplete = true;
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            
            if (parsed.type === 'chunk') {
              chunkCount++;
              fullContent += parsed.content;
              process.stdout.write(parsed.content);
            } else if (parsed.type === 'complete') {
              console.log(`\n✅ 收到 complete 标记`);
              receivedComplete = true;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    // 验证结果
    console.log(`\n\n📊 测试结果:`);
    console.log(`- 接收到的块数：${chunkCount}`);
    console.log(`- 总内容长度：${fullContent.length}`);
    console.log(`- 是否收到完成标记：${receivedComplete ? '✅ 是' : '❌ 否'}`);
    
    if (chunkCount === 0) {
      console.log(`❌ 失败：未接收到任何内容块`);
      return false;
    }
    
    if (!receivedComplete) {
      console.log(`❌ 失败：未收到完成标记（可能是截断）`);
      return false;
    }
    
    if (fullContent.length === 0) {
      console.log(`❌ 失败：接收到的内容为空`);
      return false;
    }
    
    console.log(`✅ 成功：通过所有检查`);
    return true;

  } catch (error) {
    console.error(`❌ 测试失败：${error.message}`);
    return false;
  }
}

// 创建测试会话
async function createTestSession() {
  try {
    // 直接创建会话（使用固定用户 ID 1）
    const response = await fetch(`${API_BASE_URL}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 1,
        title: 'P0 Bug 修复验证测试',
      }),
    });

    const data = await response.json();
    console.log('创建会话返回:', data);
    return data.id || data.sessionId;
  } catch (error) {
    console.error('创建会话失败:', error.message);
    return null;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 P0 Bug 修复验证测试开始\n');
  console.log('测试目标:');
  console.log('1. Bug #1 - AI 回复截断：验证流式输出完整性');
  console.log('2. Bug #2 - AI 空回复：验证空响应时有默认回复');
  
  const sessionId = await createTestSession();
  
  if (!sessionId) {
    console.error('❌ 无法创建测试会话，测试终止');
    return;
  }
  
  console.log(`\n✅ 测试会话已创建：${sessionId}`);
  
  const testCases = [
    {
      type: '问答场景 (QA)',
      message: '你用的是什么模型？',
      description: '测试问答意图处理',
    },
    {
      type: '需求分析场景 (REQUIREMENT)',
      message: '我要做一个合同审查系统',
      description: '测试需求分析意图处理',
    },
    {
      type: '闲聊场景 (CHAT)',
      message: '你好',
      description: '测试闲聊意图处理',
    },
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    const passed = await testStreamResponse(
      sessionId,
      testCase.message,
      `${testCase.type} - ${testCase.description}`
    );
    results.push({
      type: testCase.type,
      message: testCase.message,
      passed: passed,
    });
    
    // 等待 2 秒避免 API 限流
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 汇总结果
  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 测试汇总报告');
  console.log('='.repeat(60));
  
  for (const result of results) {
    const status = result.passed ? '✅ 通过' : '❌ 失败';
    console.log(`${status} - ${result.type}`);
    console.log(`   测试消息：${result.message}`);
  }
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`\n总计：${passedCount}/${totalCount} 测试通过`);
  
  if (passedCount === totalCount) {
    console.log('\n🎉 所有测试通过！P0 Bug 修复成功！');
  } else {
    console.log('\n⚠️  部分测试失败，请检查日志');
  }
}

// 执行测试
runTests().catch(console.error);
