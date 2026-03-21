import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import configService from './ConfigService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UserService {
  constructor() {
    this.users = new Map();
    this.usersDir = path.join(__dirname, '../../../users');
  }

  getUser(userId) {
    if (this.users.has(userId)) {
      return this.users.get(userId);
    }

    const userPath = path.join(this.usersDir, userId, 'user.yaml');
    
    if (fs.existsSync(userPath)) {
      try {
        const userData = yaml.load(fs.readFileSync(userPath, 'utf8'));
        this.users.set(userId, userData);
        return userData;
      } catch (error) {
        console.error(`Failed to load user ${userId}:`, error.message);
      }
    }

    return null;
  }

  createUser(user) {
    const userDir = path.join(this.usersDir, user.id);
    const userPath = path.join(userDir, 'user.yaml');
    const preferencesPath = path.join(userDir, 'preferences.yaml');

    try {
      fs.mkdirSync(userDir, { recursive: true });

      const now = new Date().toISOString();
      const userData = {
        id: user.id,
        name: user.name,
        systemId: user.systemId || 'ai-contest-system',
        agentId: user.agentId || configService.systemConfig?.defaultAgentId || 'default-agent',
        preferences: user.preferences || {
          language: 'zh-CN',
          notificationEnabled: true
        },
        createdAt: now,
        updatedAt: now
      };

      fs.writeFileSync(userPath, yaml.dump(userData), 'utf8');
      
      if (!fs.existsSync(preferencesPath)) {
        fs.writeFileSync(preferencesPath, yaml.dump(userData.preferences), 'utf8');
      }

      this.users.set(user.id, userData);
      return userData;
    } catch (error) {
      console.error(`Failed to create user ${user.id}:`, error.message);
      return null;
    }
  }

  updateUser(userId, user) {
    const existing = this.getUser(userId);
    if (!existing) {
      return null;
    }

    const userPath = path.join(this.usersDir, userId, 'user.yaml');
    
    try {
      const updated = {
        ...existing,
        ...user,
        id: userId,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(userPath, yaml.dump(updated), 'utf8');
      this.users.set(userId, updated);
      return updated;
    } catch (error) {
      console.error(`Failed to update user ${userId}:`, error.message);
      return null;
    }
  }

  deleteUser(userId) {
    const userDir = path.join(this.usersDir, userId);
    
    try {
      if (fs.existsSync(userDir)) {
        fs.rmSync(userDir, { recursive: true, force: true });
      }
      this.users.delete(userId);
      return true;
    } catch (error) {
      console.error(`Failed to delete user ${userId}:`, error.message);
      return false;
    }
  }

  getPreferences(userId) {
    const user = this.getUser(userId);
    if (user && user.preferences) {
      return user.preferences;
    }

    const preferencesPath = path.join(this.usersDir, userId, 'preferences.yaml');
    
    if (fs.existsSync(preferencesPath)) {
      try {
        return yaml.load(fs.readFileSync(preferencesPath, 'utf8'));
      } catch (error) {
        console.error(`Failed to load preferences for ${userId}:`, error.message);
      }
    }

    return {
      language: 'zh-CN',
      notificationEnabled: true
    };
  }

  updatePreferences(userId, preferences) {
    const user = this.getUser(userId);
    if (!user) {
      return null;
    }

    const preferencesPath = path.join(this.usersDir, userId, 'preferences.yaml');
    
    try {
      const updated = {
        ...user.preferences,
        ...preferences
      };

      fs.writeFileSync(preferencesPath, yaml.dump(updated), 'utf8');
      
      user.preferences = updated;
      user.updatedAt = new Date().toISOString();
      fs.writeFileSync(path.join(this.usersDir, userId, 'user.yaml'), yaml.dump(user), 'utf8');
      
      this.users.set(userId, user);
      return updated;
    } catch (error) {
      console.error(`Failed to update preferences for ${userId}:`, error.message);
      return null;
    }
  }

  listUsers() {
    const users = [];
    
    if (!fs.existsSync(this.usersDir)) {
      return users;
    }

    try {
      const entries = fs.readdirSync(this.usersDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const user = this.getUser(entry.name);
          if (user) {
            users.push(user);
          }
        }
      }
    } catch (error) {
      console.error('Failed to list users:', error.message);
    }

    return users;
  }
}

const userService = new UserService();
export default userService;
export { UserService };