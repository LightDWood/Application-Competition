/**
 * 人格化交互模块 - 使用示例
 * 
 * 本文件展示如何使用 persona-engine 模块的各项功能
 */

import {
  PersonaEngine,
  PersonaManager,
  PersonaType,
  ContextMemoryManager,
  MemoryType,
  ProactiveNotifier,
  ReminderType,
  ReminderPriority,
  LearningEngine,
} from './index';

/**
 * 示例 1: 基础使用 - 使用统一的 PersonaEngine 入口
 */
export function example1_BasicUsage() {
  // 获取引擎实例
  const engine = PersonaEngine.getInstance();
  
  // 初始化
  engine.initialize('user_123', {
    storagePath: './data/memory',
    enableNotifications: true,
    enableLearning: true,
  });

  // 使用角色管理器
  engine.personaManager.switchPersona(PersonaType.ANALYST, '开始需求分析');
  
  // 使用记忆系统
  engine.contextMemory.storeMemory(
    MemoryType.USER_PREFERENCE,
    'preferences',
    { questionStyle: 'open', documentFormat: 'detailed' },
    ['preference']
  );

  // 导出状态（用于持久化）
  const state = engine.exportState();
  console.log('引擎状态:', state);
}

/**
 * 示例 2: 角色切换机制
 */
export function example2_PersonaSwitching() {
  const personaManager = PersonaManager.getInstance();

  // 切换到严谨分析师角色
  personaManager.switchPersona(PersonaType.ANALYST, '进行需求分析');
  const analystConfig = personaManager.getCurrentPersonaConfig();
  console.log('当前角色:', analystConfig.name);
  console.log('角色风格:', analystConfig.style);

  // 生成符合角色风格的回应
  const response = personaManager.generateResponse(
    '我们需要分析 {topic} 的 {aspect} 个方面',
    { topic: '用户注册功能', aspect: 5 }
  );
  console.log('分析师回应:', response);

  // 根据场景自动推荐角色
  const recommendedPersona = personaManager.recommendPersona('需要进行头脑风暴激发灵感');
  console.log('推荐角色:', recommendedPersona);

  // 切换到创意引导者
  personaManager.switchPersona(recommendedPersona);
  
  // 添加对话历史
  personaManager.addConversationHistory('用户提出了新需求...');
  const history = personaManager.getConversationHistory(5);
  console.log('对话历史:', history);
}

/**
 * 示例 3: 上下文记忆系统
 */
export function example3_ContextMemory() {
  const contextMemory = ContextMemoryManager.getInstance();

  // 初始化
  contextMemory.initialize('user_123', './data/memory');

  // 存储用户偏好
  contextMemory.updateUserPreferences({
    questionStyle: 'open',
    documentFormat: 'detailed',
    interactionStyle: 'formal',
  });

  // 存储历史决策
  contextMemory.storeDecision({
    decision: '采用敏捷开发模式',
    reason: '需求变化频繁，需要快速迭代',
    priority: 'high',
    decisionDate: new Date(),
  });

  // 存储术语
  contextMemory.storeTerm({
    term: '需求收敛',
    definition: '将模糊的需求逐步明确和具体化的过程',
    termType: 'business',
    relatedTerms: ['需求分析', '需求管理'],
  });

  // 存储项目背景
  contextMemory.storeProjectContext({
    businessGoals: ['提升用户体验', '降低运营成本'],
    constraints: ['预算有限', '时间紧迫'],
    stakeholders: ['产品部', '技术部', '运营部'],
  });

  // 检索记忆
  const preferences = contextMemory.getUserPreferences();
  console.log('用户偏好:', preferences);

  const decisions = contextMemory.retrieveDecisions(5);
  console.log('历史决策:', decisions);

  const terms = contextMemory.retrieveTerms('business');
  console.log('业务术语:', terms);

  // 查找相关术语
  const relatedTerms = contextMemory.findRelatedTerms('需求收敛', 2);
  console.log('相关术语:', relatedTerms);

  // 获取记忆统计
  const stats = contextMemory.getMemoryStats();
  console.log('记忆统计:', stats);
}

/**
 * 示例 4: 主动提醒引擎
 */
export function example4_ProactiveNotifier() {
  const notifier = ProactiveNotifier.getInstance();

  // 初始化
  notifier.initialize({
    clarificationCheckInterval: 24,
    reviewAdvanceNoticeDays: 1,
    enabled: true,
  });

  // 注册提醒回调
  notifier.onReminder(ReminderType.CLARIFICATION_NEEDED, (reminder) => {
    console.log('收到澄清提醒:', reminder.title);
    // 可以在这里发送通知
  });

  // 设置全局提醒回调
  notifier.setOnGlobalReminder((reminder) => {
    console.log('全局提醒:', reminder.message);
  });

  // 检查需求待澄清
  const clarificationReminder = notifier.checkClarificationNeeded(
    'req_001',
    new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 小时前
    true
  );
  if (clarificationReminder) {
    console.log('创建澄清提醒:', clarificationReminder.title);
  }

  // 检查评审节点临近
  const reviewReminder = notifier.checkReviewDeadline(
    'review_001',
    new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 小时后
  );
  if (reviewReminder) {
    console.log('创建评审提醒:', reviewReminder.title);
  }

  // 检查变更影响
  const changeReminder = notifier.checkChangeImpact(
    'req_002',
    '修改了用户登录流程',
    ['req_003', 'req_004', 'req_005']
  );
  if (changeReminder) {
    console.log('创建变更提醒:', changeReminder.title);
  }

  // 检查里程碑达成
  const milestoneReminder = notifier.checkMilestoneReached(
    '需求定稿',
    '所有需求已完成评审并定稿',
    new Date()
  );
  if (milestoneReminder) {
    console.log('创建里程碑提醒:', milestoneReminder.title);
  }

  // 获取待处理的提醒
  const pendingReminders = notifier.getPendingReminders();
  console.log('待处理提醒数:', pendingReminders.length);

  // 确认提醒
  if (pendingReminders.length > 0) {
    notifier.acknowledgeReminder(pendingReminders[0].id);
  }

  // 获取提醒统计
  const reminderStats = notifier.getReminderStats();
  console.log('提醒统计:', reminderStats);
}

/**
 * 示例 5: 学习进化算法
 */
export function example5_LearningEngine() {
  const learningEngine = LearningEngine.getInstance();

  // 初始化
  learningEngine.initialize('user_123', {
    learningRate: 0.1,
    enableOnlineLearning: true,
  });

  // 记录用户交互
  learningEngine.recordInteraction('question', {
    isOpen: true,
    category: 'requirement',
  });

  learningEngine.recordInteraction('document_interaction', {
    detailLevel: 'detailed',
    structureLevel: 'structured',
    technicalLevel: 0.8,
  });

  learningEngine.recordInteraction('requirement', {
    type: '功能需求',
  });

  // 生成推荐
  const recommendations = learningEngine.generateRecommendations(
    {
      suggestQuestions: true,
      generateDocument: true,
      suggestRequirements: true,
    },
    5
  );
  console.log('推荐列表:', recommendations);

  // 记录反馈
  if (recommendations.length > 0) {
    learningEngine.recordFeedback(recommendations[0].id, {
      accepted: true,
      rating: 5,
      comment: '很有帮助',
      timestamp: new Date(),
    });
  }

  // 获取用户画像
  const profile = learningEngine.getUserProfile();
  if (profile) {
    console.log('用户画像:', profile);
    console.log('提问偏好:', profile.questionPreference);
    console.log('文档风格:', profile.documentStyle);
    console.log('高频需求类型:', profile.frequentRequirementTypes);
  }

  // 获取学习记录
  const learningRecords = learningEngine.getLearningRecords(undefined, 5);
  console.log('学习记录:', learningRecords);

  // 获取推荐统计
  const stats = learningEngine.getRecommendationStats();
  console.log('推荐统计:', stats);

  // 应用衰减（定期执行，如每周）
  learningEngine.applyDecay();
}

/**
 * 示例 6: 综合使用场景 - 需求分析会话
 */
export function example6_IntegratedScenario() {
  // 获取引擎实例
  const engine = PersonaEngine.getInstance();
  engine.initialize('user_123');

  // 场景：开始需求分析会话
  
  // 1. 根据场景切换角色
  engine.personaManager.switchPersona(PersonaType.ANALYST, '开始需求分析');
  
  // 2. 从记忆中获取用户偏好
  const preferences = engine.contextMemory.getUserPreferences();
  console.log('使用用户偏好:', preferences);

  // 3. 获取项目背景
  const projectContext = engine.contextMemory.getProjectContext();
  console.log('项目背景:', projectContext);

  // 4. 检查是否有待处理的提醒
  const pendingReminders = engine.proactiveNotifier.getPendingReminders();
  pendingReminders.forEach(reminder => {
    console.log('待处理提醒:', reminder.title);
  });

  // 5. 生成符合用户偏好的问题
  const recommendations = engine.learningEngine.generateRecommendations({
    suggestQuestions: true,
  });
  console.log('推荐问题:', recommendations);

  // 6. 记录本次交互
  engine.learningEngine.recordInteraction('question', {
    isOpen: true,
  });

  // 7. 存储新的决策
  engine.contextMemory.storeDecision({
    decision: '采用微服务架构',
    reason: '系统需要高可扩展性',
    priority: 'high',
    decisionDate: new Date(),
  });

  // 8. 会话结束，保存状态
  const state = engine.exportState();
  console.log('会话状态已保存');
}

/**
 * 示例 7: 状态持久化
 */
export function example7_StatePersistence() {
  const engine = PersonaEngine.getInstance();
  
  // 初始化并做一些操作
  engine.initialize('user_123');
  engine.personaManager.switchPersona(PersonaType.FACILITATOR);
  engine.contextMemory.storeMemory(
    MemoryType.TERMINOLOGY,
    'test_term',
    { term: '测试术语', definition: '用于测试' }
  );

  // 导出状态
  const state = engine.exportState();
  console.log('导出状态:', JSON.stringify(state, null, 2));

  // 模拟保存到文件/数据库
  // fs.writeFileSync('./data/engine_state.json', JSON.stringify(state));

  // 模拟从文件/数据库加载
  // const loadedState = JSON.parse(fs.readFileSync('./data/engine_state.json', 'utf-8'));
  
  // 导入状态
  const newEngine = PersonaEngine.getInstance();
  newEngine.importState(state);
  
  // 验证状态恢复
  const context = newEngine.personaManager.getCurrentContext();
  console.log('恢复后的角色:', context.currentPersona);
}

// 运行示例（取消注释以运行）
// example1_BasicUsage();
// example2_PersonaSwitching();
// example3_ContextMemory();
// example4_ProactiveNotifier();
// example5_LearningEngine();
// example6_IntegratedScenario();
// example7_StatePersistence();
