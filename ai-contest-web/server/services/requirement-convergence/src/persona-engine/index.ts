/**
 * 人格化交互模块 - 统一导出
 * 
 * 包含以下子模块：
 * - PersonaManager: 角色切换机制（分析师/引导者/质疑者/协调者）
 * - ContextMemoryManager: 上下文记忆系统（用户偏好、历史决策）
 * - ProactiveNotifier: 主动提醒引擎（待澄清、评审节点、变更影响）
 * - LearningEngine: 学习进化算法（基于历史数据优化）
 */

// 角色管理器导出
export {
  PersonaManager,
  PersonaType,
  type PersonaConfig,
  type PersonaContext,
} from './persona-manager';

// 上下文记忆管理器导出
export {
  ContextMemoryManager,
  MemoryType,
  type MemoryEntry,
  type MemoryQuery,
  type UserPreference,
  type HistoricalDecision,
  type TermDefinition,
  type ProjectContext,
} from './context-memory';

// 主动提醒引擎导出
export {
  ProactiveNotifier,
  ReminderType,
  ReminderPriority,
  ReminderStatus,
  type Reminder,
  type ReminderAction,
  type ReminderConfig,
  type ReminderCallback,
} from './proactive-notifier';

// 学习引擎导出
export {
  LearningEngine,
  LearningType,
  type UserProfile,
  type LearningRecord,
  type Recommendation,
  type FeedbackResult,
  type LearningEngineConfig,
} from './learning-engine';

/**
 * 人格化交互引擎 - 统一入口类
 * 整合所有子模块，提供高级 API
 */
export class PersonaEngine {
  private static instance: PersonaEngine;
  
  public readonly personaManager: PersonaManager;
  public readonly contextMemory: ContextMemoryManager;
  public readonly proactiveNotifier: ProactiveNotifier;
  public readonly learningEngine: LearningEngine;

  private constructor() {
    this.personaManager = PersonaManager.getInstance();
    this.contextMemory = ContextMemoryManager.getInstance();
    this.proactiveNotifier = ProactiveNotifier.getInstance();
    this.learningEngine = LearningEngine.getInstance();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): PersonaEngine {
    if (!PersonaEngine.instance) {
      PersonaEngine.instance = new PersonaEngine();
    }
    return PersonaEngine.instance;
  }

  /**
   * 初始化引擎
   * @param userId 用户 ID
   * @param options 初始化选项
   */
  public initialize(
    userId: string,
    options?: {
      storagePath?: string;
      enableNotifications?: boolean;
      enableLearning?: boolean;
    }
  ): void {
    // 初始化上下文记忆
    this.contextMemory.initialize(userId, options?.storagePath);

    // 初始化提醒引擎
    if (options?.enableNotifications !== false) {
      this.proactiveNotifier.initialize();
    }

    // 初始化学习引擎
    if (options?.enableLearning !== false) {
      this.learningEngine.initialize(userId);
    }

    console.log(`[人格化引擎] 已初始化，用户：${userId}`);
  }

  /**
   * 导出完整状态
   */
  public exportState(): Record<string, any> {
    return {
      persona: this.personaManager.exportState(),
      memory: this.contextMemory.exportMemories(),
      notifications: this.proactiveNotifier.exportState(),
      learning: this.learningEngine.exportState(),
    };
  }

  /**
   * 导入完整状态
   */
  public importState(state: Record<string, any>): void {
    if (state.persona) {
      this.personaManager.importState(state.persona);
    }
    if (state.memory) {
      this.contextMemory.importMemories(state.memory);
    }
    if (state.notifications) {
      this.proactiveNotifier.importState(state.notifications);
    }
    if (state.learning) {
      this.learningEngine.importState(state.learning);
    }
  }

  /**
   * 清除所有数据
   */
  public clearAll(): void {
    this.personaManager.clearConversationHistory();
    this.contextMemory.clearAllMemories();
    console.log('[人格化引擎] 已清除所有数据');
  }
}

// 导出统一入口类
export { PersonaEngine };

// 默认导出
export default PersonaEngine;
