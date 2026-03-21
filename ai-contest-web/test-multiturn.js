/**
 * 多轮对话测试脚本
 */

async function testMultiTurn() {
  const API_BASE = 'http://localhost:3000/api';

  try {
    console.log('=== 1. 注册/登录 ===');
    const timestamp = Date.now();
    const registerRes = await fetch(`${API_BASE}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `multitest_${timestamp}@test.com`,
        password: '123456',
        email: `multitest_${timestamp}@test.com`
      })
    });
    const registerData = await registerRes.json();
    console.log('注册:', registerData.code === 0 ? '✅' : '❌');

    const loginRes = await fetch(`${API_BASE}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: registerData.data?.user?.username,
        password: '123456'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.token;
    console.log('登录:', token ? '✅' : '❌');

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    console.log('\n=== 2. 创建会话 ===');
    const sessionRes = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: '多轮对话测试' })
    });
    const sessionData = await sessionRes.json();
    const sessionId = sessionData.data?.id;
    console.log('会话ID:', sessionId);

    console.log('\n=== 3. 第一轮对话 ===');
    const msg1 = '我要做一个资讯订阅工具，目标用户是有资讯订阅需求的用户，比如新能源需求。订阅完资讯主题后，AI自动设定常跟踪的网站，每日早8点向用户汇报，相关资讯的动态，并给出每日总结和洞察。推送方式是飞书。';
    console.log('发送:', msg1.substring(0, 50) + '...');

    const chatRes1 = await fetch(`${API_BASE}/sessions/${sessionId}/messages/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content: msg1 })
    });

    const response1 = await readStream(chatRes1);
    console.log('\n--- 第一轮响应 ---');
    console.log(response1.substring(0, 500));
    const score1Match = response1.match(/完整性评分[：:]\s*(\d+)/);
    const score1 = score1Match ? parseInt(score1Match[1]) : 0;
    console.log('\n第一轮评分:', score1);

    console.log('\n=== 4. 第二轮对话（补充信息）===');
    const msg2 = '企业部门用，40多人；文章、研报、股价、政策都有。核心痛点是没有人帮自己盯着事态的变化，信息太多太杂。支持自定义时间；飞书交互体验增加点赞点踩。';
    console.log('发送:', msg2.substring(0, 50) + '...');

    const chatRes2 = await fetch(`${API_BASE}/sessions/${sessionId}/messages/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content: msg2 })
    });

    const response2 = await readStream(chatRes2);
    console.log('\n--- 第二轮响应 ---');
    console.log(response2.substring(0, 600));
    const score2Match = response2.match(/完整性评分[：:]\s*(\d+)/);
    const score2 = score2Match ? parseInt(score2Match[1]) : 0;
    console.log('\n第二轮评分:', score2);

    console.log('\n=== 5. 结果对比 ===');
    console.log(`第一轮评分: ${score1}`);
    console.log(`第二轮评分: ${score2}`);
    console.log(`评分变化: ${score2 > score1 ? '✅ 增加' : score2 === score1 ? '⚠️ 相同' : '❌ 下降'}`);

    if (response2.includes('企业') || response2.includes('40多人')) {
      console.log('上下文利用: ✅ 系统记住了之前的信息');
    } else {
      console.log('上下文利用: ❌ 系统没有利用之前的信息');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }

  async function readStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'chunk') result += data.content;
          } catch (e) {}
        }
      }
    }
    return result;
  }
}

testMultiTurn();
