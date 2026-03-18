/**
 * 角色管理器 - 实现人格化角色切换机制
 * 支持：严谨分析师、创意引导者、质疑者、协调者
 */

/**
 * 角色类型枚举
 */
export enum PersonaType {
  /** 严谨分析师：结构化、逻辑严密、注重细节 */
  ANALYST = 'analyst',
  /** 创意引导者：发散思维、头脑风暴、激发灵感 */
  FACILITATOR = 'facilitator',
  /** 质疑者：挑战假设、发现漏洞、风险评估 */
  CHALLENGER = 'challenger',
  /** 协调者：平衡各方、促进共识、求同存异 */
  COORDINATOR = 'coordinator',
}

/**
 * 角色配置接口
 */
export interface PersonaConfig {
  type: PersonaType;
  name: string;
  description: string;
  style: {
    tone: string;
    structure: string;
    focus: string[];
    questionPattern: string;
  };
}

/**
 * 角色切换上下文
 */
export interface PersonaContext {
  currentPersona: PersonaType;
  conversationHistory: string[];
  activeSince: Date;
  switchCount: number;
}

/**
 * 角色管理器类
 */
export class PersonaManager {
  private static instance: PersonaManager;
  
  private readonly personaConfigs: Map<PersonaType, PersonaConfig>;
  private currentContext: PersonaContext;
  private onPersonaChange?: (context: PersonaContext) => void;

  private constructor() {
    this.personaConfigs = this.initializePersonaConfigs();
    this.currentContext = {
      currentPersona: PersonaType.ANALYST,
      conversationHistory: [],
      activeSince: new Date(),
      switchCount: 0,
    };
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): PersonaManager {
    if (!PersonaManager.instance) {
      PersonaManager.instance = new PersonaManager();
    }
    return PersonaManager.instance;
  }

  /**
   * 初始化角色配置
   */
  private initializePersonaConfigs(): Map<PersonaType, PersonaConfig> {
    const configs = new Map<PersonaType, PersonaConfig>();

    configs.set(PersonaType.ANALYST, {
      type: PersonaType.ANALYST,
      name: '严谨分析师',
      description: '结构化、逻辑严密、注重细节',
      style: {
        tone: '专业、严谨、客观',
        structure: '总分总、层次分明、逻辑递进',
        focus: ['数据支撑', '逻辑验证', '细节完整性', '风险评估'],
        questionPattern: '基于现有信息，我们可以从以下几个维度分析...',
      },
    });

    configs.set(PersonaType.FACILITATOR, {
      type: PersonaType.FACILITATOR,
      name: '创意引导者',
      description: '发散思维、头脑风暴、激发灵感',
      style: {
        tone: '开放、鼓励、启发',
        structure: '联想式、跳跃性、多点触发',
        focus: ['创新点子', '跨界借鉴', '可能性探索', '用户价值'],
        questionPattern: '如果我们换个角度思考，有没有可能...',
      },
    });

    configs.set(PersonaType.CHALLENGER, {
      type: PersonaType.CHALLENGER,
      name: '质疑者',
      description: '挑战假设、发现漏洞、风险评估',
      style: {
        tone: '批判性、审慎、深入',
        structure: '反向思考、假设挑战、边界测试',
        focus: ['前提假设', '潜在风险', '边界条件', '反例验证'],
        questionPattern: '这个方案的潜在风险是什么？如果...会怎样？',
      },
    });

    configs.set(PersonaType.COORDINATOR, {
      type: PersonaType.COORDINATOR,
      name: '协调者',
      description: '平衡各方、促进共识、求同存异',
      style: {
        tone: '平和、包容、建设性',
        structure: '整合式、平衡视角、寻求共识',
        focus: ['利益平衡', '共识点提炼', '冲突化解', '折中方案'],
        questionPattern: '综合考虑各方需求，我们是否可以...',
      },
    });

    return configs;
  }

  /**
   * 切换角色
   * @param personaType 目标角色类型
   * @param reason 切换原因（可选）
   */
  public switchPersona(personaType: PersonaType, reason?: string): PersonaContext {
    if (this.currentContext.currentPersona === personaType) {
      return this.currentContext;
    }

    const previousPersona = this.currentContext.currentPersona;
    
    this.currentContext = {
      ...this.currentContext,
      currentPersona: personaType,
      activeSince: new Date(),
      switchCount: this.currentContext.switchCount + 1,
    };

    console.log(`角色切换：${this.getPersonaName(previousPersona)} -> ${this.getPersonaName(personaType)}`);
    if (reason) {
      console.log(`切换原因：${reason}`);
    }

    if (this.onPersonaChange) {
      this.onPersonaChange(this.currentContext);
    }

    return this.currentContext;
  }

  /**
   * 获取当前角色配置
   */
  public getCurrentPersonaConfig(): PersonaConfig {
    const config = this.personaConfigs.get(this.currentContext.currentPersona);
    if (!config) {
      throw new Error(`未找到角色配置：${this.currentContext.currentPersona}`);
    }
    return config;
  }

  /**
   * 获取指定角色配置
   */
  public getPersonaConfig(personaType: PersonaType): PersonaConfig {
    const config = this.personaConfigs.get(personaType);
    if (!config) {
      throw new Error(`未找到角色配置：${personaType}`);
    }
    return config;
  }

  /**
   * 获取角色名称
   */
  public getPersonaName(personaType: PersonaType): string {
    return this.personaConfigs.get(personaType)?.name || personaType;
  }

  /**
   * 获取当前角色上下文
   */
  public getCurrentContext(): PersonaContext {
    return { ...this.currentContext };
  }

  /**
   * 添加对话历史
   */
  public addConversationHistory(message: string): void {
    this.currentContext.conversationHistory.push(message);
    if (this.currentContext.conversationHistory.length > 50) {
      this.currentContext.conversationHistory.shift();
    }
  }

  /**
   * 获取对话历史
   */
  public getConversationHistory(limit: number = 10): string[] {
    return this.currentContext.conversationHistory.slice(-limit);
  }

  /**
   * 清除对话历史
   */
  public clearConversationHistory(): void {
    this.currentContext.conversationHistory = [];
  }

  /**
   * 设置角色切换回调
   */
  public setOnPersonaChange(callback: (context: PersonaContext) => void): void {
    this.onPersonaChange = callback;
  }

  /**
   * 根据场景自动推荐角色
   */
  public recommendPersona(scene: string): PersonaType {
    const sceneKeywords: Record<string, PersonaType> = {
      '分析': PersonaType.ANALYST,
      '评估': PersonaType.ANALYST,
      '评审': PersonaType.CHALLENGER,
      '风险': PersonaType.CHALLENGER,
      '创意': PersonaType.FACILITATOR,
      '头脑风暴': PersonaType.FACILITATOR,
      '灵感': PersonaType.FACILITATOR,
      '协调': PersonaType.COORDINATOR,
      '共识': PersonaType.COORDINATOR,
      '冲突': PersonaType.COORDINATOR,
    };

    for (const [keyword, persona] of Object.entries(sceneKeywords)) {
      if (scene.includes(keyword)) {
        return persona;
      }
    }

    return PersonaType.ANALYST;
  }

  /**
   * 生成符合当前角色风格的回应
   */
  public generateResponse(template: string, context?: Record<string, any>): string {
    const config = this.getCurrentPersonaConfig();
    
    let response = template;
    
    if (context) {
      for (const [key, value] of Object.entries(context)) {
        response = response.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
      }
    }

    const prefix = this.getPersonaPrefix(config);
    return `${prefix}${response}`;
  }

  /**
   * 获取角色前缀语
   */
  private getPersonaPrefix(config: PersonaConfig): string {
    switch (config.type) {
      case PersonaType.ANALYST:
        return '从分析的角度来看，';
      case PersonaType.FACILITATOR:
        return '让我们一起探索一下，';
      case PersonaType.CHALLENGER:
        return '这里有个问题需要思考，';
      case PersonaType.COORDINATOR:
        return '综合考虑各方面，';
      default:
        return '';
    }
  }

  /**
   * 导出角色状态（用于持久化）
   */
  public exportState(): Record<string, any> {
    return {
      currentPersona: this.currentContext.currentPersona,
      switchCount: this.currentContext.switchCount,
      conversationHistory: this.currentContext.conversationHistory,
      activeSince: this.currentContext.activeSince.toISOString(),
    };
  }

  /**
   * 导入角色状态（用于恢复）
   */
  public importState(state: Record<string, any>): void {
    if (state.currentPersona) {
      this.currentContext.currentPersona = state.currentPersona as PersonaType;
    }
    if (state.switchCount !== undefined) {
      this.currentContext.switchCount = state.switchCount;
    }
    if (state.conversationHistory) {
      this.currentContext.conversationHistory = state.conversationHistory;
    }
    if (state.activeSince) {
      this.currentContext.activeSince = new Date(state.activeSince);
    }
  }
}

export default PersonaManager;
