/**
 * 需求收敛技能测试脚本
 */

async function testAPI() {
  const API_BASE = 'http://localhost:3000/api';

  try {
    console.log('=== 1. 测试注册/登录 ===');

    const registerRes = await fetch(`${API_BASE}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `test_${Date.now()}@test.com`,
        password: '123456',
        email: `test_${Date.now()}@test.com`
      })
    });
    const registerData = await registerRes.json();
    console.log('注册结果:', registerData.code === 0 ? '✅ 成功' : '❌ 失败', registerData.message || '');

    console.log('\n=== 2. 登录获取 Token ===');
    const loginRes = await fetch(`${API_BASE}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: registerData.data?.user?.username || registerData.data?.email,
        password: '123456'
      })
    });
    const loginData = await loginRes.json();

    if (loginData.code !== 0) {
      console.log('登录失败，尝试用已有账号...');
      console.log('登录响应:', JSON.stringify(loginData).substring(0, 300));
    }

    const token = loginData.data?.token || loginData.data?.access_token;
    if (!token) {
      console.log('❌ 无法获取 Token，跳过 API 测试');
      console.log('登录响应:', JSON.stringify(loginData).substring(0, 200));
      return;
    }
    console.log('✅ 获取 Token 成功');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    console.log('\n=== 3. 创建会话 ===');
    const sessionRes = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: '测试需求分析会话' })
    });
    const sessionData = await sessionRes.json();
    console.log('创建会话:', sessionData.code === 0 ? '✅ 成功' : '❌ 失败');

    if (sessionData.code !== 0 || !sessionData.data?.id) {
      console.log('会话创建失败:', sessionData.message);
      return;
    }

    const sessionId = sessionData.data.id;
    console.log('会话 ID:', sessionId);

    console.log('\n=== 4. 测试需求分析（chat 接口）===');
    console.log('发送需求: "我要做一个资讯订阅工具，目标用户是有资讯订阅需求的用户，比如新能源需求"');

    const chatRes = await fetch(`${API_BASE}/sessions/${sessionId}/messages/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: '我要做一个资讯订阅工具，目标用户是有资讯订阅需求的用户，比如新能源需求'
      })
    });

    console.log('Chat API 状态:', chatRes.status);

    if (chatRes.body) {
      const reader = chatRes.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let chunkCount = 0;

      console.log('\n--- AI 响应开始 ---');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk') {
                fullContent += data.content;
                chunkCount++;
                process.stdout.write(data.content);
              } else if (data.type === 'done') {
                console.log('\n--- AI 响应结束 ---');
                console.log(`\n📊 统计: 共 ${chunkCount} 个 chunk，内容长度 ${fullContent.length}`);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      if (fullContent.length === 0) {
        console.log('⚠️ AI 返回了空内容');
      } else {
        console.log('\n✅ 需求分析功能正常工作！');
      }
    }

    console.log('\n=== 5. 获取消息历史 ===');
    const messagesRes = await fetch(`${API_BASE}/sessions/${sessionId}/messages`, {
      headers
    });
    const messagesData = await messagesRes.json();
    console.log('消息数量:', messagesData.data?.list?.length || 0);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAPI();
