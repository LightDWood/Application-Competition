import db from './server/models/index.js';
import fs from 'fs';
import path from 'path';

const { Session, Message, User } = db;

async function getAdminConversations() {
  try {
    // 查找 admin 用户
    const admin = await User.findOne({ 
      where: { username: 'admin' },
      attributes: ['id', 'username', 'email', 'role']
    });
    
    if (!admin) {
      console.log('未找到 admin 用户');
      return;
    }
    
    console.log('=== Admin 用户信息 ===');
    console.log('用户 ID:', admin.id);
    console.log('用户名:', admin.username);
    console.log('邮箱:', admin.email);
    console.log('角色:', admin.role);
    console.log('');
    
    // 查找所有会话
    const sessions = await Session.findAll({ 
      where: { user_id: admin.id },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'title', 'status', 'created_at', 'updated_at']
    });
    
    console.log(`=== 会话数量：${sessions.length} ===\n`);
    
    const conversationLogs = [];
    
    for (const session of sessions) {
      const sessionLog = {
        sessionInfo: {
          id: session.id,
          title: session.title,
          status: session.status,
          createdAt: session.created_at,
          updatedAt: session.updated_at
        },
        messages: []
      };
      
      console.log(`--- 会话：${session.title} ---`);
      console.log(`会话 ID: ${session.id}`);
      console.log(`创建时间：${session.created_at}`);
      console.log(`状态：${session.status}`);
      
      // 查找该会话的所有消息
      const messages = await Message.findAll({ 
        where: { session_id: session.id },
        order: [['created_at', 'ASC']],
        attributes: ['id', 'role', 'content', 'created_at']
      });
      
      console.log(`消息数量：${messages.length}\n`);
      
      messages.forEach((msg, index) => {
        const roleLabel = msg.role === 'user' ? '👤 用户' : '🤖 AI';
        const contentPreview = msg.content.length > 200 
          ? msg.content.substring(0, 200) + '...' 
          : msg.content;
        
        console.log(`[${index + 1}] ${roleLabel} (${msg.created_at}):`);
        console.log(`${contentPreview}\n`);
        
        sessionLog.messages.push({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at
        });
      });
      
      console.log('='.repeat(80) + '\n');
      conversationLogs.push(sessionLog);
    }
    
    // 生成并保存 Markdown 报告
    await generateAndSaveReport(admin, conversationLogs);
    
  } catch (error) {
    console.error('查询失败:', error);
  }
}

async function generateAndSaveReport(admin, conversationLogs) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `admin-conversation-log-${timestamp}.md`;
  const outputPath = path.join(process.cwd(), '对话日志', filename);
  
  let report = `# Admin 用户对话日志\n\n`;
  report += `**生成时间**: ${new Date().toLocaleString('zh-CN')}\n`;
  report += `**用户**: ${admin.username} (${admin.email})\n`;
  report += `**角色**: ${admin.role}\n`;
  report += `**总会话数**: ${conversationLogs.length}\n\n`;
  report += `---\n\n`;
  
  conversationLogs.forEach((log, index) => {
    report += `## 会话 ${index + 1}: ${log.sessionInfo.title}\n\n`;
    report += `**会话 ID**: ${log.sessionInfo.id}\n`;
    report += `**创建时间**: ${log.sessionInfo.createdAt}\n`;
    report += `**状态**: ${log.sessionInfo.status}\n`;
    report += `**消息数量**: ${log.messages.length}\n\n`;
    
    if (log.messages.length === 0) {
      report += `*此会话暂无消息记录*\n\n`;
    } else {
      log.messages.forEach((msg, msgIndex) => {
        const roleLabel = msg.role === 'user' ? '👤 **用户**' : '🤖 **AI**';
        report += `### 消息 ${msgIndex + 1} - ${roleLabel}\n\n`;
        report += `**时间**: ${msg.timestamp}\n\n`;
        report += `**内容**:\n\n\`\`\`\n${msg.content}\n\`\`\`\n\n`;
      });
    }
    
    report += `---\n\n`;
  });
  
  report += `**报告结束**\n`;
  
  // 写入文件
  try {
    await fs.promises.writeFile(outputPath, report, 'utf-8');
    console.log('✅ 对话日志报告已生成并保存');
    console.log(`📄 文件路径：${outputPath}`);
    console.log(`\n报告包含 ${conversationLogs.length} 个会话`);
    
    // 统计总消息数
    const totalMessages = conversationLogs.reduce((sum, log) => sum + log.messages.length, 0);
    console.log(`总消息数：${totalMessages}`);
  } catch (error) {
    console.error('保存文件失败:', error);
  }
}

// 执行查询
getAdminConversations();
