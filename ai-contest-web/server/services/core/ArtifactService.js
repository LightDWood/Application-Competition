import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class ArtifactService {
  constructor() {
    this.artifacts = new Map();
    this.baseDir = path.join(__dirname, '../../../artifacts');
  }

  async saveArtifact(sessionId, artifact) {
    const artifactId = artifact.id || generateUUID();

    if (artifact.type === 'requirement-doc') {
      const artifactDir = path.join(this.baseDir, sessionId);
      const timestamp = Date.now();
      const fileName = `需求文档_${timestamp}.md`;
      const artifactFile = path.join(artifactDir, fileName);

      const artifactData = {
        id: artifactId,
        sessionId,
        type: 'requirement-doc',
        name: artifact.name || `需求文档_${timestamp}`,
        content: artifact.content,
        fileName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.artifacts.set(artifactId, artifactData);

      try {
        fs.mkdirSync(artifactDir, { recursive: true });
        fs.writeFileSync(artifactFile, artifact.content, 'utf8');
        console.log(`Saved requirement doc: ${artifactFile}`);
      } catch (error) {
        console.error(`Failed to save requirement doc ${artifactId}:`, error.message);
      }

      return artifactId;
    }

    const artifactData = {
      id: artifactId,
      sessionId,
      type: artifact.type || 'other',
      name: artifact.name || 'Untitled',
      content: artifact.content,
      mimeType: artifact.mimeType || 'application/octet-stream',
      size: artifact.size || 0,
      metadata: artifact.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.artifacts.set(artifactId, artifactData);

    const artifactDir = path.join(this.baseDir, sessionId);
    const artifactFile = path.join(artifactDir, `${artifactId}.json`);

    try {
      fs.mkdirSync(artifactDir, { recursive: true });
      fs.writeFileSync(artifactFile, JSON.stringify(artifactData, null, 2), 'utf8');
      console.log(`Saved artifact: ${artifactFile}`);
    } catch (error) {
      console.error(`Failed to save artifact ${artifactId}:`, error.message);
    }

    return artifactId;
  }

  getArtifact(artifactId) {
    if (this.artifacts.has(artifactId)) {
      return this.artifacts.get(artifactId);
    }

    for (const [sessionId] of this.artifacts) {
      const artifactPath = path.join(this.baseDir, sessionId, `${artifactId}.json`);
      if (fs.existsSync(artifactPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
          this.artifacts.set(artifactId, data);
          return data;
        } catch (error) {
          console.error(`Failed to load artifact ${artifactId}:`, error.message);
        }
      }
    }

    for (const sessionDir of fs.readdirSync(this.baseDir)) {
      const artifactPath = path.join(this.baseDir, sessionDir, `${artifactId}.json`);
      if (fs.existsSync(artifactPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
          this.artifacts.set(artifactId, data);
          return data;
        } catch (error) {
          console.error(`Failed to load artifact ${artifactId}:`, error.message);
        }
      }
    }

    for (const sessionDir of fs.readdirSync(this.baseDir)) {
      const sessionPath = path.join(this.baseDir, sessionDir);
      if (!fs.statSync(sessionPath).isDirectory()) continue;

      try {
        const files = fs.readdirSync(sessionPath);
        for (const file of files) {
          if (file.endsWith('.md') && (file.includes(artifactId) || file.startsWith('需求文档_'))) {
            const filePath = path.join(sessionPath, file);
            const data = {
              id: artifactId,
              sessionId: sessionDir,
              fileName: file,
              filePath: filePath,
              type: 'requirement-doc'
            };
            this.artifacts.set(artifactId, data);
            return data;
          }
        }
      } catch (e) {
        continue;
      }
    }

    return null;
  }

  getRequirementDoc(sessionId) {
    const sessionDir = path.join(this.baseDir, sessionId);

    if (!fs.existsSync(sessionDir)) {
      return null;
    }

    try {
      const files = fs.readdirSync(sessionDir);
      for (const file of files) {
        if (file.startsWith('需求文档_') && file.endsWith('.md')) {
          const filePath = path.join(sessionDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          return {
            sessionId,
            fileName: file,
            content,
            filePath
          };
        }
      }
    } catch (error) {
      console.error(`Failed to get requirement doc for session ${sessionId}:`, error.message);
    }

    return null;
  }

  listSessionArtifacts(sessionId) {
    const artifacts = [];
    const sessionDir = path.join(this.baseDir, sessionId);

    if (!fs.existsSync(sessionDir)) {
      return artifacts;
    }

    try {
      const files = fs.readdirSync(sessionDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const artifactPath = path.join(sessionDir, file);
          try {
            const data = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
            artifacts.push(data);
            this.artifacts.set(data.id, data);
          } catch (error) {
            console.error(`Failed to load artifact from ${artifactPath}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to list artifacts for session ${sessionId}:`, error.message);
    }

    return artifacts;
  }

  deleteArtifact(artifactId) {
    const artifact = this.getArtifact(artifactId);
    if (!artifact) {
      return false;
    }

    const artifactPath = path.join(this.baseDir, artifact.sessionId, `${artifactId}.json`);

    try {
      if (fs.existsSync(artifactPath)) {
        fs.unlinkSync(artifactPath);
      }
      this.artifacts.delete(artifactId);
      return true;
    } catch (error) {
      console.error(`Failed to delete artifact ${artifactId}:`, error.message);
      return false;
    }
  }

  updateArtifact(artifactId, artifact) {
    const existing = this.getArtifact(artifactId);
    if (!existing) {
      return false;
    }

    const updated = {
      ...existing,
      ...artifact,
      id: artifactId,
      updatedAt: new Date().toISOString()
    };

    this.artifacts.set(artifactId, updated);

    const artifactPath = path.join(this.baseDir, updated.sessionId, `${artifactId}.json`);

    try {
      fs.writeFileSync(artifactPath, JSON.stringify(updated, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error(`Failed to update artifact ${artifactId}:`, error.message);
      return false;
    }
  }

  async createSessionStorage(sessionId) {
    const sessionDir = path.join(this.baseDir, sessionId);
    try {
      fs.mkdirSync(sessionDir, { recursive: true });
      return;
    } catch (error) {
      console.error(`Failed to create session storage for ${sessionId}:`, error.message);
      throw error;
    }
  }

  async deleteSessionStorage(sessionId) {
    const sessionDir = path.join(this.baseDir, sessionId);
    try {
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      }
      for (const [artifactId, artifact] of this.artifacts) {
        if (artifact.sessionId === sessionId) {
          this.artifacts.delete(artifactId);
        }
      }
      return;
    } catch (error) {
      console.error(`Failed to delete session storage for ${sessionId}:`, error.message);
      throw error;
    }
  }
}

const artifactService = new ArtifactService();
export default artifactService;
export { ArtifactService };