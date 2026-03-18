/**
 * 上下文记忆系统 - 实现跨会话记忆存储和检索
 * 支持：用户偏好、历史决策、常用术语、项目背景
 */

/**
 * 记忆类型枚举
 */
export enum MemoryType {
  /** 用户偏好 */
  USER_PREFERENCE = 'user_preference',
  /** 历史决策 */
  HISTORICAL_DECISION = 'historical_decision',
  /** 常用术语 */
  TERMINOLOGY = 'terminology',
  /** 项目背景 */
  PROJECT_CONTEXT = 'project_context',
}

/**
 * 记忆条目接口
 */
export interface MemoryEntry {
  id: string;
  type: MemoryType;
  key: string;
  value: any;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    accessCount: number;
    lastAccessedAt: Date | null;
    confidence: number;
    source?: string;
  };
  tags: string[];
}

/**
 * 用户偏好接口
 */
export interface UserPreference {
  /** 提问风格：开放式/封闭式 */
  questionStyle: 'open' | 'closed' | 'mixed';
  /** 文档格式偏好 */
  documentFormat: 'detailed' | 'concise' | 'template';
  /** 交互风格 */
  interactionStyle: 'formal' | 'casual' | 'adaptive';
  /** 响应详细程度 */
  responseDetailLevel: 'brief' | 'standard' | 'comprehensive';
  /** 其他自定义偏好 */
  customPreferences: Record<string, any>;
}

/**
 * 历史决策接口
 */
export interface HistoricalDecision {
  /** 决策内容 */
  decision: string;
  /** 决策原因 */
  reason: string;
  /** 需求变更原因 */
  changeReason?: string;
  /** 优先级选择 */
  priority?: 'high' | 'medium' | 'low';
  /** 相关需求 ID */
  requirementIds?: string[];
  /** 决策时间 */
  decisionDate: Date;
}

/**
 * 术语定义接口
 */
export interface TermDefinition {
  /** 术语名称 */
  term: string;
  /** 术语定义 */
  definition: string;
  /** 术语类型：业务/技术 */
  termType: 'business' | 'technical';
  /** 相关术语 */
  relatedTerms?: string[];
  /** 使用场景 */
  usageContext?: string;
}

/**
 * 项目背景接口
 */
export interface ProjectContext {
  /** 业务目标 */
  businessGoals: string[];
  /** 约束条件 */
  constraints: string[];
  /** 关键干系人 */
  stakeholders: string[];
  /** 项目时间线 */
  timeline?: {
    startDate?: Date;
    endDate?: Date;
    milestones?: Array<{ name: string; date: Date }>;
  };
  /** 项目规模 */
  scale?: 'small' | 'medium' | 'large' | 'enterprise';
}

/**
 * 记忆查询条件
 */
export interface MemoryQuery {
  type?: MemoryType;
  key?: string;
  tags?: string[];
  minConfidence?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'accessCount' | 'confidence';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 上下文记忆管理器类
 */
export class ContextMemoryManager {
  private static instance: ContextMemoryManager;
  
  private memories: Map<string, MemoryEntry>;
  private userId?: string;
  private storagePath?: string;
  private readonly maxMemories: number = 1000;
  private readonly defaultRetentionDays: number = 90;

  private constructor() {
    this.memories = new Map();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ContextMemoryManager {
    if (!ContextMemoryManager.instance) {
      ContextMemoryManager.instance = new ContextMemoryManager();
    }
    return ContextMemoryManager.instance;
  }

  /**
   * 初始化记忆管理器
   * @param userId 用户 ID
   * @param storagePath 存储路径（可选）
   */
  public initialize(userId: string, storagePath?: string): void {
    this.userId = userId;
    this.storagePath = storagePath;
    this.loadMemories();
  }

  /**
   * 生成记忆 ID
   */
  private generateId(type: MemoryType, key: string): string {
    return `${type}_${key}_${Date.now()}`;
  }

  /**
   * 存储记忆
   * @param type 记忆类型
   * @param key 记忆键
   * @param value 记忆值
   * @param tags 标签（可选）
   * @param confidence 置信度（可选，默认 0.8）
   */
  public storeMemory(
    type: MemoryType,
    key: string,
    value: any,
    tags: string[] = [],
    confidence: number = 0.8
  ): MemoryEntry {
    const id = this.generateId(type, key);
    
    const now = new Date();
    const entry: MemoryEntry = {
      id,
      type,
      key,
      value,
      metadata: {
        createdAt: now,
        updatedAt: now,
        accessCount: 0,
        lastAccessedAt: null,
        confidence,
      },
      tags,
    };

    this.memories.set(id, entry);
    
    // 如果超过最大记忆数，清理最旧的记忆
    if (this.memories.size > this.maxMemories) {
      this.cleanupOldMemories();
    }

    console.log(`[记忆存储] ${type}: ${key}`);
    return entry;
  }

  /**
   * 检索记忆
   * @param query 查询条件
   */
  public retrieveMemories(query: MemoryQuery): MemoryEntry[] {
    let results = Array.from(this.memories.values());

    // 按类型过滤
    if (query.type) {
      results = results.filter(m => m.type === query.type);
    }

    // 按键过滤
    if (query.key) {
      results = results.filter(m => m.key.includes(query.key!));
    }

    // 按标签过滤
    if (query.tags && query.tags.length > 0) {
      results = results.filter(m =>
        query.tags!.some(tag => m.tags.includes(tag))
      );
    }

    // 按置信度过滤
    if (query.minConfidence !== undefined) {
      results = results.filter(m => m.metadata.confidence >= query.minConfidence!);
    }

    // 排序
    results.sort((a, b) => {
      const sortBy = query.sortBy || 'updatedAt';
      const order = query.sortOrder || 'desc';
      
      let comparison = 0;
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.metadata.createdAt).getTime() - new Date(b.metadata.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.metadata.updatedAt).getTime() - new Date(b.metadata.updatedAt).getTime();
          break;
        case 'accessCount':
          comparison = a.metadata.accessCount - b.metadata.accessCount;
          break;
        case 'confidence':
          comparison = a.metadata.confidence - b.metadata.confidence;
          break;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });

    // 限制结果数
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    // 更新访问计数
    results.forEach(memory => {
      memory.metadata.accessCount++;
      memory.metadata.lastAccessedAt = new Date();
    });

    return results;
  }

  /**
   * 获取用户偏好
   */
  public getUserPreferences(): UserPreference | null {
    const memories = this.retrieveMemories({
      type: MemoryType.USER_PREFERENCE,
      key: 'preferences',
      limit: 1,
    });

    if (memories.length === 0) {
      return null;
    }

    return memories[0].value as UserPreference;
  }

  /**
   * 更新用户偏好
   */
  public updateUserPreferences(prefs: Partial<UserPreference>): UserPreference {
    const existing = this.getUserPreferences() || this.getDefaultPreferences();
    const updated: UserPreference = { ...existing, ...prefs };

    // 删除旧的偏好记忆
    const oldMemories = this.retrieveMemories({
      type: MemoryType.USER_PREFERENCE,
      key: 'preferences',
    });
    oldMemories.forEach(m => this.memories.delete(m.id));

    // 存储新的偏好记忆
    this.storeMemory(
      MemoryType.USER_PREFERENCE,
      'preferences',
      updated,
      ['preference', 'user-setting'],
      0.95
    );

    return updated;
  }

  /**
   * 获取默认偏好
   */
  private getDefaultPreferences(): UserPreference {
    return {
      questionStyle: 'mixed',
      documentFormat: 'template',
      interactionStyle: 'adaptive',
      responseDetailLevel: 'standard',
      customPreferences: {},
    };
  }

  /**
   * 存储历史决策
   */
  public storeDecision(decision: HistoricalDecision, tags: string[] = []): MemoryEntry {
    const key = `decision_${Date.now()}`;
    return this.storeMemory(
      MemoryType.HISTORICAL_DECISION,
      key,
      decision,
      [...tags, 'decision'],
      0.9
    );
  }

  /**
   * 检索历史决策
   */
  public retrieveDecisions(limit: number = 10): HistoricalDecision[] {
    const memories = this.retrieveMemories({
      type: MemoryType.HISTORICAL_DECISION,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    return memories.map(m => m.value as HistoricalDecision);
  }

  /**
   * 存储术语
   */
  public storeTerm(term: TermDefinition): MemoryEntry {
    return this.storeMemory(
      MemoryType.TERMINOLOGY,
      term.term,
      term,
      ['terminology', term.termType],
      0.85
    );
  }

  /**
   * 检索术语
   */
  public retrieveTerms(termType?: 'business' | 'technical'): TermDefinition[] {
    const query: MemoryQuery = {
      type: MemoryType.TERMINOLOGY,
      limit: 100,
    };

    if (termType) {
      query.tags = [termType];
    }

    const memories = this.retrieveMemories(query);
    return memories.map(m => m.value as TermDefinition);
  }

  /**
   * 查找相关术语
   */
  public findRelatedTerms(term: string, maxDepth: number = 2): TermDefinition[] {
    const allTerms = this.retrieveTerms();
    const related = new Map<string, TermDefinition>();
    
    const search = (currentTerm: string, depth: number) => {
      if (depth > maxDepth) return;
      
      const termDef = allTerms.find(t => t.term === currentTerm);
      if (!termDef || related.has(termDef.term)) return;

      related.set(termDef.term, termDef);

      if (termDef.relatedTerms) {
        termDef.relatedTerms.forEach(t => search(t, depth + 1));
      }
    };

    search(term, 0);
    return Array.from(related.values());
  }

  /**
   * 存储项目背景
   */
  public storeProjectContext(context: ProjectContext): MemoryEntry {
    // 删除旧的项目背景
    const oldMemories = this.retrieveMemories({
      type: MemoryType.PROJECT_CONTEXT,
      key: 'project_context',
    });
    oldMemories.forEach(m => this.memories.delete(m.id));

    return this.storeMemory(
      MemoryType.PROJECT_CONTEXT,
      'project_context',
      context,
      ['project', 'context', 'background'],
      0.95
    );
  }

  /**
   * 获取项目背景
   */
  public getProjectContext(): ProjectContext | null {
    const memories = this.retrieveMemories({
      type: MemoryType.PROJECT_CONTEXT,
      key: 'project_context',
      limit: 1,
    });

    if (memories.length === 0) {
      return null;
    }

    return memories[0].value as ProjectContext;
  }

  /**
   * 更新记忆置信度
   */
  public updateConfidence(memoryId: string, confidence: number): void {
    const memory = this.memories.get(memoryId);
    if (memory) {
      memory.metadata.confidence = Math.max(0, Math.min(1, confidence));
      memory.metadata.updatedAt = new Date();
    }
  }

  /**
   * 增强记忆（增加置信度）
   */
  public reinforceMemory(memoryId: string, increment: number = 0.05): void {
    const memory = this.memories.get(memoryId);
    if (memory) {
      memory.metadata.confidence = Math.min(1, memory.metadata.confidence + increment);
      memory.metadata.updatedAt = new Date();
    }
  }

  /**
   * 减弱记忆（减少置信度）
   */
  public weakenMemory(memoryId: string, decrement: number = 0.05): void {
    const memory = this.memories.get(memoryId);
    if (memory) {
      memory.metadata.confidence = Math.max(0, memory.metadata.confidence - decrement);
      memory.metadata.updatedAt = new Date();
    }
  }

  /**
   * 清理旧记忆
   */
  private cleanupOldMemories(): void {
    const now = Date.now();
    const retentionMs = this.defaultRetentionDays * 24 * 60 * 60 * 1000;

    const toDelete: string[] = [];
    this.memories.forEach((memory, id) => {
      const age = now - new Date(memory.metadata.createdAt).getTime();
      if (age > retentionMs && memory.metadata.confidence < 0.5) {
        toDelete.push(id);
      }
    });

    toDelete.forEach(id => this.memories.delete(id));
    console.log(`[记忆清理] 删除了 ${toDelete.length} 条旧记忆`);
  }

  /**
   * 获取记忆统计信息
   */
  public getMemoryStats(): {
    totalMemories: number;
    byType: Record<MemoryType, number>;
    avgConfidence: number;
  } {
    const byType: Record<MemoryType, number> = {
      [MemoryType.USER_PREFERENCE]: 0,
      [MemoryType.HISTORICAL_DECISION]: 0,
      [MemoryType.TERMINOLOGY]: 0,
      [MemoryType.PROJECT_CONTEXT]: 0,
    };

    let totalConfidence = 0;

    this.memories.forEach(memory => {
      byType[memory.type]++;
      totalConfidence += memory.metadata.confidence;
    });

    return {
      totalMemories: this.memories.size,
      byType,
      avgConfidence: this.memories.size > 0 ? totalConfidence / this.memories.size : 0,
    };
  }

  /**
   * 导出所有记忆（用于持久化）
   */
  public exportMemories(): Record<string, any>[] {
    return Array.from(this.memories.values()).map(entry => ({
      ...entry,
      metadata: {
        ...entry.metadata,
        createdAt: entry.metadata.createdAt.toISOString(),
        updatedAt: entry.metadata.updatedAt.toISOString(),
        lastAccessedAt: entry.metadata.lastAccessedAt?.toISOString() || null,
      },
    }));
  }

  /**
   * 导入记忆（用于恢复）
   */
  public importMemories(data: Record<string, any>[]): void {
    data.forEach(item => {
      const entry: MemoryEntry = {
        ...item,
        metadata: {
          ...item.metadata,
          createdAt: new Date(item.metadata.createdAt),
          updatedAt: new Date(item.metadata.updatedAt),
          lastAccessedAt: item.metadata.lastAccessedAt
            ? new Date(item.metadata.lastAccessedAt)
            : null,
        },
      };
      this.memories.set(entry.id, entry);
    });
    console.log(`[记忆导入] 导入了 ${data.length} 条记忆`);
  }

  /**
   * 加载记忆（从存储）
   */
  private loadMemories(): void {
    // 实际实现中从存储路径加载
    console.log('[记忆加载] 从存储加载记忆...');
  }

  /**
   * 保存记忆（到存储）
   */
  public saveMemories(): void {
    // 实际实现中保存到存储路径
    console.log('[记忆保存] 保存记忆到存储...');
  }

  /**
   * 清除所有记忆
   */
  public clearAllMemories(): void {
    this.memories.clear();
    console.log('[记忆清除] 已清除所有记忆');
  }
}

export default ContextMemoryManager;
