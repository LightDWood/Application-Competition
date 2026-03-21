import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SkillService {
  constructor() {
    this.skills = new Map();
    this.skillConfigs = new Map();
    this.skillsDir = path.join(__dirname, '../../../skills');
    this.loadAllSkills();
  }

  loadAllSkills() {
    if (!fs.existsSync(this.skillsDir)) {
      console.warn(`Skills directory not found: ${this.skillsDir}`);
      return;
    }

    try {
      const entries = fs.readdirSync(this.skillsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          this.loadSkill(entry.name);
        }
      }
    } catch (error) {
      console.error('Failed to load skills:', error.message);
    }
  }

  loadSkill(skillId) {
    const skillDir = path.join(this.skillsDir, skillId);
    const skillMdPath = path.join(skillDir, 'SKILL.md');

    if (!fs.existsSync(skillMdPath)) {
      console.warn(`SKILL.md not found for skill: ${skillId}`);
      return null;
    }

    try {
      const content = fs.readFileSync(skillMdPath, 'utf8');
      const skill = this.parseSkillMarkdown(content, skillId);
      
      skill.path = skillDir;
      
      if (fs.existsSync(path.join(skillDir, 'scripts'))) {
        skill.scripts = this.listSkillScripts(skillDir);
      }
      
      if (fs.existsSync(path.join(skillDir, 'resources'))) {
        skill.resources = this.listSkillResources(skillDir);
      }

      this.skills.set(skillId, skill);
      this.skillConfigs.set(skillId, {
        id: skillId,
        name: skill.name,
        description: skill.description,
        path: skillDir
      });

      return skill;
    } catch (error) {
      console.error(`Failed to load skill ${skillId}:`, error.message);
      return null;
    }
  }

  parseSkillMarkdown(content, skillId) {
    const lines = content.split('\n');
    let inInstructions = false;
    const metadata = {};
    const instructionLines = [];

    for (const line of lines) {
      if (line.startsWith('# Skill:')) {
        metadata.name = line.substring(8).trim();
      } else if (line.startsWith('## Description')) {
        continue;
      } else if (line.startsWith('### Instructions') || line.startsWith('## Instructions')) {
        inInstructions = true;
      } else if (line.startsWith('###') && inInstructions) {
        inInstructions = false;
      } else if (inInstructions) {
        instructionLines.push(line);
      } else if (line.startsWith('- **')) {
        const match = line.match(/^\- \*\*(\w+)\*\*:\s*(.+)$/);
        if (match) {
          metadata[match[1].toLowerCase()] = match[2].trim();
        }
      }
    }

    return {
      id: skillId,
      name: metadata.name || skillId,
      description: metadata.description || '',
      version: metadata.version || '1.0.0',
      instructions: instructionLines.join('\n').trim(),
      contextFormat: metadata.contextformat || 'json',
      outputFormat: metadata.outputformat || 'json',
      constraints: [],
      scripts: [],
      resources: [],
      triggerConditions: []
    };
  }

  listSkillScripts(skillDir) {
    const scriptsDir = path.join(skillDir, 'scripts');
    const scripts = [];

    if (fs.existsSync(scriptsDir)) {
      try {
        const files = fs.readdirSync(scriptsDir);
        for (const file of files) {
          if (file.endsWith('.js') || file.endsWith('.sh') || file.endsWith('.py')) {
            scripts.push(path.join(scriptsDir, file));
          }
        }
      } catch (error) {
        console.error(`Failed to list scripts for skill:`, error.message);
      }
    }

    return scripts;
  }

  listSkillResources(skillDir) {
    const resourcesDir = path.join(skillDir, 'resources');
    const resources = [];

    if (fs.existsSync(resourcesDir)) {
      try {
        const walkDir = (dir, base = '') => {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isDirectory()) {
              walkDir(path.join(dir, entry.name), path.join(base, entry.name));
            } else {
              resources.push(path.join(base, entry.name));
            }
          }
        };
        walkDir(resourcesDir);
      } catch (error) {
        console.error(`Failed to list resources for skill:`, error.message);
      }
    }

    return resources;
  }

  listAgentSkills(agentId) {
    const agentServicePath = path.join(__dirname, '../../config/agents', agentId, 'skills.yaml');
    const skillIds = [];

    try {
      if (fs.existsSync(agentServicePath)) {
        const config = yaml.load(fs.readFileSync(agentServicePath, 'utf8'));
        if (config && config.skillIds) {
          for (const skillId of config.skillIds) {
            if (this.skills.has(skillId)) {
              skillIds.push(skillId);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to load skills for agent ${agentId}:`, error.message);
    }

    return skillIds.map(id => this.skills.get(id)).filter(Boolean);
  }

  listAllSkills() {
    return Array.from(this.skills.values());
  }

  async executeSkill(skillId, context) {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    return {
      success: true,
      output: `[Skill ${skillId} executed] Context: ${JSON.stringify(context).substring(0, 100)}...`,
      artifacts: []
    };
  }

  validateSkill(skillId) {
    const skill = this.skills.get(skillId);
    
    if (!skill) {
      return {
        valid: false,
        errors: [{
          field: 'skillId',
          message: `Skill not found: ${skillId}`,
          code: 'SKILL_NOT_FOUND'
        }],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    if (!skill.name) {
      errors.push({
        field: 'name',
        message: 'Skill name is required',
        code: 'MISSING_NAME'
      });
    }

    if (!skill.instructions) {
      warnings.push({
        field: 'instructions',
        message: 'Skill instructions are empty'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

const skillService = new SkillService();
export default skillService;
export { SkillService };