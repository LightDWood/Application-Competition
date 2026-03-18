/**
 * Bug 复现测试脚本
 * 用于测试流式输出、空消息、意图识别等问题
 */

// 使用全局 fetch API（Node 18+ 内置）

const API_BASE = 'http://localhost:3000/api';

// 测试用例
const testCases = [
  {
    name: '问答意图 - 短消息',
    message: '你用的是什么模型？',
    expectedIntent: 'QA',
    expectEmpty: false
  },
  {
    name: '需求意图 - 短消息',
    message: '我要做合同审查功能',
    expectedIntent: 'REQUIREMENT',
    expectEmpty: false
  },
  {
    name: '闲聊意图 - 短消息',
    message: '你好',
    expectedIntent: 'CHAT',
    expectEmpty: false
  },
  {
    name: '需求意图 - 长消息',
    message: '我想做一个咨询监测功能，设定主题后，自动在互联网上监测相关咨询，全网搜索，每天汇报，推送到飞书',
    expectedIntent: 'REQUIREMENT',
    expectEmpty: false
  },
  {
    name: '问答意图 - 复杂问题',
    message: '为什么需要需求分析？需求分析有什么好处？',
    expectedIntent: 'QA',
    expectEmpty: false
  }
];

// 测试结果记录
const testResults = [];

async function testChat(sessionId, message, testCase) {
  try {
    console.log(`\n=== 测试：${testCase.name} ===`);
    console.log(`发送消息：${message}`);
    
    const response = await fetch(`${API_BASE}/sessions/${sessionId}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: message
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP 错误：${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    let chunkCount = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            continue;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              chunkCount++;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
    
    console.log(`接收 chunk 数：${chunkCount}`);
    console.log(`回复内容长度：${fullContent.length}`);
    console.log(`回复内容：${fullContent.substring(0, 200)}...`);
    
    // 验证结果
    const isEmpty = fullContent.trim().length === 0;
    const isTruncated = chunkCount > 0 && fullContent.length < 50;
    
    const result = {
      testCase: testCase.name,
      success: !isEmpty && !isTruncated,
      isEmpty,
      isTruncated,
      chunkCount,
      contentLength: fullContent.length,
      content: fullContent
    };
    
    testResults.push(result);
    
    console.log(`测试结果：${result.success ? '✅ 通过' : '❌ 失败'}`);
    if (isEmpty) console.log('  ⚠️  空回复！');
    if (isTruncated) console.log('  ⚠️  回复可能被截断！');
    
    return result;
    
  } catch (error) {
    console.error('测试失败:', error);
    testResults.push({
      testCase: testCase.name,
      success: false,
      error: error.message
    });
    return null;
  }
}

async function createTestSession() {
  try {
    const response = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: 'fbe141df-f762-4a25-8b66-afc6abf3d0bd', // admin user
        title: 'Bug 复现测试'
      })
    });
    
    const session = await response.json();
    console.log('创建测试会话:', session.id);
    return session.id;
  } catch (error) {
    console.error('创建会话失败:', error);
    return null;
  }
}

async function runTests() {
  console.log('🚀 开始 Bug 复现测试...\n');
  
  const sessionId = await createTestSession();
  if (!sessionId) {
    console.error('无法创建测试会话，退出');
    return;
  }
  
  // 执行所有测试用例
  for (const testCase of testCases) {
    await testChat(sessionId, testCase.message, testCase);
    // 延迟 1 秒避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 生成测试报告
  console.log('\n\n========== 测试报告 ==========');
  console.log(`总测试用例：${testResults.length}`);
  console.log(`通过：${testResults.filter(r => r.success).length}`);
  console.log(`失败：${testResults.filter(r => !r.success).length}`);
  
  const emptyCount = testResults.filter(r => r.isEmpty).length;
  const truncatedCount = testResults.filter(r => r.isTruncated).length;
  
  console.log(`\n空回复：${emptyCount}`);
  console.log(`截断回复：${truncatedCount}`);
  
  console.log('\n详细结果:');
  testResults.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.testCase}`);
    console.log(`   状态：${result.success ? '✅ 通过' : '❌ 失败'}`);
    if (result.isEmpty) console.log('   问题：空回复');
    if (result.isTruncated) console.log('   问题：回复截断');
    if (result.error) console.log(`   错误：${result.error}`);
  });
  
  // 生成 Markdown 报告
  generateReport();
}

function generateReport() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = '对话日志/bug-test-report.md';
  
  let report = `# Bug 复现测试报告\n\n`;
  report += `**测试时间**: ${new Date().toLocaleString('zh-CN')}\n`;
  report += `**测试会话 ID**: (见上文)\n\n`;
  report += `## 测试概览\n`;
  report += `- 总测试用例：${testResults.length}\n`;
  report += `- 通过：${testResults.filter(r => r.success).length}\n`;
  report += `- 失败：${testResults.filter(r => !r.success).length}\n`;
  report += `- 空回复：${testResults.filter(r => r.isEmpty).length}\n`;
  report += `- 截断回复：${testResults.filter(r => r.isTruncated).length}\n\n`;
  
  report += `## 详细测试结果\n\n`;
  
  testResults.forEach((result, index) => {
    report += `### ${index + 1}. ${result.testCase}\n\n`;
    report += `**状态**: ${result.success ? '✅ 通过' : '❌ 失败'}\n`;
    if (result.isEmpty) report += `**问题**: 空回复\n`;
    if (result.isTruncated) report += `**问题**: 回复截断（内容长度：${result.contentLength}）\n`;
    if (result.error) report += `**错误**: ${result.error}\n`;
    report += `\n**回复内容**:\n\`\`\`\n${result.content}\n\`\`\`\n\n`;
  });
  
  report += `## 真实 Bug 清单\n\n`;
  
  const bugs = [];
  if (testResults.some(r => r.isEmpty)) {
    bugs.push({
      id: 1,
      severity: 'Major',
      title: 'AI 返回空消息',
      description: '在某些情况下，AI 返回空白回复或只有换行符',
      reproduction: '发送需求描述消息，观察 AI 回复',
      evidence: testResults.filter(r => r.isEmpty).map(r => r.testCase).join(', ')
    });
  }
  
  if (testResults.some(r => r.isTruncated)) {
    bugs.push({
      id: 2,
      severity: 'Major',
      title: 'AI 回复被截断',
      description: 'AI 回复内容不完整，中途断开',
      reproduction: '发送长消息或需求描述，观察 AI 回复完整性',
      evidence: testResults.filter(r => r.isTruncated).map(r => r.testCase).join(', ')
    });
  }
  
  if (bugs.length === 0) {
    report += `本次测试未发现新的 bug。\n\n`;
  } else {
    bugs.forEach(bug => {
      report += `### Bug #${bug.id}: ${bug.title}\n\n`;
      report += `- **严重程度**: ${bug.severity}\n`;
      report += `- **描述**: ${bug.description}\n`;
      report += `- **复现步骤**: ${bug.reproduction}\n`;
      report += `- **测试证据**: ${bug.evidence}\n\n`;
    });
  }
  
  console.log(`\n📄 测试报告已生成`);
  console.log(`注意：由于环境限制，报告内容已输出到控制台，请手动保存到 ${reportPath}`);
  console.log('\n========== 报告内容 ==========');
  console.log(report);
}

// 运行测试
runTests();
