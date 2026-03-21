import sessionService from './SessionService.js';
import routerService from './RouterService.js';
import promptBuilder from './PromptBuilder.js';
import skillService from './SkillService.js';
import artifactService from './ArtifactService.js';
import agentService from './AgentService.js';
import configService from './ConfigService.js';

class LegacySessionAdapter {
  constructor() {
    this.legacyFormat = true;
  }

  async createSession(userId, options = {}) {
    const session = sessionService.createSession(userId, options.agentId);
    return this.convertToLegacyFormat(session);
  }

  async sendMessage(sessionId, message) {
    const legacyMessage = this.convertFromLegacyMessage(message);
    const result = await sessionService.sendMessage(sessionId, legacyMessage);
    return this.convertToLegacyResponse(result);
  }

  async getHistory(sessionId) {
    const history = sessionService.getSessionHistory(sessionId);
    return history.map(msg => this.convertToLegacyMessage(msg));
  }

  async deleteSession(sessionId) {
    sessionService.deleteSession(sessionId);
    return { success: true };
  }

  convertToLegacyFormat(session) {
    if (!session) return null;
    return {
      id: session.id,
      userId: session.userId,
      agentId: session.agentId,
      createdAt: session.createdAt,
      status: session.status
    };
  }

  convertToLegacyResponse(result) {
    return {
      sessionId: result.response.sessionId,
      content: result.response.content?.text || '',
      artifacts: result.artifacts || [],
      modelId: result.response.modelId,
      providerId: result.response.providerId
    };
  }

  convertFromLegacyMessage(message) {
    return {
      id: message.id || null,
      sessionId: message.sessionId,
      role: message.role || 'user',
      content: {
        type: 'text',
        text: message.content
      },
      artifacts: message.artifacts || []
    };
  }

  convertToLegacyMessage(message) {
    return {
      id: message.id,
      sessionId: message.sessionId,
      role: message.role,
      content: message.content?.text || '',
      createdAt: message.createdAt
    };
  }
}

class LegacyModelAdapter {
  constructor() {
    this.legacyFormat = true;
  }

  async callModel(modelId, messages, options = {}) {
    const request = {
      modelId,
      messages: messages.map(msg => this.convertFromLegacyMessage(msg)),
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      topP: options.topP
    };

    const routeInfo = routerService.routeAPI(request);
    
    try {
      const result = await routerService.executeRequest(request, routeInfo.provider);
      return this.convertToLegacyResponse(result);
    } catch (error) {
      return routerService.executeWithFallback(request, (provider, error) => {
        console.warn(`Fallback to ${provider.id}`);
      });
    }
  }

  async *streamModel(modelId, messages, options = {}) {
    const request = {
      modelId,
      messages: messages.map(msg => this.convertFromLegacyMessage(msg)),
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      topP: options.topP
    };

    const routeInfo = routerService.routeAPI(request);
    const response = await routerService.executeRequest(request, routeInfo.provider);
    
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                yield { type: 'complete', content: '' };
              } else {
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    yield { type: 'chunk', content };
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }

    yield { type: 'complete', content: '' };
  }

  convertFromLegacyMessage(message) {
    return {
      role: message.role,
      content: message.content
    };
  }

  convertToLegacyResponse(result) {
    return {
      id: result.id,
      model: result.model,
      content: result.choices?.[0]?.message?.content || '',
      usage: result.usage,
      finishReason: result.choices?.[0]?.finish_reason
    };
  }
}

class LegacySkillAdapter {
  constructor() {
    this.legacyFormat = true;
  }

  async execute(skillId, context) {
    const skillContext = {
      sessionId: context.sessionId,
      userId: context.userId,
      agentId: context.agentId,
      currentPrompt: context.prompt || context.currentPrompt,
      artifacts: context.artifacts || [],
      history: context.history || []
    };

    const result = await skillService.executeSkill(skillId, skillContext);
    return this.convertToLegacyResult(result);
  }

  listSkills(agentId) {
    const skills = agentId 
      ? skillService.listAgentSkills(agentId)
      : skillService.listAllSkills();
    
    return skills.map(skill => this.convertToLegacySkill(skill));
  }

  validate(skillId) {
    const validation = skillService.validateSkill(skillId);
    return {
      valid: validation.valid,
      errors: validation.errors.map(e => e.message),
      warnings: validation.warnings.map(w => w.message)
    };
  }

  convertToLegacySkill(skill) {
    return {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      version: skill.version
    };
  }

  convertToLegacyResult(result) {
    return {
      success: result.success,
      output: result.output,
      artifacts: result.artifacts || []
    };
  }
}

const legacySessionAdapter = new LegacySessionAdapter();
const legacyModelAdapter = new LegacyModelAdapter();
const legacySkillAdapter = new LegacySkillAdapter();

export {
  LegacySessionAdapter,
  LegacyModelAdapter,
  LegacySkillAdapter,
  legacySessionAdapter,
  legacyModelAdapter,
  legacySkillAdapter
};

export default {
  session: legacySessionAdapter,
  model: legacyModelAdapter,
  skill: legacySkillAdapter
};