/**
 * 学习进化引擎 - 基于历史数据优化推荐算法
 * 支持：用户偏好学习、文档风格学习、需求类型学习、反馈循环
 */

/**
 * 学习类型枚举
 */
export enum LearningType {
  /** 用户提问偏好 */
  QUESTION_PREFERENCE = 'question_preference',
  /** 文档风格偏好 */
  DOCUMENT_STYLE = 'document_style',
  /** 需求类型频率 */
  REQUIREMENT_TYPE_FREQUENCY = 'requirement_type_frequency',
  /** 推荐采纳率 */
  RECOMMENDATION_ACCEPTANCE = 'recommendation_acceptance',
  /** 交互模式 */
  INTERACTION_PATTERN = 'interaction_pattern',
}

/**
 * 用户画像接口
 */
export interface UserProfile {
  /** 用户 ID */
  userId: string;
  /** 提问偏好 */
  questionPreference: {
    /** 开放式问题比例 */
    openRatio: number;
    /** 封闭式问题比例 */
    closedRatio: number;
    /** 偏好类型 */
    preferredType: 'open' | 'closed' | 'balanced';
  };
  /** 文档风格 */
  documentStyle: {
    /** 详细程度 */
    detailLevel: 'brief' | 'standard' | 'detailed';
    /** 结构化程度 */
    structureLevel: 'free' | 'semi' | 'structured';
    /** 技术含量 */
    technicalLevel: number;
  };
  /** 高频需求类型 */
  frequentRequirementTypes: string[];
  /** 交互时间偏好 */
  interactionTimePreference?: {
    preferredHours: number[];
    timezone?: string;
  };
}

/**
 * 学习记录接口
 */
export interface LearningRecord {
  id: string;
  type: LearningType;
  data: any;
  feedback: {
    /** 正面反馈次数 */
    positive: number;
    /** 负面反馈次数 */
    negative: number;
    /** 采纳率 */
    acceptanceRate: number;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    confidence: number;
    sampleSize: number;
  };
}

/**
 * 推荐项接口
 */
export interface Recommendation {
  id: string;
  type: string;
  content: any;
  score: number;
  reason: string;
  metadata: {
    createdAt: Date;
    source?: string;
    tags?: string[];
  };
}

/**
 * 反馈结果接口
 */
export interface FeedbackResult {
  accepted: boolean;
  rating?: number;
  comment?: string;
  timestamp: Date;
}

/**
 * 学习引擎配置
 */
export interface LearningEngineConfig {
  /** 学习率 */
  learningRate: number;
  /** 衰减因子 */
  decayFactor: number;
  /** 最小样本数 */
  minSampleSize: number;
  /** 置信度阈值 */
  confidenceThreshold: number;
  /** 是否启用在线学习 */
  enableOnlineLearning: boolean;
  /** 是否启用批量学习 */
  enableBatchLearning: boolean;
}

/**
 * 学习进化引擎类
 */
export class LearningEngine {
  private static instance: LearningEngine;
  
  private userProfile?: UserProfile;
  private learningRecords: Map<string, LearningRecord>;
  private recommendations: Map<string, Recommendation>;
  private config: LearningEngineConfig;
  private feedbackHistory: Map<string, FeedbackResult[]>;

  private constructor() {
    this.learningRecords = new Map();
    this.recommendations = new Map();
    this.feedbackHistory = new Map();
    this.config = this.getDefaultConfig();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): LearningEngine {
    if (!LearningEngine.instance) {
      LearningEngine.instance = new LearningEngine();
    }
    return LearningEngine.instance;
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): LearningEngineConfig {
    return {
      learningRate: 0.1,
      decayFactor: 0.95,
      minSampleSize: 5,
      confidenceThreshold: 0.7,
      enableOnlineLearning: true,
      enableBatchLearning: true,
    };
  }

  /**
   * 初始化学习引擎
   * @param userId 用户 ID
   * @param config 配置（可选）
   */
  public initialize(userId: string, config?: Partial<LearningEngineConfig>): void {
    this.config = { ...this.config, ...config };
    this.userProfile = this.createDefaultProfile(userId);
    this.loadLearningRecords();
    
    console.log('[学习引擎] 已初始化');
  }

  /**
   * 创建默认用户画像
   */
  private createDefaultProfile(userId: string): UserProfile {
    return {
      userId,
      questionPreference: {
        openRatio: 0.5,
        closedRatio: 0.5,
        preferredType: 'balanced',
      },
      documentStyle: {
        detailLevel: 'standard',
        structureLevel: 'semi',
        technicalLevel: 0.5,
      },
      frequentRequirementTypes: [],
      interactionTimePreference: {
        preferredHours: [9, 10, 11, 14, 15, 16],
        timezone: 'UTC+8',
      },
    };
  }

  /**
   * 记录用户交互
   * @param interactionType 交互类型
   * @param data 交互数据
   */
  public recordInteraction(interactionType: string, data: any): void {
    if (!this.userProfile) {
      throw new Error('学习引擎未初始化');
    }

    // 记录问题偏好
    if (interactionType === 'question') {
      this.updateQuestionPreference(data);
    }

    // 记录文档风格
    if (interactionType === 'document_interaction') {
      this.updateDocumentStyle(data);
    }

    // 记录需求类型
    if (interactionType === 'requirement') {
      this.updateRequirementTypeFrequency(data);
    }

    console.log(`[学习引擎] 记录交互：${interactionType}`);
  }

  /**
   * 更新问题偏好
   */
  private updateQuestionPreference(data: any): void {
    if (!this.userProfile) return;

    const is_open = data.isOpen === true;
    const total = this.userProfile.questionPreference.openRatio + 
                  this.userProfile.questionPreference.closedRatio + 1;

    if (is_open) {
      this.userProfile.questionPreference.openRatio = 
        (this.userProfile.questionPreference.openRatio * total + 1) / (total + 1);
      this.userProfile.questionPreference.closedRatio = 
        (this.userProfile.questionPreference.closedRatio * total) / (total + 1);
    } else {
      this.userProfile.questionPreference.openRatio = 
        (this.userProfile.questionPreference.openRatio * total) / (total + 1);
      this.userProfile.questionPreference.closedRatio = 
        (this.userProfile.questionPreference.closedRatio * total + 1) / (total + 1);
    }

    // 更新偏好类型
    const ratio = this.userProfile.questionPreference.openRatio / 
                  (this.userProfile.questionPreference.openRatio + 
                   this.userProfile.questionPreference.closedRatio);
    
    if (ratio > 0.6) {
      this.userProfile.questionPreference.preferredType = 'open';
    } else if (ratio < 0.4) {
      this.userProfile.questionPreference.preferredType = 'closed';
    } else {
      this.userProfile.questionPreference.preferredType = 'balanced';
    }

    this.storeLearningRecord(LearningType.QUESTION_PREFERENCE, {
      openRatio: this.userProfile.questionPreference.openRatio,
      closedRatio: this.userProfile.questionPreference.closedRatio,
      preferredType: this.userProfile.questionPreference.preferredType,
    });
  }

  /**
   * 更新文档风格
   */
  private updateDocumentStyle(data: any): void {
    if (!this.userProfile) return;

    const { detailLevel, structureLevel, technicalLevel } = data;

    // 使用指数移动平均更新
    const lr = this.config.learningRate;
    
    if (detailLevel) {
      const levels = { brief: 0, standard: 1, detailed: 2 };
      const current = levels[this.userProfile.documentStyle.detailLevel];
      const target = levels[detailLevel];
      const updated = current + lr * (target - current);
      
      if (updated < 0.5) {
        this.userProfile.documentStyle.detailLevel = 'brief';
      } else if (updated < 1.5) {
        this.userProfile.documentStyle.detailLevel = 'standard';
      } else {
        this.userProfile.documentStyle.detailLevel = 'detailed';
      }
    }

    if (structureLevel) {
      const levels = { free: 0, semi: 1, structured: 2 };
      const current = levels[this.userProfile.documentStyle.structureLevel];
      const target = levels[structureLevel];
      const updated = current + lr * (target - current);
      
      if (updated < 0.5) {
        this.userProfile.documentStyle.structureLevel = 'free';
      } else if (updated < 1.5) {
        this.userProfile.documentStyle.structureLevel = 'semi';
      } else {
        this.userProfile.documentStyle.structureLevel = 'structured';
      }
    }

    if (technicalLevel !== undefined) {
      this.userProfile.documentStyle.technicalLevel = 
        this.userProfile.documentStyle.technicalLevel + 
        lr * (technicalLevel - this.userProfile.documentStyle.technicalLevel);
    }

    this.storeLearningRecord(LearningType.DOCUMENT_STYLE, {
      detailLevel: this.userProfile.documentStyle.detailLevel,
      structureLevel: this.userProfile.documentStyle.structureLevel,
      technicalLevel: this.userProfile.documentStyle.technicalLevel,
    });
  }

  /**
   * 更新需求类型频率
   */
  private updateRequirementTypeFrequency(data: any): void {
    if (!this.userProfile) return;

    const type = data.type;
    if (!type) return;

    const index = this.userProfile.frequentRequirementTypes.indexOf(type);
    
    if (index === -1) {
      // 新类型，添加到末尾
      this.userProfile.frequentRequirementTypes.push(type);
    } else {
      // 已存在，移到前面
      this.userProfile.frequentRequirementTypes.splice(index, 1);
      this.userProfile.frequentRequirementTypes.unshift(type);
    }

    // 保持最多 10 个类型
    if (this.userProfile.frequentRequirementTypes.length > 10) {
      this.userProfile.frequentRequirementTypes.pop();
    }

    this.storeLearningRecord(LearningType.REQUIREMENT_TYPE_FREQUENCY, {
      types: this.userProfile.frequentRequirementTypes,
    });
  }

  /**
   * 存储学习记录
   */
  private storeLearningRecord(type: LearningType, data: any): void {
    const id = `learning_${type}_${Date.now()}`;
    
    const record: LearningRecord = {
      id,
      type,
      data,
      feedback: {
        positive: 0,
        negative: 0,
        acceptanceRate: 0,
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        confidence: 0.5,
        sampleSize: 1,
      },
    };

    this.learningRecords.set(id, record);
    
    // 合并同类型记录
    this.mergeLearningRecords(type);
  }

  /**
   * 合并学习记录
   */
  private mergeLearningRecords(type: LearningType): void {
    const records = Array.from(this.learningRecords.values()).filter(
      r => r.type === type
    );

    if (records.length < 2) return;

    const latest = records[records.length - 1];
    const previous = records.slice(0, -1);

    // 更新最新记录的置信度和样本数
    latest.metadata.sampleSize = previous.reduce(
      (sum, r) => sum + r.metadata.sampleSize,
      latest.metadata.sampleSize
    );

    latest.metadata.confidence = Math.min(
      0.95,
      0.5 + 0.1 * Math.log2(latest.metadata.sampleSize + 1)
    );

    // 删除旧记录（保留最近 5 条）
    if (previous.length > 5) {
      previous.slice(0, -5).forEach(r => this.learningRecords.delete(r.id));
    }
  }

  /**
   * 生成推荐
   * @param context 上下文
   * @param limit 推荐数量
   */
  public generateRecommendations(
    context: Record<string, any>,
    limit: number = 5
  ): Recommendation[] {
    if (!this.userProfile) {
      throw new Error('学习引擎未初始化');
    }

    const recommendations: Recommendation[] = [];

    // 基于问题偏好推荐
    if (context.suggestQuestions) {
      const questionRec = this.generateQuestionRecommendation();
      if (questionRec) recommendations.push(questionRec);
    }

    // 基于文档风格推荐
    if (context.generateDocument) {
      const docRec = this.generateDocumentRecommendation();
      if (docRec) recommendations.push(docRec);
    }

    // 基于需求类型推荐
    if (context.suggestRequirements) {
      const reqRecs = this.generateRequirementRecommendations(limit);
      recommendations.push(...reqRecs);
    }

    // 按分数排序
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations.slice(0, limit);
  }

  /**
   * 生成问题推荐
   */
  private generateQuestionRecommendation(): Recommendation | null {
    if (!this.userProfile) return null;

    const { preferredType } = this.userProfile.questionPreference;
    
    let content: any;
    let reason: string;

    switch (preferredType) {
      case 'open':
        content = {
          style: 'open',
          examples: [
            '您对这个功能有什么期望？',
            '这个需求可能带来哪些价值？',
            '还有哪些场景需要考虑？',
          ],
        };
        reason = '基于您偏好开放式问题的历史';
        break;
      case 'closed':
        content = {
          style: 'closed',
          examples: [
            '这个功能是否需要支持 X？',
            '优先级是高还是中？',
            '是否需要集成第三方服务？',
          ],
        };
        reason = '基于您偏好封闭式问题的历史';
        break;
      default:
        content = {
          style: 'balanced',
          examples: [
            '这个功能的核心价值是什么？',
            '是否需要支持多语言？',
            '目标用户群体有哪些？',
          ],
        };
        reason = '基于您平衡的问题风格';
    }

    return {
      id: `rec_question_${Date.now()}`,
      type: 'question_style',
      content,
      score: 0.8,
      reason,
      metadata: {
        createdAt: new Date(),
        source: 'learning_engine',
        tags: ['question', 'interaction'],
      },
    };
  }

  /**
   * 生成文档推荐
   */
  private generateDocumentRecommendation(): Recommendation | null {
    if (!this.userProfile) return null;

    const { detailLevel, structureLevel, technicalLevel } = this.userProfile.documentStyle;

    const content = {
      template: this.selectTemplate(detailLevel, structureLevel),
      sections: this.suggestSections(detailLevel),
      technicalDepth: technicalLevel,
    };

    return {
      id: `rec_document_${Date.now()}`,
      type: 'document_style',
      content,
      score: 0.85,
      reason: `基于您的文档偏好：${detailLevel}详细度，${structureLevel}结构化`,
      metadata: {
        createdAt: new Date(),
        source: 'learning_engine',
        tags: ['document', 'template'],
      },
    };
  }

  /**
   * 选择模板
   */
  private selectTemplate(
    detailLevel: string,
    structureLevel: string
  ): string {
    if (structureLevel === 'structured') {
      return detailLevel === 'detailed' ? 'comprehensive_template' : 'standard_template';
    } else if (structureLevel === 'semi') {
      return detailLevel === 'detailed' ? 'flexible_detailed_template' : 'flexible_template';
    } else {
      return 'freeform_template';
    }
  }

  /**
   * 建议章节
   */
  private suggestSections(detailLevel: string): string[] {
    const baseSections = ['背景', '目标', '功能描述'];
    
    if (detailLevel === 'standard' || detailLevel === 'detailed') {
      baseSections.push('非功能需求', '验收标准');
    }
    
    if (detailLevel === 'detailed') {
      baseSections.push('技术方案', '风险评估', '依赖关系');
    }

    return baseSections;
  }

  /**
   * 生成需求推荐
   */
  private generateRequirementRecommendations(limit: number): Recommendation[] {
    if (!this.userProfile) return [];

    const recommendations: Recommendation[] = [];
    const frequentTypes = this.userProfile.frequentRequirementTypes;

    frequentTypes.slice(0, limit).forEach((type, index) => {
      recommendations.push({
        id: `rec_requirement_${type}_${Date.now()}`,
        type: 'requirement_type',
        content: { requirementType: type },
        score: 0.9 - index * 0.05,
        reason: `基于您频繁创建${type}类型需求`,
        metadata: {
          createdAt: new Date(),
          source: 'learning_engine',
          tags: ['requirement', 'type'],
        },
      });
    });

    return recommendations;
  }

  /**
   * 记录反馈
   * @param recommendationId 推荐 ID
   * @param feedback 反馈结果
   */
  public recordFeedback(recommendationId: string, feedback: FeedbackResult): void {
    const recommendation = this.recommendations.get(recommendationId);
    if (!recommendation) {
      console.warn(`[学习引擎] 推荐不存在：${recommendationId}`);
      return;
    }

    // 记录反馈历史
    if (!this.feedbackHistory.has(recommendationId)) {
      this.feedbackHistory.set(recommendationId, []);
    }
    this.feedbackHistory.get(recommendationId)!.push(feedback);

    // 更新学习记录
    this.updateLearningFromFeedback(recommendation.type, feedback);

    console.log(`[学习引擎] 记录反馈：${recommendationId}, 接受：${feedback.accepted}`);
  }

  /**
   * 从反馈中学习
   */
  private updateLearningFromFeedback(type: string, feedback: FeedbackResult): void {
    // 查找相关学习记录
    const learningType = this.mapRecommendationTypeToLearningType(type);
    if (!learningType) return;

    const records = Array.from(this.learningRecords.values()).filter(
      r => r.type === learningType
    );

    if (records.length === 0) return;

    const latest = records[records.length - 1];

    // 更新反馈统计
    if (feedback.accepted) {
      latest.feedback.positive++;
    } else {
      latest.feedback.negative++;
    }

    const total = latest.feedback.positive + latest.feedback.negative;
    latest.feedback.acceptanceRate = latest.feedback.positive / total;

    // 更新置信度
    if (feedback.accepted) {
      latest.metadata.confidence = Math.min(
        0.95,
        latest.metadata.confidence + this.config.learningRate
      );
    } else {
      latest.metadata.confidence = Math.max(
        0.1,
        latest.metadata.confidence - this.config.learningRate * 0.5
      );
    }

    latest.metadata.updatedAt = new Date();
  }

  /**
   * 映射推荐类型到学习类型
   */
  private mapRecommendationTypeToLearningType(type: string): LearningType | null {
    const mapping: Record<string, LearningType> = {
      'question_style': LearningType.QUESTION_PREFERENCE,
      'document_style': LearningType.DOCUMENT_STYLE,
      'requirement_type': LearningType.REQUIREMENT_TYPE_FREQUENCY,
    };
    return mapping[type] || null;
  }

  /**
   * 获取用户画像
   */
  public getUserProfile(): UserProfile | null {
    return this.userProfile || null;
  }

  /**
   * 更新用户画像
   */
  public updateUserProfile(updates: Partial<UserProfile>): void {
    if (!this.userProfile) {
      throw new Error('学习引擎未初始化');
    }
    this.userProfile = { ...this.userProfile, ...updates };
  }

  /**
   * 获取学习记录
   */
  public getLearningRecords(type?: LearningType, limit: number = 10): LearningRecord[] {
    let records = Array.from(this.learningRecords.values());

    if (type) {
      records = records.filter(r => r.type === type);
    }

    // 按更新时间排序
    records.sort((a, b) => 
      new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
    );

    return records.slice(0, limit);
  }

  /**
   * 获取推荐统计
   */
  public getRecommendationStats(): {
    total: number;
    acceptanceRate: number;
    byType: Record<string, { total: number; accepted: number; rate: number }>;
  } {
    const byType: Record<string, { total: number; accepted: number; rate: number }> = {};

    let totalFeedbacks = 0;
    let totalAccepted = 0;

    this.feedbackHistory.forEach((feedbacks, recId) => {
      const recommendation = this.recommendations.get(recId);
      if (!recommendation) return;

      const type = recommendation.type;
      
      if (!byType[type]) {
        byType[type] = { total: 0, accepted: 0, rate: 0 };
      }

      feedbacks.forEach(f => {
        totalFeedbacks++;
        byType[type].total++;
        
        if (f.accepted) {
          totalAccepted++;
          byType[type].accepted++;
        }
      });
    });

    // 计算采纳率
    Object.values(byType).forEach(stats => {
      stats.rate = stats.total > 0 ? stats.accepted / stats.total : 0;
    });

    return {
      total: this.recommendations.size,
      acceptanceRate: totalFeedbacks > 0 ? totalAccepted / totalFeedbacks : 0,
      byType,
    };
  }

  /**
   * 应用衰减（定期执行）
   */
  public applyDecay(): void {
    this.learningRecords.forEach(record => {
      record.metadata.confidence *= this.config.decayFactor;
    });

    console.log('[学习引擎] 已应用衰减因子');
  }

  /**
   * 导出学习状态
   */
  public exportState(): Record<string, any> {
    return {
      userProfile: this.userProfile,
      learningRecords: Array.from(this.learningRecords.values()).map(r => ({
        ...r,
        metadata: {
          ...r.metadata,
          createdAt: r.metadata.createdAt.toISOString(),
          updatedAt: r.metadata.updatedAt.toISOString(),
        },
      })),
      recommendations: Array.from(this.recommendations.values()).map(r => ({
        ...r,
        metadata: {
          ...r.metadata,
          createdAt: r.metadata.createdAt.toISOString(),
        },
      })),
      feedbackHistory: Array.from(this.feedbackHistory.entries()),
    };
  }

  /**
   * 导入学习状态
   */
  public importState(state: Record<string, any>): void {
    if (state.userProfile) {
      this.userProfile = state.userProfile;
    }

    if (state.learningRecords) {
      state.learningRecords.forEach((item: any) => {
        const record: LearningRecord = {
          ...item,
          metadata: {
            ...item.metadata,
            createdAt: new Date(item.metadata.createdAt),
            updatedAt: new Date(item.metadata.updatedAt),
          },
        };
        this.learningRecords.set(record.id, record);
      });
    }

    if (state.recommendations) {
      state.recommendations.forEach((item: any) => {
        const rec: Recommendation = {
          ...item,
          metadata: {
            ...item.metadata,
            createdAt: new Date(item.metadata.createdAt),
          },
        };
        this.recommendations.set(rec.id, rec);
      });
    }

    if (state.feedbackHistory) {
      this.feedbackHistory = new Map(state.feedbackHistory);
    }

    console.log('[学习引擎] 已导入状态');
  }

  /**
   * 加载学习记录
   */
  private loadLearningRecords(): void {
    // 实际实现中从存储加载
    console.log('[学习引擎] 加载学习记录...');
  }
}

export default LearningEngine;
