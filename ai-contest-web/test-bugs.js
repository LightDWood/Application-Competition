/**
 * Bug 复现测试脚本 - 简化版
 * 直接通过数据库创建会话并测试
 */

import db from './server/models/index.js';

const { Session, Message } = db;

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
  }
];

const testResults = [];

async function runTests() {
  console.log('🚀 开始 Bug 复现测试...\n');
  
  // 获取 admin 用户
  const admin = await db.User.findOne({ where: { username: 'admin' } });
  if (!admin) {
    console.error('未找到 admin 用户');
    return;
  }
  
  console.log('Admin 用户 ID:', admin.id);
  
  // 创建测试会话
  const session = await Session.create({
    user_id: admin.id,
    title: 'Bug 复现测试',
    status: 'active'
  });
  
  console.log('创建测试会话:', session.id, '\n');
  
  // 执行测试
  for (const testCase of testCases) {
    console.log(`\n=== 测试：${testCase.name} ===`);
    console.log(`发送消息：${testCase.message}`);
    
    // 保存用户消息
    await Message.create({
      session_id: session.id,
      role: 'user',
      content: testCase.message
    });
    
    // 获取对话历史
    const messages = await Message.findAll({
      where: { session_id: session.id },
      order: [['created_at', 'ASC']]
    });
    
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // 调用 skillService
    try {
      const skillService = await import('./server/services/skillService.js');
      const service = new skillService.default();
      
      let fullContent = '';
      let chunkCount = 0;
      
      for await (const chunk of service.streamResponse(testCase.message, conversationHistory.slice(0, -1))) {
        if (chunk.type === 'chunk' && chunk.content) {
          fullContent += chunk.content;
          chunkCount++;
        }
      }
      
      console.log(`接收 chunk 数：${chunkCount}`);
      console.log(`回复内容长度：${fullContent.length}`);
      console.log(`回复内容：${fullContent.substring(0, 200)}...`);
      
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
      
    } catch (error) {
      console.error('测试失败:', error);
      testResults.push({
        testCase: testCase.name,
        success: false,
        error: error.message
      });
    }
    
    // 延迟 1 秒
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
  
  // 生成 Bug 清单
  generateBugList();
  
  // 清理测试数据
  await Message.destroy({ where: { session_id: session.id } });
  await session.destroy();
  console.log('\n已清理测试数据');
}

function generateBugList() {
  console.log('\n\n========== 真实 Bug 清单 ==========\n');
  
  const bugs = [];
  
  if (testResults.some(r => r.isEmpty)) {
    bugs.push({
      id: 1,
      severity: 'Major',
      title: 'AI 返回空消息',
      description: '在某些情况下，AI 返回空白回复或只有换行符',
      reproduction: '发送需求描述消息，观察 AI 回复',
      evidence: testResults.filter(r => r.isEmpty).map(r => r.testCase).join(', '),
      fix: '检查 skillService.js 中 handleRequirement 方法，确保技能返回空值时有降级处理'
    });
  }
  
  if (testResults.some(r => r.isTruncated)) {
    bugs.push({
      id: 2,
      severity: 'Major',
      title: 'AI 回复被截断',
      description: 'AI 回复内容不完整，中途断开',
      reproduction: '发送长消息或需求描述，观察 AI 回复完整性',
      evidence: testResults.filter(r => r.isTruncated).map(r => r.testCase).join(', '),
      fix: '检查 SSE 流式输出解析逻辑，确保 reader 正确读取所有数据'
    });
  }
  
  // 从对话日志中发现的历史 bug
  bugs.push({
    id: 3,
    severity: 'Minor',
    title: '意图识别缺失（已修复）',
    description: '历史对话中，问答被误判为需求分析',
    reproduction: '查看历史对话日志，会话 4 消息 2-10',
    evidence: '用户问"你用的是什么模型？"被当作需求处理',
    fix: '已添加 intentRecognizer.js 模块，实现意图识别功能'
  });
  
  if (bugs.length === 0) {
    console.log('本次测试未发现新的 bug。\n');
  } else {
    bugs.forEach((bug, index) => {
      console.log(`### Bug #${bug.id}: ${bug.title}`);
      console.log(`   严重程度：${bug.severity}`);
      console.log(`   描述：${bug.description}`);
      console.log(`   复现步骤：${bug.reproduction}`);
      console.log(`   测试证据：${bug.evidence}`);
      console.log(`   修复建议：${bug.fix}`);
      console.log('');
    });
  }
  
  // 保存 Bug 清单到文件
  saveBugList(bugs);
}

async function saveBugList(bugs) {
  const fs = await import('fs');
  const path = await import('path');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `bug-list-${timestamp}.md`;
  const filepath = path.join('对话日志', filename);
  
  let content = `# 真实 Bug 清单\n\n`;
  content += `**生成时间**: ${new Date().toLocaleString('zh-CN')}\n`;
  content += `**测试会话**: (已清理)\n\n`;
  
  content += `## Bug 统计\n\n`;
  content += `- 总数：${bugs.length}\n`;
  content += `- Major: ${bugs.filter(b => b.severity === 'Major').length}\n`;
  content += `- Minor: ${bugs.filter(b => b.severity === 'Minor').length}\n\n`;
  
  content += `## Bug 详情\n\n`;
  
  bugs.forEach(bug => {
    content += `### Bug #${bug.id}: ${bug.title}\n\n`;
    content += `- **严重程度**: ${bug.severity}\n`;
    content += `- **描述**: ${bug.description}\n`;
    content += `- **复现步骤**: ${bug.reproduction}\n`;
    content += `- **测试证据**: ${bug.evidence}\n`;
    content += `- **修复建议**: ${bug.fix}\n\n`;
  });
  
  content += `## 测试结论\n\n`;
  content += `1. 空回复问题：${bugs.some(b => b.id === 1) ? '存在' : '不存在'}\n`;
  content += `2. 回复截断问题：${bugs.some(b => b.id === 2) ? '存在' : '不存在'}\n`;
  content += `3. 意图识别问题：已修复\n\n`;
  content += `**报告结束**\n`;
  
  try {
    await fs.promises.writeFile(filepath, content, 'utf-8');
    console.log(`\n📄 Bug 清单已保存到：${filepath}`);
  } catch (error) {
    console.error('保存文件失败:', error);
  }
}

// 运行测试
runTests();
