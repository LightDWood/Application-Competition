import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import configService from './ConfigService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RouterService {
  constructor() {
    this.activeProviderId = null;
    this.fallbackChain = [];
  }

  routeAPI(request, providerId) {
    const provider = providerId 
      ? configService.getProvider(providerId) 
      : configService.selectProviderForModel(request.modelId);

    if (!provider) {
      throw new Error(`No provider available for model: ${request.modelId}`);
    }

    return {
      provider,
      endpoint: `${provider.apiEndpoint}/chat/completions`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      request
    };
  }

  routeMessage(message, context) {
    const { session, agent, skills, artifacts } = context;

    if (skills && skills.length > 0) {
      for (const skill of skills) {
        if (skill.triggerConditions && skill.triggerConditions.length > 0) {
          for (const condition of skill.triggerConditions) {
            if (this.matchCondition(message.content, condition)) {
              return {
                destination: 'skill',
                targetId: skill.id,
                confidence: condition.weight,
                reasoning: `Matched trigger condition: ${condition.pattern}`
              };
            }
          }
        }
      }
    }

    return {
      destination: 'model',
      targetId: session.modelId,
      providerId: session.providerId,
      confidence: 1.0,
      reasoning: 'Default routing to model'
    };
  }

  matchCondition(content, condition) {
    if (!content || !condition || !condition.pattern) {
      return false;
    }

    try {
      switch (condition.type) {
        case 'keyword':
          return content.toLowerCase().includes(condition.pattern.toLowerCase());
        
        case 'pattern':
          const regex = new RegExp(condition.pattern, 'i');
          return regex.test(content);
        
        case 'intent':
          const intentKeywords = this.getIntentKeywords(condition.pattern);
          return intentKeywords.some(kw => content.toLowerCase().includes(kw.toLowerCase()));
        
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error matching condition:`, error.message);
      return false;
    }
  }

  getIntentKeywords(intent) {
    const intentMap = {
      'analyze': ['分析', 'analyze', '评估', 'evaluate'],
      'create': ['创建', '生成', '新建', 'create', 'generate'],
      'query': ['查询', '搜索', '找', 'query', 'search', 'find'],
      'modify': ['修改', '编辑', '更新', 'modify', 'edit', 'update'],
      'delete': ['删除', 'remove', 'delete'],
      'help': ['帮助', 'help', '怎么', '如何', '请问']
    };

    return intentMap[intent] || [intent];
  }

  switchProvider(providerId) {
    const provider = configService.getProvider(providerId);
    if (!provider) {
      console.warn(`Provider not found: ${providerId}`);
      return false;
    }

    this.activeProviderId = providerId;
    this.fallbackChain = configService.getFallbackChain(providerId);
    return true;
  }

  getActiveProvider() {
    if (this.activeProviderId) {
      return configService.getProvider(this.activeProviderId);
    }
    return configService.getDefaultProvider();
  }

  getFallbackChain() {
    if (this.fallbackChain.length > 0) {
      return this.fallbackChain;
    }

    const activeProvider = this.getActiveProvider();
    if (activeProvider) {
      this.fallbackChain = configService.getFallbackChain(activeProvider.id);
    }

    return this.fallbackChain;
  }

  selectProviderForModel(modelId) {
    return configService.selectProviderForModel(modelId);
  }

  async executeWithFallback(request, onFallback) {
    const chain = this.getFallbackChain();
    const errors = [];

    for (const provider of chain) {
      try {
        const result = await this.executeRequest(request, provider);
        return result;
      } catch (error) {
        errors.push({ provider: provider.id, error: error.message });
        console.warn(`Provider ${provider.id} failed, trying fallback...`);
        
        if (onFallback) {
          onFallback(provider, error);
        }
      }
    }

    throw new Error(`All providers in fallback chain failed: ${errors.map(e => e.provider).join(', ')}`);
  }

  async executeRequest(request, provider) {
    const endpoint = `${provider.apiEndpoint}/chat/completions`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: request.modelId,
        messages: request.messages,
        temperature: request.temperature ?? provider.defaults?.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? provider.defaults?.maxTokens ?? 2000,
        top_p: request.topP ?? provider.defaults?.topP ?? 1.0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}

const routerService = new RouterService();
export default routerService;
export { RouterService };