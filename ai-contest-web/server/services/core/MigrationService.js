import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MigrationService {
  constructor() {
    this.migrationDir = path.join(__dirname, '../../../migration');
    this.sourceDir = path.join(__dirname, '../../../需求');
    this.targetDir = path.join(__dirname, '../../../artifacts/migrated');
  }

  async migrateSessionSamples() {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    const sessionSamplePath = path.join(this.sourceDir, '会话样例.jsonl');
    
    if (!fs.existsSync(sessionSamplePath)) {
      console.warn(`Source file not found: ${sessionSamplePath}`);
      results.errors.push(`Source file not found: ${sessionSamplePath}`);
      return results;
    }

    try {
      const content = fs.readFileSync(sessionSamplePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const session = JSON.parse(line);
          await this.migrateSession(session);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Failed to migrate session: ${error.message}`);
        }
      }
    } catch (error) {
      results.errors.push(`Failed to read source file: ${error.message}`);
    }

    return results;
  }

  async migrateSession(session) {
    const sessionId = session.sessionId || `legacy-${Date.now()}`;
    const agentId = session.agentId || 'default-agent';
    
    const targetSessionDir = path.join(this.targetDir, sessionId);
    fs.mkdirSync(targetSessionDir, { recursive: true });

    const migratedSession = {
      id: sessionId,
      userId: session.userId || 'anonymous',
      agentId,
      modelId: session.modelId || 'gpt-4o-mini',
      providerId: session.providerId || 'openai-primary',
      status: 'completed',
      createdAt: session.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      endedAt: session.endedAt || new Date().toISOString(),
      metadata: {
        migrated: true,
        originalSessionId: session.sessionId
      }
    };

    const sessionFile = path.join(targetSessionDir, 'session.json');
    fs.writeFileSync(sessionFile, JSON.stringify(migratedSession, null, 2), 'utf8');

    if (session.messages && Array.isArray(session.messages)) {
      const messagesFile = path.join(targetSessionDir, 'messages.jsonl');
      const messagesContent = session.messages
        .map(msg => JSON.stringify(this.convertMessage(msg, sessionId)))
        .join('\n');
      fs.writeFileSync(messagesFile, messagesContent, 'utf8');
    }

    if (session.artifacts && Array.isArray(session.artifacts)) {
      const artifactsDir = path.join(targetSessionDir, 'artifacts');
      fs.mkdirSync(artifactsDir, { recursive: true });

      for (const artifact of session.artifacts) {
        const artifactId = artifact.id || `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const artifactData = {
          id: artifactId,
          sessionId,
          type: artifact.type || 'document',
          name: artifact.name || 'Untitled',
          content: artifact.content,
          mimeType: artifact.mimeType || 'text/plain',
          size: artifact.content?.length || 0,
          metadata: artifact.metadata || {},
          createdAt: artifact.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const artifactFile = path.join(artifactsDir, `${artifactId}.json`);
        fs.writeFileSync(artifactFile, JSON.stringify(artifactData, null, 2), 'utf8');
      }
    }

    console.log(`Migrated session: ${sessionId}`);
  }

  convertMessage(msg, sessionId) {
    return {
      id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      role: msg.role || 'user',
      content: {
        type: msg.type || 'text',
        text: msg.content || ''
      },
      modelId: msg.modelId,
      providerId: msg.providerId,
      artifacts: msg.artifacts || [],
      createdAt: msg.createdAt || new Date().toISOString()
    };
  }

  async migrateAll() {
    console.log('Starting migration...');
    
    const sessionResults = await this.migrateSessionSamples();
    
    console.log('Migration completed!');
    console.log(`Success: ${sessionResults.success}`);
    console.log(`Failed: ${sessionResults.failed}`);
    
    if (sessionResults.errors.length > 0) {
      console.log('Errors:');
      for (const error of sessionResults.errors) {
        console.log(`  - ${error}`);
      }
    }

    return {
      sessionSamples: sessionResults
    };
  }
}

const migrationService = new MigrationService();

export { migrationService, MigrationService };
export default migrationService;