import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import configService from './ConfigService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AgentService {
  constructor() {
    this.agents = new Map();
    this.userAgentBindings = new Map();
    this.configDir = path.join(__dirname, '../../config');
  }

  getAgent(agentId) {
    if (this.agents.has(agentId)) {
      return this.agents.get(agentId);
    }
    return this.loadAgent(agentId);
  }

  loadAgent(agentId) {
    const agentConfig = configService.getAgentConfig(agentId);
    if (!agentConfig) {
      return null;
    }

    const agent = {
      id: agentId,
      name: agentConfig.capability?.name || agentId,
      systemId: configService.systemConfig?.system?.id || 'default-system',
      defaultModelId: agentConfig.capability?.defaultModelId || 'gpt-4o-mini',
      skillIds: agentConfig.skills?.skillIds || [],
      capability: agentConfig.capability || {
        agentId,
        features: [],
        permissions: [],
        boundaries: []
      },
      soul: agentConfig.soul || {
        agentId,
        identity: '',
        personality: {
          traits: {},
          communicationStyle: 'friendly',
          values: []
        },
        memory: [],
        coreMemories: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.agents.set(agentId, agent);
    return agent;
  }

  listAgents() {
    const agentsDir = path.join(this.configDir, 'agents');
    const agentIds = [];
    
    try {
      if (fs.existsSync(agentsDir)) {
        const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            agentIds.push(entry.name);
          }
        }
      }
    } catch (error) {
      console.error('Failed to list agents:', error.message);
    }

    return agentIds.map(id => this.getAgent(id)).filter(Boolean);
  }

  getDefaultAgent() {
    const defaultId = configService.systemConfig?.defaultAgentId || 'default-agent';
    return this.getAgent(defaultId);
  }

  createAgent(agentId) {
    const agentDir = path.join(this.configDir, 'agents', agentId);
    
    try {
      fs.mkdirSync(agentDir, { recursive: true });
      
      const capabilityPath = path.join(agentDir, 'capability.yaml');
      const soulPath = path.join(agentDir, 'soul.yaml');
      const skillsPath = path.join(agentDir, 'skills.yaml');

      if (!fs.existsSync(capabilityPath)) {
        const defaultCapability = {
          agentId,
          name: agentId,
          defaultModelId: 'gpt-4o-mini',
          features: [],
          permissions: [],
          boundaries: []
        };
        fs.writeFileSync(capabilityPath, yaml.dump(defaultCapability));
      }

      if (!fs.existsSync(soulPath)) {
        const defaultSoul = {
          agentId,
          identity: `You are ${agentId}`,
          personality: {
            traits: {},
            communicationStyle: 'friendly',
            values: []
          },
          memory: [],
          coreMemories: []
        };
        fs.writeFileSync(soulPath, yaml.dump(defaultSoul));
      }

      if (!fs.existsSync(skillsPath)) {
        const defaultSkills = { skillIds: [] };
        fs.writeFileSync(skillsPath, yaml.dump(defaultSkills));
      }

      return this.loadAgent(agentId);
    } catch (error) {
      console.error(`Failed to create agent ${agentId}:`, error.message);
      return null;
    }
  }

  updateSoul(agentId, soul) {
    const agent = this.getAgent(agentId);
    if (!agent) return;

    const soulPath = path.join(this.configDir, 'agents', agentId, 'soul.yaml');
    
    try {
      const updatedSoul = {
        ...agent.soul,
        ...soul,
        agentId
      };
      
      fs.writeFileSync(soulPath, yaml.dump(updatedSoul));
      
      agent.soul = updatedSoul;
      agent.updatedAt = new Date().toISOString();
      this.agents.set(agentId, agent);
    } catch (error) {
      console.error(`Failed to update soul for agent ${agentId}:`, error.message);
    }
  }

  bindUserToAgent(userId, agentId) {
    const agent = this.getAgent(agentId);
    if (!agent) {
      console.warn(`Agent ${agentId} not found, cannot bind to user ${userId}`);
      return;
    }
    
    this.userAgentBindings.set(userId, agentId);
    
    const userDir = path.join(__dirname, '../../users', userId);
    const userConfigPath = path.join(userDir, 'user.yaml');
    
    try {
      fs.mkdirSync(userDir, { recursive: true });
      
      let userConfig = {};
      if (fs.existsSync(userConfigPath)) {
        userConfig = yaml.load(fs.readFileSync(userConfigPath, 'utf8'));
      }
      
      userConfig.agentId = agentId;
      fs.writeFileSync(userConfigPath, yaml.dump(userConfig));
    } catch (error) {
      console.error(`Failed to bind user ${userId} to agent ${agentId}:`, error.message);
    }
  }

  getAgentForUser(userId) {
    const boundAgentId = this.userAgentBindings.get(userId);
    if (boundAgentId) {
      return this.getAgent(boundAgentId);
    }

    const userDir = path.join(__dirname, '../../users', userId);
    const userConfigPath = path.join(userDir, 'user.yaml');
    
    try {
      if (fs.existsSync(userConfigPath)) {
        const userConfig = yaml.load(fs.readFileSync(userConfigPath, 'utf8'));
        if (userConfig.agentId) {
          this.userAgentBindings.set(userId, userConfig.agentId);
          return this.getAgent(userConfig.agentId);
        }
      }
    } catch (error) {
      console.error(`Failed to get agent for user ${userId}:`, error.message);
    }

    return this.getDefaultAgent();
  }
}

const agentService = new AgentService();
export default agentService;
export { AgentService };