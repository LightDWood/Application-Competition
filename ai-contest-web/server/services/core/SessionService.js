import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import configService from './ConfigService.js';
import agentService from './AgentService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class SessionService {
  constructor() {
    this.sessions = new Map();
    this.messages = new Map();
    this.baseDir = path.join(__dirname, '../../');
    this.sessionsIndexFile = path.join(this.baseDir, 'sessions-index.json');
    this.initialize();
  }

  initialize() {
    console.log('[SessionService] Initializing, loading sessions from disk...');
    this.loadSessionsFromDisk();
  }

  loadSessionsFromDisk() {
    const usersDir = path.join(this.baseDir, 'users');
    const agentsDir = path.join(this.baseDir, 'agents');

    let loadedCount = 0;

    if (fs.existsSync(usersDir)) {
      try {
        const userDirs = fs.readdirSync(usersDir, { withFileTypes: true });
        for (const userDir of userDirs) {
          if (!userDir.isDirectory()) continue;
          const userId = userDir.name;
          const sessionsDir = path.join(usersDir, userId, 'sessions');
          if (!fs.existsSync(sessionsDir)) continue;

          const sessionFiles = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.jsonl'));
          for (const sessionFile of sessionFiles) {
            const sessionId = sessionFile.replace('.jsonl', '');
            const sessionFilePath = path.join(sessionsDir, sessionFile);

            try {
              const content = fs.readFileSync(sessionFilePath, 'utf8');
              const lines = content.split('\n').filter(line => line.trim());

              if (lines.length === 0) continue;

              const session = this.extractSessionFromMessages(sessionId, userId, lines);
              if (session) {
                this.sessions.set(sessionId, session);
                console.log(`[SessionService] Loaded session: ${sessionId} (${session.title})`);
                loadedCount++;
              }
            } catch (err) {
              console.error(`[SessionService] Failed to load session ${sessionId}:`, err.message);
            }
          }
        }
      } catch (error) {
        console.error('[SessionService] Failed to load sessions from users directory:', error.message);
      }
    }

    if (fs.existsSync(agentsDir)) {
      try {
        const agentDirs = fs.readdirSync(agentsDir, { withFileTypes: true });
        for (const agentDir of agentDirs) {
          if (!agentDir.isDirectory()) continue;
          const sessionsDir = path.join(agentsDir, agentDir.name, 'sessions');
          if (!fs.existsSync(sessionsDir)) continue;

          const sessionFiles = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.jsonl'));
          for (const sessionFile of sessionFiles) {
            const sessionId = sessionFile.replace('.jsonl', '');
            if (this.sessions.has(sessionId)) continue;

            const sessionFilePath = path.join(sessionsDir, sessionFile);

            try {
              const content = fs.readFileSync(sessionFilePath, 'utf8');
              const lines = content.split('\n').filter(line => line.trim());

              if (lines.length === 0) continue;

              const session = this.extractSessionFromMessages(sessionId, 'default-user', lines);
              if (session) {
                this.sessions.set(sessionId, session);
                console.log(`[SessionService] Loaded legacy session: ${sessionId} (${session.title})`);
                loadedCount++;
              }
            } catch (err) {
              console.error(`[SessionService] Failed to load legacy session ${sessionId}:`, err.message);
            }
          }
        }
      } catch (error) {
        console.error('[SessionService] Failed to load sessions from agents directory:', error.message);
      }
    }

    const activeSessions = Array.from(this.sessions.values()).filter(s => s.status === 'active');
    console.log(`[SessionService] Initialized ${activeSessions.length} active sessions from disk`);
  }

  extractSessionFromMessages(sessionId, userId, messageLines) {
    if (messageLines.length === 0) return null;

    let firstUserMessage = null;
    let lastMessageTime = null;

    for (const line of messageLines) {
      try {
        const msg = JSON.parse(line);
        if (msg.role === 'user' && !firstUserMessage) {
          const content = typeof msg.content === 'string' ? msg.content : (msg.content?.text || '');
          firstUserMessage = content.substring(0, 50);
        }
        if (msg.createdAt) {
          const msgTime = new Date(msg.createdAt).getTime();
          if (!lastMessageTime || msgTime > lastMessageTime) {
            lastMessageTime = msgTime;
          }
        }
      } catch (e) {
        continue;
      }
    }

    const provider = configService.getDefaultProvider();
    const agent = agentService.getAgent('default-agent');
    const modelId = agent?.defaultModelId || 'gpt-4o-mini';

    return {
      id: sessionId,
      userId: userId,
      agentId: 'default-agent',
      modelId: modelId,
      providerId: provider?.id || 'openai-primary',
      status: 'active',
      title: firstUserMessage || '历史会话',
      createdAt: messageLines[0] ? (() => {
        try { return JSON.parse(messageLines[0]).createdAt; } catch { return new Date().toISOString(); }
      })() : new Date().toISOString(),
      updatedAt: lastMessageTime ? new Date(lastMessageTime).toISOString() : new Date().toISOString(),
      endedAt: null,
      metadata: {
        title: firstUserMessage || '历史会话'
      }
    };
  }

  createSession(userId, agentId, title) {
    const effectiveAgentId = agentId || configService.systemConfig?.defaultAgentId || 'default-agent';
    const agent = agentService.getAgent(effectiveAgentId);

    if (!agent) {
      console.error(`Agent ${effectiveAgentId} not found`);
      return null;
    }

    const provider = configService.getDefaultProvider();
    const modelId = agent.defaultModelId || 'gpt-4o-mini';

    const session = {
      id: generateUUID(),
      userId,
      agentId: effectiveAgentId,
      modelId,
      providerId: provider?.id || 'openai-primary',
      status: 'active',
      title: title || '新会话',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      endedAt: null,
      metadata: {
        title: title || '新会话'
      }
    };

    this.sessions.set(session.id, session);
    this.messages.set(session.id, []);

    this.createSessionStorage(session.id);

    return session;
  }

  createSessionStorage(sessionId) {
    const storageDir = path.join(this.baseDir, 'artifacts', sessionId);
    try {
      fs.mkdirSync(storageDir, { recursive: true });
      console.log(`Created session storage: ${storageDir}`);
    } catch (error) {
      console.error(`Failed to create session storage for ${sessionId}:`, error.message);
    }
  }

  async sendMessage(sessionId, message) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const assistantMessage = {
      id: generateUUID(),
      sessionId,
      role: 'assistant',
      content: {
        type: 'text',
        text: 'This is a placeholder response. LLM routing will be implemented in RouterService.'
      },
      modelId: session.modelId,
      providerId: session.providerId,
      artifacts: [],
      createdAt: new Date().toISOString()
    };

    this.addMessage(sessionId, assistantMessage);

    return {
      response: assistantMessage,
      artifacts: [],
      routedTo: {
        type: 'model',
        targetId: session.modelId
      }
    };
  }

  getSessionHistory(sessionId) {
    if (!this.messages.has(sessionId) || this.messages.get(sessionId).length === 0) {
      this.loadSessionHistory(sessionId);
    }
    return this.messages.get(sessionId) || [];
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId) || null;
    if (session && !this.messages.has(sessionId)) {
      this.loadSessionHistory(sessionId);
    }
    return session;
  }

  deleteSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'completed';
    session.endedAt = new Date().toISOString();
    session.updatedAt = new Date().toISOString();

    this.deleteSessionStorage(sessionId);
    
    this.sessions.delete(sessionId);
    this.messages.delete(sessionId);
  }

  deleteSessionStorage(sessionId) {
    const storageDir = path.join(this.baseDir, 'artifacts', sessionId);
    try {
      if (fs.existsSync(storageDir)) {
        fs.rmSync(storageDir, { recursive: true, force: true });
        console.log(`Deleted session storage: ${storageDir}`);
      }
    } catch (error) {
      console.error(`Failed to delete session storage for ${sessionId}:`, error.message);
    }
  }

  addMessage(sessionId, message) {
    if (!this.messages.has(sessionId)) {
      this.messages.set(sessionId, []);
    }
    
    const messages = this.messages.get(sessionId);
    messages.push(message);
    
    const session = this.sessions.get(sessionId);
    if (session) {
      session.updatedAt = new Date().toISOString();
      this.sessions.set(sessionId, session);
    }

    this.persistMessage(sessionId, message);
  }

  persistMessage(sessionId, message) {
    const session = this.sessions.get(sessionId);
    const userId = session?.userId || 'default-user';
    const sessionFile = path.join(
      this.baseDir,
      'users',
      userId,
      'sessions',
      `${sessionId}.jsonl`
    );

    try {
      const sessionDir = path.dirname(sessionFile);
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }

      const line = JSON.stringify(message) + '\n';
      fs.appendFileSync(sessionFile, line, 'utf8');
    } catch (error) {
      console.error(`Failed to persist message for session ${sessionId}:`, error.message);
    }
  }

  loadSessionHistory(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    const userId = session.userId || 'default-user';
    const sessionFile = path.join(
      this.baseDir,
      'users',
      userId,
      'sessions',
      `${sessionId}.jsonl`
    );

    try {
      if (fs.existsSync(sessionFile)) {
        const content = fs.readFileSync(sessionFile, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        const messages = lines.map(line => JSON.parse(line));
        this.messages.set(sessionId, messages);
        return messages;
      }
    } catch (error) {
      console.error(`Failed to load session history for ${sessionId}:`, error.message);
    }

    return [];
  }

  getUserSessions(userId) {
    const userSessions = [];
    for (const session of this.sessions.values()) {
      if (session.userId === userId) {
        userSessions.push(session);
      }
    }
    if (userSessions.length === 0 && userId !== 'default-user') {
      for (const session of this.sessions.values()) {
        if (session.userId === 'default-user') {
          session.userId = userId;
        }
        userSessions.push(session);
      }
    }
    return userSessions.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

const sessionService = new SessionService();
export default sessionService;
export { SessionService };