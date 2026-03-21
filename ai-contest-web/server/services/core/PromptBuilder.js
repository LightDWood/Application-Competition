import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PromptBuilder {
  constructor() {
    this.constraintLayers = [];
  }

  buildPrompt(context, sessionOverride) {
    const { system, agent, skills, session: contextSession, activeSkillId } = context;
    const session = sessionOverride || contextSession;

    const systemPrompt = this.buildSystemPrompt(system);
    const agentPrompt = this.buildAgentPrompt(agent);
    const skillPrompt = activeSkillId 
      ? this.buildSkillPrompt(skills, activeSkillId) 
      : '';
    const sessionPrompt = this.buildSessionPrompt(session);

    return {
      system: systemPrompt,
      agent: agentPrompt,
      skill: skillPrompt || undefined,
      session: sessionPrompt,
      constraints: this.extractConstraints(context),
      modelConfig: this.getModelConfig(system, agent, session)
    };
  }

  buildSystemPrompt(system) {
    if (!system) return '';

    const lines = [];
    
    if (system.system) {
      lines.push(`# System: ${system.system.name || 'AI Contest System'}`);
      lines.push(`Version: ${system.system.version || '1.0.0'}`);
      
      if (system.system.metadata) {
        lines.push('');
        for (const [key, value] of Object.entries(system.system.metadata)) {
          lines.push(`- ${key}: ${value}`);
        }
      }
    }

    if (system.providers && system.providers.length > 0) {
      lines.push('');
      lines.push('## Available Models');
      for (const provider of system.providers) {
        lines.push(`- ${provider.name}: ${provider.supportedModels?.join(', ') || 'N/A'}`);
      }
    }

    return lines.join('\n');
  }

  buildAgentPrompt(agent) {
    if (!agent) return '';

    const lines = [];

    if (agent.soul) {
      lines.push(`# Identity`);
      lines.push(agent.soul.identity || `You are ${agent.name}`);
      lines.push('');

      if (agent.soul.personality) {
        lines.push('## Personality');
        if (agent.soul.personality.traits) {
          for (const [trait, value] of Object.entries(agent.soul.personality.traits)) {
            lines.push(`- ${trait}: ${value}`);
          }
        }
        if (agent.soul.personality.communicationStyle) {
          lines.push(`- Communication Style: ${agent.soul.personality.communicationStyle}`);
        }
        lines.push('');
      }

      if (agent.soul.coreMemories && agent.soul.coreMemories.length > 0) {
        lines.push('## Core Memories');
        for (const memory of agent.soul.coreMemories) {
          lines.push(`- ${memory.key}: ${memory.value}`);
        }
        lines.push('');
      }
    }

    if (agent.capability) {
      lines.push('## Capabilities');
      
      if (agent.capability.features && agent.capability.features.length > 0) {
        for (const feature of agent.capability.features) {
          lines.push(`- ${feature}`);
        }
      }
      lines.push('');

      if (agent.capability.boundaries && agent.capability.boundaries.length > 0) {
        lines.push('## Boundaries');
        for (const boundary of agent.capability.boundaries) {
          const prefix = boundary.type === 'forbid' ? '[FORBIDDEN]' 
            : boundary.type === 'restrict' ? '[RESTRICTED]' 
            : '[WARN]';
          lines.push(`${prefix} ${boundary.scope}: ${boundary.description}`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  buildSkillPrompt(skills, activeSkillId) {
    if (!skills || !activeSkillId) return '';

    const skill = skills.find(s => s.id === activeSkillId);
    if (!skill) return '';

    const lines = [];
    lines.push(`# Active Skill: ${skill.name}`);
    lines.push('');

    if (skill.description) {
      lines.push(skill.description);
      lines.push('');
    }

    if (skill.instructions) {
      lines.push('## Instructions');
      lines.push(skill.instructions);
      lines.push('');
    }

    if (skill.constraints && skill.constraints.length > 0) {
      lines.push('## Skill Constraints');
      for (const constraint of skill.constraints) {
        lines.push(`- [${constraint.type.toUpperCase()}] ${constraint.rule}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  buildSessionPrompt(session) {
    if (!session) return '';

    const lines = [];
    lines.push('# Current Session');
    lines.push(`Session ID: ${session.id}`);
    lines.push(`Created: ${session.createdAt}`);
    lines.push('');

    if (session.metadata) {
      lines.push('## Session Metadata');
      for (const [key, value] of Object.entries(session.metadata)) {
        lines.push(`- ${key}: ${value}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  extractConstraints(context) {
    const constraints = [];

    if (context.system?.system?.metadata?.constraints) {
      constraints.push(...context.system.system.metadata.constraints);
    }

    if (context.agent?.capability?.boundaries) {
      for (const boundary of context.agent.capability.boundaries) {
        if (boundary.type === 'forbid') {
          constraints.push(`FORBIDDEN: ${boundary.scope}`);
        }
      }
    }

    if (context.activeSkillId) {
      const skill = context.skills?.find(s => s.id === context.activeSkillId);
      if (skill?.constraints) {
        for (const constraint of skill.constraints) {
          if (constraint.type === 'behavior' && constraint.action === 'block') {
            constraints.push(`BLOCKED: ${constraint.rule}`);
          }
        }
      }
    }

    return constraints;
  }

  mergeConstraints(layers) {
    const all = [];
    const byLevel = {};
    const conflicts = [];

    const sortedLayers = [...layers].sort((a, b) => b.priority - a.priority);

    for (const layer of sortedLayers) {
      byLevel[layer.level] = layer.constraints;
      all.push(...layer.constraints);
    }

    for (let i = 0; i < sortedLayers.length; i++) {
      for (let j = i + 1; j < sortedLayers.length; j++) {
        const layerA = sortedLayers[i];
        const layerB = sortedLayers[j];

        for (const constraintA of layerA.constraints) {
          for (const constraintB of layerB.constraints) {
            if (this.areConflicting(constraintA, constraintB)) {
              conflicts.push({
                constraintA,
                constraintB,
                levelA: layerA.level,
                levelB: layerB.level
              });
            }
          }
        }
      }
    }

    return { all: [...new Set(all)], byLevel, conflicts };
  }

  areConflicting(constraintA, constraintB) {
    const aLower = constraintA.toLowerCase();
    const bLower = constraintB.toLowerCase();

    if (aLower.includes('forbid') && bLower.includes('allow')) return true;
    if (bLower.includes('forbid') && aLower.includes('allow')) return true;
    if (aLower.includes('must') && bLower.includes('must not')) return true;
    if (bLower.includes('must') && aLower.includes('must not')) return true;

    return false;
  }

  resolveConflicts(constraintSet) {
    const effective = [];
    const blocked = [];
    const warnings = [];

    for (const constraint of constraintSet.all) {
      const lowerConstraint = constraint.toLowerCase();
      
      if (lowerConstraint.includes('forbid') || lowerConstraint.includes('blocked')) {
        blocked.push(constraint);
      } else if (lowerConstraint.includes('warn')) {
        warnings.push(constraint);
      } else {
        effective.push(constraint);
      }
    }

    for (const conflict of constraintSet.conflicts) {
      if (conflict.levelA === 'system' || conflict.levelB === 'system') {
        const blockedConstraint = conflict.constraintB;
        if (!blocked.includes(blockedConstraint)) {
          blocked.push(blockedConstraint);
          warnings.push(`Blocked by system constraint: ${blockedConstraint}`);
        }
      }
    }

    return { effective, blocked, warnings };
  }

  applyBoundaries(skillInstructions, boundaries) {
    if (!boundaries || boundaries.length === 0) {
      return skillInstructions;
    }

    let modifiedInstructions = skillInstructions;
    const warnings = [];

    for (const boundary of boundaries) {
      switch (boundary.type) {
        case 'forbid':
          if (this.containsForbidden(skillInstructions, boundary)) {
            throw new Error(`Skill instruction violates forbid boundary: ${boundary.scope}`);
          }
          break;

        case 'restrict':
          modifiedInstructions = this.applyRestriction(modifiedInstructions, boundary);
          break;

        case 'warn':
          if (this.containsWarnTrigger(skillInstructions, boundary)) {
            warnings.push(`Warning: Skill instruction triggers ${boundary.scope}`);
          }
          break;
      }
    }

    return modifiedInstructions;
  }

  containsForbidden(instructions, boundary) {
    const scopeLower = boundary.scope.toLowerCase();
    const instructionsLower = instructions.toLowerCase();
    return instructionsLower.includes(scopeLower);
  }

  containsWarnTrigger(instructions, boundary) {
    const scopeLower = boundary.scope.toLowerCase();
    const instructionsLower = instructions.toLowerCase();
    return instructionsLower.includes(scopeLower);
  }

  applyRestriction(instructions, boundary) {
    return instructions;
  }

  getModelConfig(system, agent, session) {
    const providerId = session?.providerId || agent?.providerId;
    const provider = system?.providers?.find(p => p.id === providerId);

    return {
      temperature: provider?.defaults?.temperature ?? 0.7,
      maxTokens: provider?.defaults?.maxTokens ?? 4096,
      topP: provider?.defaults?.topP ?? 1.0,
      timeout: provider?.defaults?.timeout ?? 60000
    };
  }
}

const promptBuilder = new PromptBuilder();
export default promptBuilder;
export { PromptBuilder };