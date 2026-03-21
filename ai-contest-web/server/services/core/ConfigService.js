import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ApiKeyDetection {
  constructor(provider, baseUrl, modelPrefix) {
    this.provider = provider;
    this.baseUrl = baseUrl;
    this.modelPrefix = modelPrefix;
  }
}

export class ConstraintViolationError extends Error {
  constructor(message, violatedConstraint, blockedByLevel, attemptedAction) {
    super(message);
    this.name = 'ConstraintViolationError';
    this.violatedConstraint = violatedConstraint;
    this.blockedByLevel = blockedByLevel;
    this.attemptedAction = attemptedAction;
  }
}

export class ProviderNotFoundError extends Error {
  constructor(providerId) {
    super(`Provider not found: ${providerId}`);
    this.name = 'ProviderNotFoundError';
  }
}

export class SessionNotFoundError extends Error {
  constructor(sessionId) {
    super(`Session not found: ${sessionId}`);
    this.name = 'SessionNotFoundError';
  }
}

export class SkillExecutionError extends Error {
  constructor(message, skillId, originalError) {
    super(message);
    this.name = 'SkillExecutionError';
    this.skillId = skillId;
    this.originalError = originalError;
  }
}

class ConfigService {
  constructor() {
    this.configDir = path.join(__dirname, '../../config');
    this.systemConfig = null;
    this.providers = new Map();
    this.modelProviderMap = new Map();
    this.loadConfig();
  }

  loadConfig() {
    this.loadSystemConfig();
    this.loadProvidersConfig();
  }

  loadSystemConfig() {
    const systemPath = path.join(this.configDir, 'system.yaml');
    try {
      const content = fs.readFileSync(systemPath, 'utf8');
      const config = yaml.load(content);
      this.systemConfig = config;
    } catch (error) {
      console.error(`Failed to load system config from ${systemPath}:`, error.message);
      this.systemConfig = {
        system: {
          id: 'default-system',
          name: 'Default System',
          version: '1.0.0',
          metadata: {},
          defaultAgentId: 'default-agent',
          defaultProviderId: 'openai-primary'
        }
      };
    }
  }

  loadProvidersConfig() {
    const providersPath = path.join(this.configDir, 'providers.yaml');
    try {
      const content = fs.readFileSync(providersPath, 'utf8');
      const config = yaml.load(content);
      
      this.providers.clear();
      this.modelProviderMap.clear();
      
      if (config.providers && Array.isArray(config.providers)) {
        for (const provider of config.providers) {
          this.registerProvider(provider);
        }
      }
    } catch (error) {
      console.error(`Failed to load providers config from ${providersPath}:`, error.message);
    }
  }

  loadSystemConfigMethod() {
    return this.systemConfig;
  }

  getProvider(providerId) {
    return this.providers.get(providerId) || null;
  }

  listProviders() {
    return Array.from(this.providers.values());
  }

  getDefaultProvider() {
    const defaultId = this.systemConfig?.defaultProviderId;
    if (defaultId) {
      const provider = this.providers.get(defaultId);
      if (provider) return provider;
    }
    return this.providers.values().next().value || null;
  }

  detectApiKeyFormat(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return new ApiKeyDetection('custom', '', undefined);
    }

    const trimmedKey = apiKey.trim();
    
    if (trimmedKey.startsWith('sk-ant-')) {
      return new ApiKeyDetection('anthropic', 'https://api.anthropic.com/v1', undefined);
    }
    
    if (trimmedKey.startsWith('sk-')) {
      if (trimmedKey.startsWith('sk-proj-')) {
        return new ApiKeyDetection('openrouter', 'https://openrouter.ai/api/v1', 'openrouter/');
      }
      return new ApiKeyDetection('openai', 'https://api.openai.com/v1', undefined);
    }
    
    if (trimmedKey.startsWith('pplx-')) {
      return new ApiKeyDetection('perplexity', 'https://api.perplexity.ai', undefined);
    }

    return new ApiKeyDetection('custom', '', undefined);
  }

  registerProvider(provider) {
    if (!provider || !provider.id) return;
    
    this.providers.set(provider.id, provider);
    
    if (provider.supportedModels && Array.isArray(provider.supportedModels)) {
      for (const modelId of provider.supportedModels) {
        this.modelProviderMap.set(modelId, provider.id);
      }
    }
  }

  reloadConfig() {
    this.loadConfig();
  }

  getAgentConfig(agentId) {
    const agentPath = path.join(this.configDir, 'agents', agentId);
    try {
      const capabilityPath = path.join(agentPath, 'capability.yaml');
      const soulPath = path.join(agentPath, 'soul.yaml');
      const skillsPath = path.join(agentPath, 'skills.yaml');
      
      const capability = fs.existsSync(capabilityPath) 
        ? yaml.load(fs.readFileSync(capabilityPath, 'utf8'))
        : null;
      const soul = fs.existsSync(soulPath)
        ? yaml.load(fs.readFileSync(soulPath, 'utf8'))
        : null;
      const skills = fs.existsSync(skillsPath)
        ? yaml.load(fs.readFileSync(skillsPath, 'utf8'))
        : { skillIds: [] };
      
      return { capability, soul, skills, agentId };
    } catch (error) {
      console.error(`Failed to load agent config for ${agentId}:`, error.message);
      return null;
    }
  }

  selectProviderForModel(modelId) {
    const providerId = this.modelProviderMap.get(modelId);
    if (providerId) {
      return this.providers.get(providerId) || this.getDefaultProvider();
    }
    return this.getDefaultProvider();
  }

  getFallbackChain(providerId) {
    const provider = this.providers.get(providerId);
    if (!provider) return [];
    
    const chain = [provider];
    let currentProvider = provider;
    
    while (currentProvider.fallbackProviderId) {
      const fallback = this.providers.get(currentProvider.fallbackProviderId);
      if (fallback) {
        chain.push(fallback);
        currentProvider = fallback;
      } else {
        break;
      }
    }
    
    return chain;
  }
}

const configService = new ConfigService();
export default configService;
export { ConfigService };