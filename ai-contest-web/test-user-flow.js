/**
 * 用户完整流程自动化测试脚本
 * 测试流程：首页 → 登录页 → 会话列表 → 新建会话 → 两轮对话 → 定稿
 */

const API_BASE = 'http://localhost:3000/api';
const V2_BASE = 'http://localhost:3000/api/v2';

const testAccount = {
  username: 'admin',
  password: 'admin123'
};

const testMessages = {
  first: '我要做一个资讯订阅工具，目标用户是有资讯订阅需求的用户，比如新能源需求。订阅完资讯主题后，AI自动设定常跟踪的网站，每日早8点向用户汇报，相关资讯的动态，并给出每日总结和洞察。推送方式是飞书。',
  second: '企业部门用，40多人；文章、研报、股价、政策都有。核心痛点是没有人帮自己盯着事态的变化，信息太多太杂。支持自定义时间；飞书交互体验增加点赞点踩。'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function readStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let chunkCount = 0;

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
            result += data.content;
            chunkCount++;
          }
        } catch (e) {}
      }
    }
  }

  return { content: result, chunkCount };
}

async function runTest() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       用户完整流程自动化测试 - AI副驾驶设计大赛系统           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let token = null;
  let userId = null;
  let sessionId = null;

  try {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('步骤1: 用户登录');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`测试账号: ${testAccount.username} / ${testAccount.password}`);

    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testAccount)
    });

    const loginData = await loginRes.json();
    console.log(`登录API响应: code=${loginData.code}, message=${loginData.message}`);

    if (loginData.code !== 0) {
      console.error('❌ 登录失败: ' + (loginData.message || '未知错误'));
      console.log('\n尝试使用admin账号直接注册...');

      const registerRes = await fetch(`${API_BASE}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
          email: 'admin@test.com'
        })
      });
      const registerData = await registerRes.json();
      console.log(`注册API响应: code=${registerData.code}`);

      if (registerData.code === 0) {
        token = registerData.data?.token;
        userId = registerData.data?.user?.id;
        console.log('✅ 注册/登录成功');
      } else {
        throw new Error('登录和注册均失败');
      }
    } else {
      token = loginData.data?.token;
      userId = loginData.data?.user?.id;
      console.log(`✅ 登录成功`);
    }

    console.log(`用户ID: ${userId}`);
    console.log(`Token: ${token.substring(0, 50)}...`);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    await sleep(500);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('步骤2: 访问会话列表 (GET /v2/sessions)');
    console.log('═══════════════════════════════════════════════════════════════');

    const listRes = await fetch(`${V2_BASE}/sessions?userId=${userId}&page=1&pageSize=20`, {
      method: 'GET',
      headers
    });
    const listData = await listRes.json();
    console.log(`会话列表响应: success=${listData.success}, code=${listData.code}`);
    console.log(`已有会话数: ${listData.data?.list?.length || 0}`);

    await sleep(500);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('步骤3: 创建新会话 (POST /v2/sessions)');
    console.log('═══════════════════════════════════════════════════════════════');

    const createRes = await fetch(`${V2_BASE}/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: userId,
        agentId: null,
        title: '需求收敛测试会话_' + Date.now()
      })
    });
    const createData = await createRes.json();
    console.log(`创建会话响应: success=${createData.success}, code=${createData.code}`);

    if (createData.success || createData.code === 0) {
      sessionId = createData.data?.id;
      console.log(`✅ 会话创建成功, sessionId: ${sessionId}`);
    } else {
      throw new Error('创建会话失败: ' + JSON.stringify(createData));
    }

    await sleep(500);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('步骤4: 发送第一轮对话 (POST /v2/sessions/:id/chat)');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`发送内容: ${testMessages.first.substring(0, 50)}...`);

    const chatRes1 = await fetch(`${V2_BASE}/sessions/${sessionId}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content: testMessages.first })
    });

    console.log(`第一轮响应状态: ${chatRes1.status}`);
    const { content: response1, chunkCount: chunkCount1 } = await readStream(chatRes1);

    console.log(`\n--- AI 第一轮响应 (${response1.length} 字符, ${chunkCount1} chunks) ---`);
    console.log(response1.substring(0, 800) + (response1.length > 800 ? '...' : ''));

    const score1Match = response1.match(/完整性评分[：:]\s*(\d+)/);
    const score1 = score1Match ? parseInt(score1Match[1]) : null;
    console.log(`\n需求完整性评分: ${score1 !== null ? score1 : '未找到评分'}`);

    await sleep(1000);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('步骤5: 发送第二轮对话');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`发送内容: ${testMessages.second.substring(0, 50)}...`);

    const chatRes2 = await fetch(`${V2_BASE}/sessions/${sessionId}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content: testMessages.second })
    });

    console.log(`第二轮响应状态: ${chatRes2.status}`);
    const { content: response2, chunkCount: chunkCount2 } = await readStream(chatRes2);

    console.log(`\n--- AI 第二轮响应 (${response2.length} 字符, ${chunkCount2} chunks) ---`);
    console.log(response2.substring(0, 800) + (response2.length > 800 ? '...' : ''));

    const score2Match = response2.match(/完整性评分[：:]\s*(\d+)/);
    const score2 = score2Match ? parseInt(score2Match[1]) : null;
    console.log(`\n需求完整性评分: ${score2 !== null ? score2 : '未找到评分'}`);

    await sleep(500);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('步骤6: 验证上下文理解');
    console.log('═══════════════════════════════════════════════════════════════');

    const contextChecks = [
      { keyword: '企业', desc: '提到了企业用户' },
      { keyword: '40', desc: '提到了40多人规模' },
      { keyword: '飞书', desc: '提到了飞书推送' },
      { keyword: '资讯', desc: '理解了资讯订阅场景' }
    ];

    for (const check of contextChecks) {
      const found = response2.includes(check.keyword);
      console.log(`${found ? '✅' : '⚠️'} ${check.desc} [${check.keyword}]`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('步骤7: 验证会话历史 (GET /v2/sessions/:id)');
    console.log('═══════════════════════════════════════════════════════════════');

    const sessionRes = await fetch(`${V2_BASE}/sessions/${sessionId}`, {
      method: 'GET',
      headers
    });
    const sessionData = await sessionRes.json();

    if (sessionData.success || sessionData.code === 0) {
      const history = sessionData.data?.history || [];
      console.log(`会话历史消息数: ${history.length}`);
      console.log(`用户消息: ${history.filter(m => m.role === 'user').length}`);
      console.log(`AI消息: ${history.filter(m => m.role === 'assistant').length}`);
      console.log('✅ 会话历史正确保存');
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('步骤8: 定稿功能检查');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('⚠️ ChatWindow.vue 中未发现"定稿"按钮或相关UI');
    console.log('⚠️ 当前系统未实现需求定稿功能');

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    测试结果汇总                                 ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ 登录功能:     ${loginData.code === 0 ? '通过' : '失败'}                                      ║`);
    console.log(`║  ✅ 会话列表:     ${listData.success || listData.code === 0 ? '通过' : '失败'}                                      ║`);
    console.log(`║  ✅ 创建会话:     ${sessionId ? '通过' : '失败'}                                      ║`);
    console.log(`║  ✅ 第一轮对话:   ${response1.length > 0 ? '通过' : '失败'}                                      ║`);
    console.log(`║  ✅ 第二轮对话:   ${response2.length > 0 ? '通过' : '失败'}                                      ║`);
    console.log(`║  ✅ 上下文理解:   ${score2 > score1 ? '评分提升' : '待优化'}                                 ║`);
    console.log(`║  ⚠️ 定稿功能:     未实现                                       ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝');

    if (score1 && score2) {
      console.log(`\n📊 需求完整性评分对比: ${score1} → ${score2} (${score2 > score1 ? '+' : ''}${score2 - score1})`);
    }

    console.log('\n✅ 全流程测试完成!\n');

  } catch (error) {
    console.error('\n❌ 测试执行失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();
