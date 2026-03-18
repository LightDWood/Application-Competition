/**
 * 主动提醒引擎 - 实现定时检查和通知机制
 * 支持：需求待澄清、评审节点、变更影响、里程碑达成
 */

/**
 * 提醒类型枚举
 */
export enum ReminderType {
  /** 需求待澄清提醒 */
  CLARIFICATION_NEEDED = 'clarification_needed',
  /** 评审节点临近提醒 */
  REVIEW_DEADLINE = 'review_deadline',
  /** 变更影响提醒 */
  CHANGE_IMPACT = 'change_impact',
  /** 里程碑达成提醒 */
  MILESTONE_REACHED = 'milestone_reached',
}

/**
 * 提醒优先级
 */
export enum ReminderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * 提醒状态
 */
export enum ReminderStatus {
  PENDING = 'pending',
  SENT = 'sent',
  ACKNOWLEDGED = 'acknowledged',
  DISMISSED = 'dismissed',
}

/**
 * 提醒条目接口
 */
export interface Reminder {
  id: string;
  type: ReminderType;
  priority: ReminderPriority;
  status: ReminderStatus;
  title: string;
  message: string;
  metadata: {
    createdAt: Date;
    scheduledAt?: Date;
    sentAt?: Date;
    acknowledgedAt?: Date;
    expiresAt?: Date;
    relatedEntities?: string[];
  };
  actions?: ReminderAction[];
}

/**
 * 提醒操作接口
 */
export interface ReminderAction {
  label: string;
  actionType: 'navigate' | 'execute' | 'custom';
  payload?: any;
}

/**
 * 提醒配置接口
 */
export interface ReminderConfig {
  /** 需求待澄清检查间隔（小时） */
  clarificationCheckInterval: number;
  /** 评审节点提前提醒时间（天） */
  reviewAdvanceNoticeDays: number;
  /** 变更影响检查间隔（小时） */
  changeImpactCheckInterval: number;
  /** 提醒过期时间（天） */
  reminderExpirationDays: number;
  /** 是否启用提醒 */
  enabled: boolean;
}

/**
 * 提醒回调函数类型
 */
export type ReminderCallback = (reminder: Reminder) => void | Promise<void>;

/**
 * 主动提醒引擎类
 */
export class ProactiveNotifier {
  private static instance: ProactiveNotifier;
  
  private reminders: Map<string, Reminder>;
  private config: ReminderConfig;
  private checkInterval?: NodeJS.Timeout;
  private callbacks: Map<ReminderType, ReminderCallback[]>;
  private onGlobalReminder?: (reminder: Reminder) => void;

  private constructor() {
    this.reminders = new Map();
    this.callbacks = new Map();
    this.config = this.getDefaultConfig();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ProactiveNotifier {
    if (!ProactiveNotifier.instance) {
      ProactiveNotifier.instance = new ProactiveNotifier();
    }
    return ProactiveNotifier.instance;
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): ReminderConfig {
    return {
      clarificationCheckInterval: 24, // 24 小时
      reviewAdvanceNoticeDays: 1, // 提前 1 天
      changeImpactCheckInterval: 12, // 12 小时
      reminderExpirationDays: 7, // 7 天过期
      enabled: true,
    };
  }

  /**
   * 初始化提醒引擎
   * @param config 配置（可选）
   */
  public initialize(config?: Partial<ReminderConfig>): void {
    this.config = { ...this.config, ...config };
    this.registerDefaultCallbacks();
    
    if (this.config.enabled) {
      this.startPeriodicCheck();
    }

    console.log('[提醒引擎] 已初始化');
  }

  /**
   * 注册默认回调
   */
  private registerDefaultCallbacks(): void {
    // 为每种提醒类型注册空回调（防止未处理）
    Object.values(ReminderType).forEach(type => {
      if (!this.callbacks.has(type)) {
        this.callbacks.set(type, []);
      }
    });
  }

  /**
   * 启动定期检查
   */
  private startPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    const checkIntervalMs = Math.min(
      this.config.clarificationCheckInterval,
      this.config.changeImpactCheckInterval
    ) * 60 * 60 * 1000;

    this.checkInterval = setInterval(() => {
      this.runAllChecks();
    }, checkIntervalMs);

    console.log(`[提醒引擎] 定期检查已启动，间隔：${checkIntervalMs / 1000 / 60} 分钟`);
  }

  /**
   * 停止定期检查
   */
  public stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
      console.log('[提醒引擎] 定期检查已停止');
    }
  }

  /**
   * 运行所有检查
   */
  private runAllChecks(): void {
    console.log('[提醒引擎] 运行定期检查...');
    // 实际实现中会调用各种检查方法
    // 这里由外部触发检查
  }

  /**
   * 注册提醒回调
   * @param type 提醒类型
   * @param callback 回调函数
   */
  public onReminder(type: ReminderType, callback: ReminderCallback): void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, []);
    }
    this.callbacks.get(type)!.push(callback);
  }

  /**
   * 移除提醒回调
   */
  public offReminder(type: ReminderType, callback: ReminderCallback): void {
    const callbacks = this.callbacks.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 设置全局提醒回调
   */
  public setOnGlobalReminder(callback: (reminder: Reminder) => void): void {
    this.onGlobalReminder = callback;
  }

  /**
   * 创建提醒
   */
  public createReminder(
    type: ReminderType,
    title: string,
    message: string,
    priority: ReminderPriority = ReminderPriority.MEDIUM,
    relatedEntities?: string[],
    actions?: ReminderAction[]
  ): Reminder {
    const id = `reminder_${type}_${Date.now()}`;
    const now = new Date();

    const reminder: Reminder = {
      id,
      type,
      priority,
      status: ReminderStatus.PENDING,
      title,
      message,
      metadata: {
        createdAt: now,
        scheduledAt: now,
        expiresAt: new Date(now.getTime() + this.config.reminderExpirationDays * 24 * 60 * 60 * 1000),
        relatedEntities,
      },
      actions,
    };

    this.reminders.set(id, reminder);
    console.log(`[提醒创建] ${type}: ${title}`);

    // 触发回调
    this.triggerCallbacks(reminder);

    return reminder;
  }

  /**
   * 触发回调
   */
  private async triggerCallbacks(reminder: Reminder): Promise<void> {
    // 触发类型特定的回调
    const typeCallbacks = this.callbacks.get(reminder.type) || [];
    for (const callback of typeCallbacks) {
      try {
        await callback(reminder);
      } catch (error) {
        console.error(`[提醒回调] 执行失败：${error}`);
      }
    }

    // 触发全局回调
    if (this.onGlobalReminder) {
      try {
        await this.onGlobalReminder(reminder);
      } catch (error) {
        console.error(`[全局回调] 执行失败：${error}`);
      }
    }
  }

  /**
   * 发送提醒
   */
  public async sendReminder(reminderId: string): Promise<boolean> {
    const reminder = this.reminders.get(reminderId);
    if (!reminder || reminder.status !== ReminderStatus.PENDING) {
      return false;
    }

    // 更新状态
    reminder.status = ReminderStatus.SENT;
    reminder.metadata.sentAt = new Date();

    console.log(`[提醒发送] ${reminder.type}: ${reminder.title}`);
    return true;
  }

  /**
   * 确认提醒
   */
  public acknowledgeReminder(reminderId: string): boolean {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) {
      return false;
    }

    reminder.status = ReminderStatus.ACKNOWLEDGED;
    reminder.metadata.acknowledgedAt = new Date();

    console.log(`[提醒确认] ${reminder.type}: ${reminder.title}`);
    return true;
  }

  /**
   * 取消提醒
   */
  public dismissReminder(reminderId: string): boolean {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) {
      return false;
    }

    reminder.status = ReminderStatus.DISMISSED;
    console.log(`[提醒取消] ${reminder.type}: ${reminder.title}`);
    return true;
  }

  /**
   * 获取待处理的提醒
   */
  public getPendingReminders(type?: ReminderType): Reminder[] {
    let reminders = Array.from(this.reminders.values()).filter(
      r => r.status === ReminderStatus.PENDING
    );

    if (type) {
      reminders = reminders.filter(r => r.type === type);
    }

    // 按优先级排序
    const priorityOrder: Record<ReminderPriority, number> = {
      [ReminderPriority.URGENT]: 0,
      [ReminderPriority.HIGH]: 1,
      [ReminderPriority.MEDIUM]: 2,
      [ReminderPriority.LOW]: 3,
    };

    reminders.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return reminders;
  }

  /**
   * 获取所有提醒
   */
  public getAllReminders(status?: ReminderStatus): Reminder[] {
    let reminders = Array.from(this.reminders.values());

    if (status) {
      reminders = reminders.filter(r => r.status === status);
    }

    return reminders;
  }

  /**
   * 检查需求待澄清
   * @param requirementId 需求 ID
   * @param lastUpdateTime 最后更新时间
   * @param clarificationNeeded 是否需要澄清
   */
  public checkClarificationNeeded(
    requirementId: string,
    lastUpdateTime: Date,
    clarificationNeeded: boolean
  ): Reminder | null {
    if (!clarificationNeeded) {
      return null;
    }

    const hoursSinceUpdate = (Date.now() - lastUpdateTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate >= this.config.clarificationCheckInterval) {
      // 检查是否已有提醒
      const existing = this.getPendingReminders(ReminderType.CLARIFICATION_NEEDED).find(
        r => r.metadata.relatedEntities?.includes(requirementId)
      );

      if (existing) {
        return existing;
      }

      return this.createReminder(
        ReminderType.CLARIFICATION_NEEDED,
        '需求待澄清',
        `需求 ${requirementId} 已超过 ${Math.floor(hoursSinceUpdate)} 小时未响应，需要澄清。`,
        ReminderPriority.HIGH,
        [requirementId],
        [
          {
            label: '立即处理',
            actionType: 'navigate',
            payload: { requirementId },
          },
          {
            label: '稍后处理',
            actionType: 'execute',
            payload: { action: 'snooze', requirementId },
          },
        ]
      );
    }

    return null;
  }

  /**
   * 检查评审节点临近
   * @param reviewId 评审 ID
   * @param reviewDate 评审日期
   */
  public checkReviewDeadline(reviewId: string, reviewDate: Date): Reminder | null {
    const now = new Date();
    const daysUntilReview = (reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntilReview <= this.config.reviewAdvanceNoticeDays && daysUntilReview >= 0) {
      // 检查是否已有提醒
      const existing = this.getPendingReminders(ReminderType.REVIEW_DEADLINE).find(
        r => r.metadata.relatedEntities?.includes(reviewId)
      );

      if (existing) {
        return existing;
      }

      const hoursUntilReview = Math.floor(daysUntilReview * 24);
      const priority = hoursUntilReview < 12
        ? ReminderPriority.URGENT
        : hoursUntilReview < 24
        ? ReminderPriority.HIGH
        : ReminderPriority.MEDIUM;

      return this.createReminder(
        ReminderType.REVIEW_DEADLINE,
        '评审节点临近',
        `评审 ${reviewId} 将于 ${hoursUntilReview} 小时后进行，请做好准备。`,
        priority,
        [reviewId],
        [
          {
            label: '查看详情',
            actionType: 'navigate',
            payload: { reviewId },
          },
          {
            label: '准备材料',
            actionType: 'execute',
            payload: { action: 'prepare', reviewId },
          },
        ]
      );
    }

    return null;
  }

  /**
   * 检查变更影响
   * @param requirementId 需求 ID
   * @param changeDescription 变更描述
   * @param impactedRequirements 受影响的需求列表
   */
  public checkChangeImpact(
    requirementId: string,
    changeDescription: string,
    impactedRequirements: string[]
  ): Reminder | null {
    if (impactedRequirements.length === 0) {
      return null;
    }

    // 检查是否已有提醒
    const existing = this.getPendingReminders(ReminderType.CHANGE_IMPACT).find(
      r => r.metadata.relatedEntities?.includes(requirementId)
    );

    if (existing) {
      return existing;
    }

    return this.createReminder(
      ReminderType.CHANGE_IMPACT,
      '需求变更影响',
      `需求 ${requirementId} 发生变更：${changeDescription}，影响 ${impactedRequirements.length} 个相关需求。`,
      ReminderPriority.HIGH,
      [requirementId, ...impactedRequirements],
      [
        {
          label: '查看影响',
          actionType: 'navigate',
          payload: { requirementId, impactedRequirements },
        },
        {
          label: '评估风险',
          actionType: 'execute',
          payload: { action: 'assess', requirementId },
        },
      ]
    );
  }

  /**
   * 检查里程碑达成
   * @param milestoneName 里程碑名称
   * @param description 描述
   * @param achievedAt 达成时间
   */
  public checkMilestoneReached(
    milestoneName: string,
    description: string,
    achievedAt: Date
  ): Reminder | null {
    // 检查是否已有提醒
    const existing = this.getAllReminders(ReminderStatus.SENT).find(
      r => r.title === milestoneName
    );

    if (existing) {
      return null;
    }

    return this.createReminder(
      ReminderType.MILESTONE_REACHED,
      milestoneName,
      description,
      ReminderPriority.MEDIUM,
      [],
      [
        {
          label: '查看详情',
          actionType: 'navigate',
          payload: { milestoneName },
        },
        {
          label: '庆祝一下',
          actionType: 'execute',
          payload: { action: 'celebrate' },
        },
      ]
    );
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<ReminderConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.enabled && !this.checkInterval) {
      this.startPeriodicCheck();
    } else if (!this.config.enabled && this.checkInterval) {
      this.stopPeriodicCheck();
    }

    console.log('[提醒引擎] 配置已更新');
  }

  /**
   * 获取配置
   */
  public getConfig(): ReminderConfig {
    return { ...this.config };
  }

  /**
   * 清理过期提醒
   */
  public cleanupExpiredReminders(): void {
    const now = new Date();
    let cleaned = 0;

    this.reminders.forEach((reminder, id) => {
      if (reminder.metadata.expiresAt && new Date(reminder.metadata.expiresAt) < now) {
        this.reminders.delete(id);
        cleaned++;
      }
    });

    console.log(`[提醒清理] 清理了 ${cleaned} 条过期提醒`);
  }

  /**
   * 获取提醒统计
   */
  public getReminderStats(): {
    total: number;
    byType: Record<ReminderType, number>;
    byStatus: Record<ReminderStatus, number>;
    byPriority: Record<ReminderPriority, number>;
  } {
    const byType: Record<ReminderType, number> = {
      [ReminderType.CLARIFICATION_NEEDED]: 0,
      [ReminderType.REVIEW_DEADLINE]: 0,
      [ReminderType.CHANGE_IMPACT]: 0,
      [ReminderType.MILESTONE_REACHED]: 0,
    };

    const byStatus: Record<ReminderStatus, number> = {
      [ReminderStatus.PENDING]: 0,
      [ReminderStatus.SENT]: 0,
      [ReminderStatus.ACKNOWLEDGED]: 0,
      [ReminderStatus.DISMISSED]: 0,
    };

    const byPriority: Record<ReminderPriority, number> = {
      [ReminderPriority.LOW]: 0,
      [ReminderPriority.MEDIUM]: 0,
      [ReminderPriority.HIGH]: 0,
      [ReminderPriority.URGENT]: 0,
    };

    this.reminders.forEach(reminder => {
      byType[reminder.type]++;
      byStatus[reminder.status]++;
      byPriority[reminder.priority]++;
    });

    return {
      total: this.reminders.size,
      byType,
      byStatus,
      byPriority,
    };
  }

  /**
   * 导出提醒状态
   */
  public exportState(): Record<string, any>[] {
    return Array.from(this.reminders.values()).map(reminder => ({
      ...reminder,
      metadata: {
        ...reminder.metadata,
        createdAt: reminder.metadata.createdAt.toISOString(),
        scheduledAt: reminder.metadata.scheduledAt?.toISOString(),
        sentAt: reminder.metadata.sentAt?.toISOString(),
        acknowledgedAt: reminder.metadata.acknowledgedAt?.toISOString(),
        expiresAt: reminder.metadata.expiresAt?.toISOString(),
      },
    }));
  }

  /**
   * 导入提醒状态
   */
  public importState(data: Record<string, any>[]): void {
    data.forEach(item => {
      const reminder: Reminder = {
        ...item,
        metadata: {
          ...item.metadata,
          createdAt: new Date(item.metadata.createdAt),
          scheduledAt: item.metadata.scheduledAt
            ? new Date(item.metadata.scheduledAt)
            : undefined,
          sentAt: item.metadata.sentAt
            ? new Date(item.metadata.sentAt)
            : undefined,
          acknowledgedAt: item.metadata.acknowledgedAt
            ? new Date(item.metadata.acknowledgedAt)
            : undefined,
          expiresAt: item.metadata.expiresAt
            ? new Date(item.metadata.expiresAt)
            : undefined,
        },
      };
      this.reminders.set(reminder.id, reminder);
    });
    console.log(`[提醒导入] 导入了 ${data.length} 条提醒`);
  }
}

export default ProactiveNotifier;
