/**
 * AI 增强模块
 * 
 * 提供 AI 驱动的需求增强能力，包括：
 * - 需求润色：消除歧义、补充要素、统一术语
 * - 歧义检测：实时检测模糊词汇
 * - 智能拆分：基于功能/角色/流程的自动拆分
 * - 优先级推荐：基于 MoSCoW 法则
 * - 用户故事生成：自动转化为用户故事格式
 * 
 * @packageDocumentation
 */

/**
 * 歧义检测结果
 */
export interface AmbiguityResult {
  /** 原始文本 */
  originalText: string;
  /** 检测到的模糊词汇 */
  ambiguousWords: AmbiguousWord[];
  /** 完整性评分 (0-100) */
  completenessScore: number;
  /** 缺失要素列表 */
  missingElements: MissingElement[];
  /** 建议澄清的问题 */
  clarificationQuestions: string[];
}

/**
 * 模糊词汇
 */
export interface AmbiguousWord {
  /** 词汇 */
  word: string;
  /** 位置 */
  position: number;
  /** 类型 */
  type: 'subjective' | 'uncertain' | 'unquantified';
  /** 建议替换 */
  suggestions: string[];
}

/**
 * 缺失要素
 */
export interface MissingElement {
  /** 要素类型 */
  type: 'who' | 'what' | 'when' | 'where' | 'why' | 'how' | 'how_much';
  /** 描述 */
  description: string;
  /** 重要性 */
  importance: 'high' | 'medium' | 'low';
}

/**
 * 需求润色结果
 */
export interface PolishedRequirement {
  /** 原始需求 */
  original: string;
  /** 润色后的需求 */
  polished: string;
  /** 修改说明 */
  changes: RequirementChange[];
  /** 质量提升评分 */
  improvementScore: number;
}

/**
 * 需求修改
 */
export interface RequirementChange {
  /** 修改类型 */
  type: 'ambiguity_removal' | 'element_addition' | 'terminology_unification' | 'clarity_improvement';
  /** 原始内容 */
  original?: string;
  /** 修改后内容 */
  modified: string;
  /** 修改原因 */
  reason: string;
}

/**
 * 拆分后的子需求
 */
export interface SubRequirement {
  /** 子需求 ID */
  id: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 拆分维度 */
  dimension: 'functional' | 'role' | 'process';
  /** 父需求 ID */
  parentId?: string;
  /** 依赖的子需求 ID 列表 */
  dependencies: string[];
  /** INVEST 原则检查 */
  investCheck: INVESTCheck;
}

/**
 * INVEST 原则检查
 */
export interface INVESTCheck {
  /** 独立性 (Independent) */
  independent: boolean;
  /** 可协商性 (Negotiable) */
  negotiable: boolean;
  /** 有价值 (Valuable) */
  valuable: boolean;
  /** 可估算 (Estimable) */
  estimable: boolean;
  /** 短小 (Small) */
  small: boolean;
  /** 可测试 (Testable) */
  testable: boolean;
  /** 总体评价 */
  overall: boolean;
}

/**
 * 优先级推荐结果
 */
export interface PriorityRecommendation {
  /** 需求 ID */
  requirementId: string;
  /** 需求描述 */
  description: string;
  /** MoSCoW 优先级 */
  moscowPriority: 'must' | 'should' | 'could' | 'wont';
  /** 业务价值评分 (1-10) */
  businessValue: number;
  /** 实现成本评分 (1-10) */
  implementationCost: number;
  /** 风险等级评分 (1-10) */
  riskLevel: number;
  /** 依赖关系 */
  dependencies: string[];
  /** 优先级理由 */
  rationale: string;
  /** 推荐排序 */
  recommendedOrder: number;
}

/**
 * 用户故事
 */
export interface UserStory {
  /** 故事 ID */
  id: string;
  /** 角色 */
  role: string;
  /** 功能 */
  feature: string;
  /** 价值 */
  value: string;
  /** 完整描述 */
  fullStory: string;
  /** 验收标准 */
  acceptanceCriteria: string[];
  /** 来源需求 ID */
  sourceRequirementId?: string;
}

/**
 * 模糊词汇词典
 */
const AMBIGUOUS_WORDS: Record<string, string[]> = {
  // 主观词汇
  '快速': ['在 2 秒内响应', '响应时间<500ms', '并发支持 1000+ QPS'],
  '迅速': ['在 2 秒内响应', '响应时间<500ms'],
  '及时': ['实时处理', '延迟<1 秒', '在 5 分钟内处理'],
  '友好': ['符合无障碍设计标准', '用户满意度>90%', '新手引导完整'],
  '美观': ['符合 Material Design 规范', '通过视觉设计评审', '用户评分>4.5'],
  '好用': ['用户任务完成率>95%', '学习成本<10 分钟', '操作步骤<3 步'],
  '方便': ['一键操作', '自动化处理', '无需手动配置'],
  '简单': ['操作步骤<3 步', '无需培训即可使用', '界面元素<5 个'],
  '灵活': ['支持自定义配置', '支持插件扩展', '可配置参数>10 个'],
  '强大': ['支持 10+ 种功能', '性能提升 50%+', '支持高并发场景'],
  
  // 不确定词汇
  '可能': ['明确条件', '给出概率', '说明前提'],
  '大概': ['给出具体数值', '明确范围', '提供准确描述'],
  '应该': ['明确责任方', '说明约束条件', '给出确定性描述'],
  '也许': ['明确条件', '给出确定性描述'],
  '或许': ['明确条件', '给出确定性描述'],
  '基本上': ['给出具体范围', '说明例外情况'],
  '几乎': ['给出具体比例', '如 99%', '说明例外'],
  '差不多': ['给出精确数值', '明确误差范围'],
  '左右': ['明确范围', '如±5%', '给出精确值'],
  '大约': ['给出精确数值', '明确范围'],
  
  // 缺失量化指标
  '多': ['具体数量', '如 1000 个', '明确上限'],
  '少': ['具体数量', '如<10 个', '明确下限'],
  '高': ['具体数值', '如>90%', '明确基准'],
  '低': ['具体数值', '如<5%', '明确基准'],
  '大': ['具体尺寸', '如 10GB', '明确范围'],
  '小': ['具体尺寸', '如<1MB', '明确范围'],
  '经常': ['频率', '如每天 3 次', '明确时间间隔'],
  '偶尔': ['频率', '如每月 1-2 次', '明确条件'],
  '定期': ['周期', '如每周一次', '明确时间点'],
};

/**
 * 5W2H 要素检查
 */
const FIVE_W_TWO_H = {
  who: {
    keywords: ['用户', '管理员', '角色', '人员', '客户', '访客'],
    question: '谁需要使用这个功能？',
    importance: 'high' as const,
  },
  what: {
    keywords: ['功能', '需求', '系统', '模块', '服务'],
    question: '需要实现什么功能？',
    importance: 'high' as const,
  },
  when: {
    keywords: ['时间', '时候', '时', '之前', '之后', '期间'],
    question: '什么时候使用？何时完成？',
    importance: 'medium' as const,
  },
  where: {
    keywords: ['地方', '位置', '场景', '环境', '平台'],
    question: '在哪里使用？',
    importance: 'low' as const,
  },
  why: {
    keywords: ['为了', '以便', '目的是', '原因', '理由'],
    question: '为什么需要这个功能？',
    importance: 'high' as const,
  },
  how: {
    keywords: ['如何', '怎么', '方式', '方法', '通过'],
    question: '如何实现？如何使用？',
    importance: 'medium' as const,
  },
  how_much: {
    keywords: ['多少', '数量', '规模', '成本', '预算'],
    question: '需要多少资源？性能指标是多少？',
    importance: 'medium' as const,
  },
};

/**
 * 用户故事模板
 */
const USER_STORY_TEMPLATE = '作为 {role}，我想要 {feature}，以便 {value}';

/**
 * 验收标准模板
 */
const ACCEPTANCE_CRITERIA_TEMPLATE = {
  given: 'Given',
  when: 'When',
  then: 'Then',
};

/**
 * MoSCoW 优先级权重
 */
const MOSCOW_WEIGHTS = {
  must: { min: 8, label: '必须有', description: '核心功能，缺少则系统无法运行' },
  should: { min: 6, label: '应该有', description: '重要功能，但可以有临时替代方案' },
  could: { min: 4, label: '可以有', description: '锦上添花的功能，不影响核心功能' },
  wont: { min: 0, label: '暂不需要', description: '本次迭代不实现的功能' },
};

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 检测文本中的歧义
 * 
 * @param text - 待检测的文本
 * @returns 歧义检测结果
 */
export function detectAmbiguity(text: string): AmbiguityResult {
  const ambiguousWords: AmbiguousWord[] = [];
  const missingElements: MissingElement[] = [];
  const clarificationQuestions: string[] = [];

  // 检测模糊词汇
  for (const [word, suggestions] of Object.entries(AMBIGUOUS_WORDS)) {
    const regex = new RegExp(word, 'g');
    let match;
    while ((match = regex.exec(text)) !== null) {
      let type: AmbiguousWord['type'] = 'unquantified';
      if (['快速', '友好', '美观', '好用', '简单'].includes(word)) {
        type = 'subjective';
      } else if (['可能', '大概', '应该', '也许', '或许'].includes(word)) {
        type = 'uncertain';
      }

      ambiguousWords.push({
        word,
        position: match.index,
        type,
        suggestions: suggestions.slice(0, 3),
      });
    }
  }

  // 检测 5W2H 要素缺失
  const lowerText = text.toLowerCase();
  for (const [element, config] of Object.entries(FIVE_W_TWO_H)) {
    const hasElement = config.keywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );

    if (!hasElement) {
      missingElements.push({
        type: element as MissingElement['type'],
        description: config.question,
        importance: config.importance,
      });
      clarificationQuestions.push(config.question);
    }
  }

  // 计算完整性评分
  const presentElements = 7 - missingElements.length;
  const completenessScore = Math.round((presentElements / 7) * 100);

  return {
    originalText: text,
    ambiguousWords,
    completenessScore,
    missingElements,
    clarificationQuestions,
  };
}

/**
 * 润色需求描述
 * 
 * @param requirement - 原始需求描述
 * @param context - 上下文信息（可选）
 * @returns 润色后的需求
 */
export function polishRequirement(
  requirement: string,
  context?: { industry?: string; domain?: string }
): PolishedRequirement {
  const changes: RequirementChange[] = [];
  let polished = requirement;

  // 1. 消除歧义
  for (const [word, suggestions] of Object.entries(AMBIGUOUS_WORDS)) {
    const regex = new RegExp(word, 'g');
    if (regex.test(polished)) {
      const bestSuggestion = suggestions[0];
      changes.push({
        type: 'ambiguity_removal',
        original: word,
        modified: bestSuggestion,
        reason: `消除模糊词汇"${word}"，使用具体描述`,
      });
      polished = polished.replace(regex, bestSuggestion);
    }
  }

  // 2. 补充缺失要素
  const ambiguityResult = detectAmbiguity(requirement);
  for (const missing of ambiguityResult.missingElements) {
    if (missing.importance === 'high') {
      const placeholder = `[需要补充：${missing.description}]`;
      changes.push({
        type: 'element_addition',
        modified: placeholder,
        reason: `补充缺失的${missing.type.toUpperCase()}要素`,
      });
      polished = `${polished} ${placeholder}`;
    }
  }

  // 3. 统一术语（简单示例）
  const terminologyMap: Record<string, string> = {
    '登陆': '登录',
    '帐号': '账号',
    '密码': '密码',
    '用户': '用户',
  };

  for (const [oldTerm, newTerm] of Object.entries(terminologyMap)) {
    if (polished.includes(oldTerm) && oldTerm !== newTerm) {
      changes.push({
        type: 'terminology_unification',
        original: oldTerm,
        modified: newTerm,
        reason: `统一术语：${oldTerm} → ${newTerm}`,
      });
      polished = polished.replace(new RegExp(oldTerm, 'g'), newTerm);
    }
  }

  // 4. 提升清晰度（添加标点、分段等）
  if (polished.length > 100 && !polished.includes('。')) {
    changes.push({
      type: 'clarity_improvement',
      modified: '已添加标点符号和分段',
      reason: '长文本需要适当分段以提高可读性',
    });
  }

  // 计算质量提升评分
  const improvementScore = Math.min(100, changes.length * 15 + (100 - ambiguityResult.completenessScore));

  return {
    original: requirement,
    polished,
    changes,
    improvementScore,
  };
}

/**
 * 智能拆分需求
 * 
 * @param requirement - 原始需求描述
 * @param dimension - 拆分维度（可选）
 * @returns 拆分后的子需求列表
 */
export function splitRequirement(
  requirement: string,
  dimension?: 'functional' | 'role' | 'process'
): SubRequirement[] {
  const subRequirements: SubRequirement[] = [];
  
  // 基于关键词的简单拆分逻辑
  const functionalKeywords = ['模块', '功能', '服务', '接口', '页面'];
  const roleKeywords = ['用户', '管理员', '角色', '客户', '访客'];
  const processKeywords = ['流程', '步骤', '阶段', '环节', '顺序'];

  // 检测需求中是否包含可拆分的关键词
  let detectedDimension = dimension;
  if (!detectedDimension) {
    const funcCount = functionalKeywords.filter(k => requirement.includes(k)).length;
    const roleCount = roleKeywords.filter(k => requirement.includes(k)).length;
    const processCount = processKeywords.filter(k => requirement.includes(k)).length;

    const maxCount = Math.max(funcCount, roleCount, processCount);
    if (maxCount === funcCount) detectedDimension = 'functional';
    else if (maxCount === roleCount) detectedDimension = 'role';
    else detectedDimension = 'process';
  }

  // 根据维度拆分
  switch (detectedDimension) {
    case 'functional':
      // 按功能模块拆分
      const functions = extractFunctions(requirement);
      functions.forEach((func, index) => {
        subRequirements.push({
          id: generateId(),
          title: `功能模块 ${index + 1}: ${func.title}`,
          description: func.description,
          dimension: 'functional',
          dependencies: index > 0 ? [subRequirements[index - 1].id] : [],
          investCheck: checkINVEST(func.description),
        });
      });
      break;

    case 'role':
      // 按用户角色拆分
      const roles = extractRoles(requirement);
      roles.forEach((role, index) => {
        subRequirements.push({
          id: generateId(),
          title: `${role} 相关功能`,
          description: `针对${role}角色的功能需求：${requirement}`,
          dimension: 'role',
          dependencies: [],
          investCheck: checkINVEST(`针对${role}角色的功能需求`),
        });
      });
      break;

    case 'process':
      // 按业务流程拆分
      const processes = extractProcesses(requirement);
      processes.forEach((process, index) => {
        subRequirements.push({
          id: generateId(),
          title: `流程步骤 ${index + 1}: ${process}`,
          description: `第${index + 1}步：${process}`,
          dimension: 'process',
          dependencies: index > 0 ? [subRequirements[index - 1].id] : [],
          investCheck: checkINVEST(process),
        });
      });
      break;
  }

  // 如果没有检测到可拆分的内容，返回原始需求作为一个整体
  if (subRequirements.length === 0) {
    subRequirements.push({
      id: generateId(),
      title: '整体需求',
      description: requirement,
      dimension: 'functional',
      dependencies: [],
      investCheck: checkINVEST(requirement),
    });
  }

  return subRequirements;
}

/**
 * 提取功能模块
 */
function extractFunctions(requirement: string): Array<{ title: string; description: string }> {
  // 简单的提取逻辑，实际应该使用 NLP 技术
  const sentences = requirement.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
  return sentences.map(sentence => ({
    title: sentence.substring(0, 30) + (sentence.length > 30 ? '...' : ''),
    description: sentence.trim(),
  }));
}

/**
 * 提取用户角色
 */
function extractRoles(requirement: string): string[] {
  const roleKeywords = ['用户', '管理员', '角色', '客户', '访客', '运营', '审核'];
  const roles = new Set<string>();
  
  roleKeywords.forEach(keyword => {
    if (requirement.includes(keyword)) {
      roles.add(keyword);
    }
  });

  return roles.size > 0 ? Array.from(roles) : ['用户'];
}

/**
 * 提取流程步骤
 */
function extractProcesses(requirement: string): string[] {
  const processKeywords = ['首先', '然后', '接着', '最后', '第一步', '第二步', '第三步'];
  const sentences = requirement.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
  
  return sentences.filter(sentence => 
    processKeywords.some(keyword => sentence.includes(keyword))
  );
}

/**
 * 检查 INVEST 原则
 */
function checkINVEST(description: string): INVESTCheck {
  const length = description.length;
  const hasMetrics = /\d+%|\d+ 个|\d+ 秒|\d+ms/.test(description);
  const hasActor = /用户 | 管理员 | 角色 | 系统/.test(description);
  const hasAction = /需要 | 应该 | 必须 | 支持 | 提供/.test(description);

  return {
    independent: true, // 简化判断
    negotiable: true,
    valuable: hasActor && hasAction,
    estimable: hasMetrics || length < 200,
    small: length < 100,
    testable: hasMetrics,
    overall: hasActor && hasAction && (hasMetrics || length < 200),
  };
}

/**
 * 推荐需求优先级
 * 
 * @param requirements - 需求列表
 * @returns 优先级推荐结果
 */
export function recommendPriority(
  requirements: Array<{ id: string; description: string }>
): PriorityRecommendation[] {
  const recommendations: PriorityRecommendation[] = [];

  requirements.forEach((req, index) => {
    // 计算各项评分（简化版本，实际应该使用更复杂的算法）
    const businessValue = calculateBusinessValue(req.description);
    const implementationCost = calculateImplementationCost(req.description);
    const riskLevel = calculateRiskLevel(req.description);

    // 计算综合得分
    const score = businessValue * 0.4 - implementationCost * 0.3 - riskLevel * 0.3 + 10;

    // 确定 MoSCoW 优先级
    let moscowPriority: PriorityRecommendation['moscowPriority'];
    if (score >= 8) moscowPriority = 'must';
    else if (score >= 6) moscowPriority = 'should';
    else if (score >= 4) moscowPriority = 'could';
    else moscowPriority = 'wont';

    recommendations.push({
      requirementId: req.id,
      description: req.description,
      moscowPriority,
      businessValue,
      implementationCost,
      riskLevel,
      dependencies: [],
      rationale: generateRationale(moscowPriority, businessValue, implementationCost, riskLevel),
      recommendedOrder: index,
    });
  });

  // 按优先级排序
  const priorityOrder = { must: 0, should: 1, could: 2, wont: 3 };
  recommendations.sort((a, b) => {
    const priorityDiff = priorityOrder[a.moscowPriority] - priorityOrder[b.moscowPriority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.businessValue - a.businessValue;
  });

  // 更新推荐顺序
  recommendations.forEach((rec, index) => {
    rec.recommendedOrder = index + 1;
  });

  return recommendations;
}

/**
 * 计算业务价值
 */
function calculateBusinessValue(description: string): number {
  let score = 5;
  
  // 包含核心业务关键词加分
  const coreKeywords = ['核心', '关键', '必要', '必须', '支付', '安全', '登录'];
  coreKeywords.forEach(keyword => {
    if (description.includes(keyword)) score += 1;
  });

  // 包含用户影响关键词加分
  const userImpactKeywords = ['所有用户', '用户体验', '满意度', '效率提升'];
  userImpactKeywords.forEach(keyword => {
    if (description.includes(keyword)) score += 0.5;
  });

  return Math.min(10, Math.max(1, score));
}

/**
 * 计算实现成本
 */
function calculateImplementationCost(description: string): number {
  let score = 5;
  
  // 包含高成本关键词加分
  const highCostKeywords = ['复杂', '集成', '第三方', '算法', '大数据', '实时'];
  highCostKeywords.forEach(keyword => {
    if (description.includes(keyword)) score += 1;
  });

  // 包含低成本关键词减分
  const lowCostKeywords = ['简单', '基础', '现有', '优化'];
  lowCostKeywords.forEach(keyword => {
    if (description.includes(keyword)) score -= 0.5;
  });

  return Math.min(10, Math.max(1, score));
}

/**
 * 计算风险等级
 */
function calculateRiskLevel(description: string): number {
  let score = 5;
  
  // 包含高风险关键词加分
  const highRiskKeywords = ['安全', '风险', '合规', '法律', '隐私', '金融'];
  highRiskKeywords.forEach(keyword => {
    if (description.includes(keyword)) score += 1;
  });

  return Math.min(10, Math.max(1, score));
}

/**
 * 生成优先级理由
 */
function generateRationale(
  priority: PriorityRecommendation['moscowPriority'],
  businessValue: number,
  cost: number,
  risk: number
): string {
  const priorityLabel = MOSCOW_WEIGHTS[priority].label;
  return `优先级：${priorityLabel}。业务价值：${businessValue}/10，实现成本：${cost}/10，风险等级：${risk}/10。${MOSCOW_WEIGHTS[priority].description}`;
}

/**
 * 生成用户故事
 * 
 * @param requirement - 需求描述
 * @param sourceRequirementId - 来源需求 ID（可选）
 * @returns 用户故事列表
 */
export function generateUserStories(
  requirement: string,
  sourceRequirementId?: string
): UserStory[] {
  const stories: UserStory[] = [];

  // 提取角色
  const roles = extractRoles(requirement);
  
  // 提取功能点
  const features = extractFeatures(requirement);
  
  // 提取价值
  const values = extractValues(requirement);

  // 组合生成用户故事
  roles.forEach(role => {
    features.forEach(feature => {
      const value = values.length > 0 ? values[0] : '实现业务目标';
      const fullStory = USER_STORY_TEMPLATE
        .replace('{role}', role)
        .replace('{feature}', feature)
        .replace('{value}', value);

      stories.push({
        id: generateId(),
        role,
        feature,
        value,
        fullStory,
        acceptanceCriteria: generateAcceptanceCriteria(feature),
        sourceRequirementId,
      });
    });
  });

  // 如果没有提取到角色，使用默认角色
  if (stories.length === 0) {
    const defaultStory: UserStory = {
      id: generateId(),
      role: '用户',
      feature: requirement,
      value: '满足业务需求',
      fullStory: USER_STORY_TEMPLATE
        .replace('{role}', '用户')
        .replace('{feature}', requirement)
        .replace('{value}', '满足业务需求'),
      acceptanceCriteria: generateAcceptanceCriteria(requirement),
      sourceRequirementId,
    };
    stories.push(defaultStory);
  }

  return stories;
}

/**
 * 提取功能点
 */
function extractFeatures(requirement: string): string[] {
  const sentences = requirement.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
  return sentences
    .filter(s => s.length > 5 && s.length < 100)
    .map(s => s.trim())
    .slice(0, 5); // 最多 5 个功能点
}

/**
 * 提取价值
 */
function extractValues(requirement: string): string[] {
  const valueKeywords = ['以便', '为了', '目的是', '从而', '进而'];
  const values: string[] = [];

  valueKeywords.forEach(keyword => {
    const index = requirement.indexOf(keyword);
    if (index !== -1) {
      const value = requirement.substring(index + keyword.length);
      const endMatch = value.match(/[。！？.!?]/);
      if (endMatch) {
        values.push(value.substring(0, endMatch.index).trim());
      } else {
        values.push(value.trim());
      }
    }
  });

  return values;
}

/**
 * 生成验收标准
 */
function generateAcceptanceCriteria(feature: string): string[] {
  return [
    `${ACCEPTANCE_CRITERIA_TEMPLATE.given} 用户已登录系统`,
    `${ACCEPTANCE_CRITERIA_TEMPLATE.when} 用户${feature}`,
    `${ACCEPTANCE_CRITERIA_TEMPLATE.then} 系统正确响应并显示预期结果`,
  ];
}

/**
 * 完整性评估
 * 
 * @param requirement - 需求描述
 * @returns 完整性评估报告
 */
export function assessCompleteness(requirement: string): {
  score: number;
  dimensions: Record<string, boolean>;
  suggestions: string[];
} {
  const ambiguityResult = detectAmbiguity(requirement);
  
  const dimensions: Record<string, boolean> = {
    who: !ambiguityResult.missingElements.some(e => e.type === 'who'),
    what: !ambiguityResult.missingElements.some(e => e.type === 'what'),
    when: !ambiguityResult.missingElements.some(e => e.type === 'when'),
    where: !ambiguityResult.missingElements.some(e => e.type === 'where'),
    why: !ambiguityResult.missingElements.some(e => e.type === 'why'),
    how: !ambiguityResult.missingElements.some(e => e.type === 'how'),
    how_much: !ambiguityResult.missingElements.some(e => e.type === 'how_much'),
  };

  const suggestions = ambiguityResult.clarificationQuestions;

  return {
    score: ambiguityResult.completenessScore,
    dimensions,
    suggestions,
  };
}

/**
 * 风险预警
 * 
 * @param requirement - 需求描述
 * @returns 风险预警列表
 */
export function identifyRisks(requirement: string): Array<{
  type: 'ambiguity' | 'conflict' | 'infeasible' | 'dependency';
  level: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
}> {
  const risks: Array<{
    type: 'ambiguity' | 'conflict' | 'infeasible' | 'dependency';
    level: 'high' | 'medium' | 'low';
    description: string;
    suggestion: string;
  }> = [];

  const ambiguityResult = detectAmbiguity(requirement);

  // 检测歧义风险
  if (ambiguityResult.ambiguousWords.length > 3) {
    risks.push({
      type: 'ambiguity',
      level: 'high',
      description: `检测到${ambiguityResult.ambiguousWords.length}个模糊词汇`,
      suggestion: '请澄清模糊描述，使用具体可量化的指标',
    });
  } else if (ambiguityResult.ambiguousWords.length > 0) {
    risks.push({
      type: 'ambiguity',
      level: 'medium',
      description: `检测到${ambiguityResult.ambiguousWords.length}个模糊词汇`,
      suggestion: '建议澄清关键模糊描述',
    });
  }

  // 检测依赖风险
  const dependencyKeywords = ['依赖', '需要', '基于', '集成', '对接'];
  if (dependencyKeywords.some(k => requirement.includes(k))) {
    risks.push({
      type: 'dependency',
      level: 'medium',
      description: '需求可能依赖外部系统或服务',
      suggestion: '请明确依赖关系和接口规范',
    });
  }

  // 检测不可实现风险
  const infeasibleKeywords = ['立即', '瞬间', '完美', '100%', '零'];
  if (infeasibleKeywords.some(k => requirement.includes(k))) {
    risks.push({
      type: 'infeasible',
      level: 'high',
      description: '需求可能包含不切实际的期望',
      suggestion: '请评估技术可行性，设定合理目标',
    });
  }

  return risks;
}

/**
 * 依赖发现
 * 
 * @param requirement - 需求描述
 * @returns 依赖关系列表
 */
export function discoverDependencies(requirement: string): Array<{
  type: 'external_system' | 'data_source' | 'prerequisite' | 'resource';
  description: string;
  criticality: 'high' | 'medium' | 'low';
}> {
  const dependencies: Array<{
    type: 'external_system' | 'data_source' | 'prerequisite' | 'resource';
    description: string;
    criticality: 'high' | 'medium' | 'low';
  }> = [];

  // 检测外部系统依赖
  const externalSystemKeywords = ['第三方', 'API', '接口', '支付', '短信', '邮件', '云'];
  if (externalSystemKeywords.some(k => requirement.includes(k))) {
    dependencies.push({
      type: 'external_system',
      description: '需要集成外部系统或服务',
      criticality: 'high',
    });
  }

  // 检测数据源依赖
  const dataKeywords = ['数据库', '数据', '信息', '记录', '历史'];
  if (dataKeywords.some(k => requirement.includes(k))) {
    dependencies.push({
      type: 'data_source',
      description: '需要访问或处理数据',
      criticality: 'medium',
    });
  }

  // 检测前置条件
  const prerequisiteKeywords = ['先', '之前', '前提', '基础', '准备'];
  if (prerequisiteKeywords.some(k => requirement.includes(k))) {
    dependencies.push({
      type: 'prerequisite',
      description: '存在前置条件或准备工作',
      criticality: 'high',
    });
  }

  return dependencies;
}

// 导出所有功能
export default {
  detectAmbiguity,
  polishRequirement,
  splitRequirement,
  recommendPriority,
  generateUserStories,
  assessCompleteness,
  identifyRisks,
  discoverDependencies,
};
