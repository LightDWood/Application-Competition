/**
 * 验收标准自动生成模块
 * 
 * 基于需求描述自动生成 Given-When-Then 格式的验收标准，包括：
 * - 前置条件（Given）
 * - 操作（When）
 * - 预期结果（Then）
 * - 支持多个验收场景
 * - 输出结构化的验收标准列表
 * 
 * @packageDocumentation
 */

/**
 * 验收标准场景类型
 */
export type AcceptanceScenarioType = 
  | 'happy_path'       // 主流程
  | 'alternative'      // 备选流程
  | 'edge_case'        // 边界情况
  | 'error_case'       // 异常情况

/**
 * 验收标准场景
 */
export interface AcceptanceScenario {
  /** 场景 ID */
  id: string
  /** 场景标题 */
  title: string
  /** 场景类型 */
  type: AcceptanceScenarioType
  /** 场景描述 */
  description: string
  /** Given 前置条件列表 */
  givens: string[]
  /** When 操作列表 */
  whens: string[]
  /** Then 预期结果列表 */
  thens: string[]
  /** 优先级 */
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  /** 依赖的场景 ID */
  dependencies: string[]
  /** 标签 */
  tags: string[]
}

/**
 * 验收标准集合
 */
export interface AcceptanceCriteriaSet {
  /** 来源需求 ID */
  requirementId: string
  /** 来源需求描述 */
  requirementDescription: string
  /** 验收标准场景列表 */
  scenarios: AcceptanceScenario[]
  /** 总场景数 */
  totalScenarios: number
  /** 生成的验收标准数量 */
  totalCriteria: number
  /** 覆盖度评分（0-100） */
  coverageScore: number
  /** 生成时间 */
  generatedAt: string
}

/**
 * 场景生成规则
 */
interface ScenarioGenerationRule {
  /** 规则 ID */
  id: string
  /** 规则名称 */
  name: string
  /** 场景类型 */
  type: AcceptanceScenarioType
  /** 触发关键词 */
  triggerKeywords: string[]
  /** 前置条件模式 */
  givenPatterns: RegExp[]
  /** 操作模式 */
  whenPatterns: RegExp[]
  /** 预期结果模式 */
  thenPatterns: RegExp[]
  /** 优先级 */
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

/**
 * 场景生成规则定义
 */
const SCENARIO_GENERATION_RULES: ScenarioGenerationRule[] = [
  // 主流程规则
  {
    id: 'sgr-happy-1',
    name: '正常操作流程',
    type: 'happy_path',
    triggerKeywords: ['正常', '主要', '核心', '基本'],
    givenPatterns: [
      /用户 (?:已 | 已经) (?:登录 | 注册 | 准备)/,
      /系统 (?:已 | 已经) (?:初始化 | 就绪 | 准备)/,
      /在 (?:...)? 条件 (?:下 | 时)/,
      /假设/
    ],
    whenPatterns: [
      /用户 (?:点击 | 输入 | 选择 | 提交 | 确认 | 操作)/,
      /系统 (?:接收 | 处理 | 响应 | 执行)/,
      /当 (?:用户 | 系统) (?:进行 | 执行 | 完成)/
    ],
    thenPatterns: [
      /系统 (?:应 | 应该 | 必须 | 将) (?:显示 | 返回 | 提示 | 跳转)/,
      /然后 (?:显示 | 出现 | 生成 | 创建)/,
      /预期 (?:结果 | 效果 | 行为)/
    ],
    priority: 'HIGH'
  },
  
  // 备选流程规则
  {
    id: 'sgr-alt-1',
    name: '备选方案',
    type: 'alternative',
    triggerKeywords: ['或者', '否则', '备选', '替代', '另外'],
    givenPatterns: [
      /如果 (?:存在 | 有 | 已)/,
      /在 (?:其他 | 不同 | 特殊) 情况 (?:下 | 时)/
    ],
    whenPatterns: [
      /用户 (?:选择 | 决定 | 采用) (?:其他 | 备选)/,
      /系统 (?:检测 | 发现 | 判断)/
    ],
    thenPatterns: [
      /系统 (?:应 | 应该) (?:提供 | 支持 | 允许)/,
      /可以 (?:选择 | 进行 | 执行)/
    ],
    priority: 'MEDIUM'
  },
  
  // 边界情况规则
  {
    id: 'sgr-edge-1',
    name: '边界条件',
    type: 'edge_case',
    triggerKeywords: ['边界', '极限', '最大', '最小', '临界'],
    givenPatterns: [
      /当 (?:数据 | 输入 | 参数) (?:达到 | 超过 | 等于) (?:最大 | 最小)/,
      /在 (?:边界 | 极限 | 临界) 条件 (?:下 | 时)/
    ],
    whenPatterns: [
      /输入 (?:最大 | 最小 | 极限) 值/,
      /数据 (?:达到 | 超过) (?:上限 | 下限)/
    ],
    thenPatterns: [
      /系统 (?:应 | 应该) (?:正确处理 | 正常显示 | 不崩溃)/,
      /应 (?:该 | 当) (?:在范围内 | 符合预期)/
    ],
    priority: 'HIGH'
  },
  
  // 异常情况规则
  {
    id: 'sgr-error-1',
    name: '异常处理',
    type: 'error_case',
    triggerKeywords: ['异常', '错误', '失败', '无效', '超时', '异常'],
    givenPatterns: [
      /当 (?:发生 | 出现 | 遇到) (?:错误 | 异常 | 问题)/,
      /如果 (?:输入 | 数据 | 参数) 无效/,
      /在 (?:网络 | 系统 | 服务) (?:异常 | 故障 | 中断) 时/
    ],
    whenPatterns: [
      /用户 (?:输入 | 提交) (?:错误 | 无效 | 非法)/,
      /系统 (?:检测 | 发现) (?:错误 | 异常 | 失败)/
    ],
    thenPatterns: [
      /系统 (?:应 | 应该 | 必须) (?:提示 | 显示 | 返回) 错误/,
      /应 (?:该 | 当) (?:友好提示 | 记录日志 | 回滚)/,
      /不 (?:应 | 应该) (?:崩溃 | 死机 | 无响应)/
    ],
    priority: 'HIGH'
  }
]

/**
 * 常用前置条件模板
 */
const GIVEN_TEMPLATES: Record<string, string[]> = {
  'user_authenticated': [
    'Given 用户已登录系统',
    'Given 用户已通过身份验证',
    'Given 用户处于已登录状态'
  ],
  'user_registered': [
    'Given 用户已注册账号',
    'Given 用户拥有有效账号'
  ],
  'system_ready': [
    'Given 系统已初始化完成',
    'Given 系统处于就绪状态',
    'Given 系统正常运行'
  ],
  'data_exists': [
    'Given 存在相关数据',
    'Given 数据库中有记录',
    'Given 已有数据'
  ],
  'permission_granted': [
    'Given 用户拥有相应权限',
    'Given 用户被授权执行该操作'
  ]
}

/**
 * 常用操作模板
 */
const WHEN_TEMPLATES: Record<string, string[]> = {
  'user_action': [
    'When 用户执行{action}操作',
    'When 用户点击{action}按钮',
    'When 用户输入{input}并提交'
  ],
  'system_process': [
    'When 系统接收到请求',
    'When 系统处理数据',
    'When 系统执行{process}'
  ],
  'trigger_event': [
    'When 触发{event}事件',
    'When 到达指定时间',
    'When 满足特定条件'
  ]
}

/**
 * 常用预期结果模板
 */
const THEN_TEMPLATES: Record<string, string[]> = {
  'success_response': [
    'Then 系统返回成功响应',
    'Then 操作成功完成',
    'Then 显示成功提示'
  ],
  'data_created': [
    'Then 创建新数据记录',
    'Then 数据保存到数据库',
    'Then 生成新的记录'
  ],
  'data_updated': [
    'Then 更新现有数据',
    'Then 修改记录成功',
    'Then 数据状态变更'
  ],
  'data_deleted': [
    'Then 删除指定数据',
    'Then 记录被移除',
    'Then 数据不再显示'
  ],
  'error_response': [
    'Then 系统返回错误提示',
    'Then 显示友好的错误信息',
    'Then 记录错误日志'
  ],
  'validation_result': [
    'Then 验证输入数据',
    'Then 显示验证结果',
    'Then 提示验证失败原因'
  ]
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 提取需求中的动作
 */
function extractActions(requirement: string): string[] {
  const actionKeywords = [
    '创建', '删除', '修改', '查询', '搜索', '过滤', '排序',
    '导入', '导出', '上传', '下载', '分享', '收藏', '点赞',
    '登录', '注册', '登出', '验证', '授权', '审批', '审核',
    '通知', '提醒', '统计', '分析', '报告', '展示', '显示'
  ]
  
  const actions: string[] = []
  actionKeywords.forEach(keyword => {
    if (requirement.includes(keyword)) {
      actions.push(keyword)
    }
  })
  
  return actions.length > 0 ? actions : ['操作']
}

/**
 * 提取需求中的角色
 */
function extractRoles(requirement: string): string[] {
  const roleKeywords = [
    '用户', '管理员', '操作员', '审核员', '访客', '客户',
    '普通用户', 'VIP 用户', '超级管理员', '系统'
  ]
  
  const roles: string[] = []
  roleKeywords.forEach(keyword => {
    if (requirement.includes(keyword)) {
      roles.push(keyword)
    }
  })
  
  return roles.length > 0 ? roles : ['用户']
}

/**
 * 提取需求中的数据类型
 */
function extractDataTypes(requirement: string): string[] {
  const dataKeywords = [
    '数据', '信息', '记录', '文件', '文档', '图片', '视频',
    '音频', '消息', '订单', '商品', '账户', '配置', '设置'
  ]
  
  const dataTypes: string[] = []
  dataKeywords.forEach(keyword => {
    if (requirement.includes(keyword)) {
      dataTypes.push(keyword)
    }
  })
  
  return dataTypes.length > 0 ? dataTypes : ['数据']
}

/**
 * 检测需求类型
 */
function detectRequirementType(requirement: string): AcceptanceScenarioType[] {
  const types: AcceptanceScenarioType[] = ['happy_path']
  
  // 检测是否包含异常情况
  const errorKeywords = ['异常', '错误', '失败', '无效', '超时', '异常', '非法']
  if (errorKeywords.some(k => requirement.includes(k))) {
    types.push('error_case')
  }
  
  // 检测是否包含边界情况
  const edgeKeywords = ['边界', '极限', '最大', '最小', '临界', '上限', '下限']
  if (edgeKeywords.some(k => requirement.includes(k))) {
    types.push('edge_case')
  }
  
  // 检测是否包含备选流程
  const altKeywords = ['或者', '否则', '备选', '替代', '另外', '可选']
  if (altKeywords.some(k => requirement.includes(k))) {
    types.push('alternative')
  }
  
  return types
}

/**
 * 生成前置条件
 */
function generateGivens(
  requirement: string,
  scenarioType: AcceptanceScenarioType
): string[] {
  const roles = extractRoles(requirement)
  const primaryRole = roles[0]
  const givens: string[] = []
  
  // 根据场景类型生成前置条件
  switch (scenarioType) {
    case 'happy_path':
      givens.push(`Given ${primaryRole}已登录系统`)
      givens.push('Given 系统正常运行')
      break
    
    case 'alternative':
      givens.push(`Given ${primaryRole}已登录系统`)
      givens.push('Given 存在备选方案的条件')
      break
    
    case 'edge_case':
      givens.push(`Given ${primaryRole}已登录系统`)
      givens.push('Given 数据达到边界条件')
      break
    
    case 'error_case':
      givens.push(`Given ${primaryRole}已登录系统`)
      givens.push('Given 系统检测到异常情况')
      break
  }
  
  return givens
}

/**
 * 生成操作
 */
function generateWhens(
  requirement: string,
  scenarioType: AcceptanceScenarioType
): string[] {
  const actions = extractActions(requirement)
  const roles = extractRoles(requirement)
  const primaryRole = roles[0]
  const primaryAction = actions[0]
  const whens: string[] = []
  
  switch (scenarioType) {
    case 'happy_path':
      whens.push(`When ${primaryRole}执行${primaryAction}操作`)
      whens.push('When 系统接收到请求并处理')
      break
    
    case 'alternative':
      whens.push(`When ${primaryRole}选择备选方案`)
      whens.push('When 系统执行替代流程')
      break
    
    case 'edge_case':
      whens.push(`When ${primaryRole}输入边界值数据`)
      whens.push('When 系统处理极限条件')
      break
    
    case 'error_case':
      whens.push(`When ${primaryRole}执行${primaryAction}时发生错误`)
      whens.push('When 系统检测到异常')
      break
  }
  
  return whens
}

/**
 * 生成预期结果
 */
function generateThens(
  requirement: string,
  scenarioType: AcceptanceScenarioType
): string[] {
  const actions = extractActions(requirement)
  const dataTypes = extractDataTypes(requirement)
  const primaryAction = actions[0]
  const primaryData = dataTypes[0]
  const thens: string[] = []
  
  switch (scenarioType) {
    case 'happy_path':
      thens.push('Then 系统返回成功响应')
      thens.push(`Then ${primaryData}被正确${primaryAction}`)
      thens.push('Then 显示操作成功的提示')
      break
    
    case 'alternative':
      thens.push('Then 系统执行备选流程')
      thens.push('Then 达到与主流程相同的业务目标')
      thens.push('Then 记录使用的备选方案')
      break
    
    case 'edge_case':
      thens.push('Then 系统正确处理边界值')
      thens.push('Then 数据在允许范围内')
      thens.push('Then 不出现系统错误')
      break
    
    case 'error_case':
      thens.push('Then 系统返回友好的错误提示')
      thens.push('Then 记录错误日志')
      thens.push('Then 系统保持稳定不崩溃')
      thens.push('Then 提供错误解决建议')
      break
  }
  
  return thens
}

/**
 * 生成场景标题
 */
function generateScenarioTitle(
  scenarioType: AcceptanceScenarioType,
  requirement: string
): string {
  const actions = extractActions(requirement)
  const primaryAction = actions[0]
  
  const titleMap: Record<AcceptanceScenarioType, string> = {
    happy_path: `正常流程 - ${primaryAction}成功`,
    alternative: `备选流程 - 替代方案${primaryAction}`,
    edge_case: `边界情况 - ${primaryAction}边界值测试`,
    error_case: `异常情况 - ${primaryAction}错误处理`
  }
  
  return titleMap[scenarioType]
}

/**
 * 验收标准生成器类
 */
export class AcceptanceCriteriaGenerator {
  private generationRules: Map<string, ScenarioGenerationRule> = new Map()

  constructor() {
    SCENARIO_GENERATION_RULES.forEach(rule => {
      this.generationRules.set(rule.id, rule)
    })
  }

  /**
   * 获取所有生成规则
   */
  getGenerationRules(): ScenarioGenerationRule[] {
    return Array.from(this.generationRules.values())
  }

  /**
   * 为单个需求生成验收标准
   * 
   * @param requirementId - 需求 ID
   * @param requirementDescription - 需求描述
   * @returns 验收标准集合
   */
  generate(
    requirementId: string,
    requirementDescription: string
  ): AcceptanceCriteriaSet {
    const scenarioTypes = detectRequirementType(requirementDescription)
    const scenarios: AcceptanceScenario[] = []
    
    // 为每种场景类型生成验收标准
    for (const scenarioType of scenarioTypes) {
      const scenario = this.generateScenario(
        requirementId,
        requirementDescription,
        scenarioType
      )
      scenarios.push(scenario)
    }
    
    // 确保至少有一个场景
    if (scenarios.length === 0) {
      const defaultScenario = this.generateScenario(
        requirementId,
        requirementDescription,
        'happy_path'
      )
      scenarios.push(defaultScenario)
    }
    
    // 计算总数
    const totalCriteria = scenarios.reduce(
      (sum, s) => sum + s.givens.length + s.whens.length + s.thens.length,
      0
    )
    
    // 计算覆盖度评分
    const coverageScore = this.calculateCoverageScore(scenarios, requirementDescription)
    
    return {
      requirementId,
      requirementDescription,
      scenarios,
      totalScenarios: scenarios.length,
      totalCriteria,
      coverageScore,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * 为多个需求批量生成验收标准
   * 
   * @param requirements - 需求列表
   * @returns 验收标准集合列表
   */
  generateBatch(
    requirements: Array<{ id: string; description: string }>
  ): AcceptanceCriteriaSet[] {
    return requirements.map(req => this.generate(req.id, req.description))
  }

  /**
   * 生成单个场景
   */
  private generateScenario(
    requirementId: string,
    requirementDescription: string,
    scenarioType: AcceptanceScenarioType
  ): AcceptanceScenario {
    const givens = generateGivens(requirementDescription, scenarioType)
    const whens = generateWhens(requirementDescription, scenarioType)
    const thens = generateThens(requirementDescription, scenarioType)
    
    return {
      id: generateId(),
      title: generateScenarioTitle(scenarioType, requirementDescription),
      type: scenarioType,
      description: this.generateScenarioDescription(scenarioType, requirementDescription),
      givens,
      whens,
      thens,
      priority: this.determineScenarioPriority(scenarioType),
      dependencies: scenarioType === 'happy_path' ? [] : [requirementId],
      tags: this.generateTags(scenarioType, requirementDescription)
    }
  }

  /**
   * 生成场景描述
   */
  private generateScenarioDescription(
    scenarioType: AcceptanceScenarioType,
    requirement: string
  ): string {
    const descriptions: Record<AcceptanceScenarioType, string> = {
      happy_path: `验证${requirement.substring(0, 30)}的正常流程`,
      alternative: `验证${requirement.substring(0, 30)}的备选方案`,
      edge_case: `验证${requirement.substring(0, 30)}的边界情况`,
      error_case: `验证${requirement.substring(0, 30)}的异常处理`
    }
    return descriptions[scenarioType]
  }

  /**
   * 确定场景优先级
   */
  private determineScenarioPriority(
    scenarioType: AcceptanceScenarioType
  ): 'HIGH' | 'MEDIUM' | 'LOW' {
    const priorityMap: Record<AcceptanceScenarioType, 'HIGH' | 'MEDIUM' | 'LOW'> = {
      happy_path: 'HIGH',
      error_case: 'HIGH',
      edge_case: 'MEDIUM',
      alternative: 'MEDIUM'
    }
    return priorityMap[scenarioType]
  }

  /**
   * 生成场景标签
   */
  private generateTags(
    scenarioType: AcceptanceScenarioType,
    requirement: string
  ): string[] {
    const tags: string[] = [scenarioType]
    
    const roles = extractRoles(requirement)
    roles.forEach(role => tags.push(`role:${role}`))
    
    const actions = extractActions(requirement)
    actions.forEach(action => tags.push(`action:${action}`))
    
    return tags
  }

  /**
   * 计算覆盖度评分
   */
  private calculateCoverageScore(
    scenarios: AcceptanceScenario[],
    requirement: string
  ): number {
    let score = 0
    
    // 有主流程场景加分
    if (scenarios.some(s => s.type === 'happy_path')) {
      score += 40
    }
    
    // 有异常场景加分
    if (scenarios.some(s => s.type === 'error_case')) {
      score += 25
    }
    
    // 有边界场景加分
    if (scenarios.some(s => s.type === 'edge_case')) {
      score += 20
    }
    
    // 有备选流程加分
    if (scenarios.some(s => s.type === 'alternative')) {
      score += 15
    }
    
    // 每个场景的 GWT 完整性
    scenarios.forEach(scenario => {
      const completeness = (
        (scenario.givens.length > 0 ? 1 : 0) +
        (scenario.whens.length > 0 ? 1 : 0) +
        (scenario.thens.length > 0 ? 1 : 0)
      ) / 3
      score += completeness * 10 / scenarios.length
    })
    
    return Math.min(100, Math.round(score))
  }

  /**
   * 格式化验收标准为可读文本
   */
  formatScenario(scenario: AcceptanceScenario): string {
    const lines: string[] = []
    
    lines.push(`### ${scenario.title}`)
    lines.push(`**类型**: ${this.formatScenarioType(scenario.type)}`)
    lines.push(`**优先级**: ${scenario.priority}`)
    lines.push('')
    
    if (scenario.givens.length > 0) {
      lines.push('**前置条件**:')
      scenario.givens.forEach(g => lines.push(`- ${g}`))
      lines.push('')
    }
    
    if (scenario.whens.length > 0) {
      lines.push('**操作**:')
      scenario.whens.forEach(w => lines.push(`- ${w}`))
      lines.push('')
    }
    
    if (scenario.thens.length > 0) {
      lines.push('**预期结果**:')
      scenario.thens.forEach(t => lines.push(`- ${t}`))
      lines.push('')
    }
    
    return lines.join('\n')
  }

  /**
   * 格式化场景类型
   */
  private formatScenarioType(type: AcceptanceScenarioType): string {
    const typeMap: Record<AcceptanceScenarioType, string> = {
      happy_path: '主流程',
      alternative: '备选流程',
      edge_case: '边界情况',
      error_case: '异常情况'
    }
    return typeMap[type]
  }

  /**
   * 导出为 Gherkin 格式
   */
  exportToGherkin(scenario: AcceptanceScenario): string {
    const lines: string[] = []
    
    lines.push(`@${scenario.type}`)
    scenario.tags.forEach(tag => lines.push(`@${tag.replace(':', '-')}`))
    lines.push(`Scenario: ${scenario.title}`)
    
    scenario.givens.forEach(g => lines.push(`  ${g}`))
    scenario.whens.forEach(w => lines.push(`  ${w}`))
    scenario.thens.forEach(t => lines.push(`  ${t}`))
    
    return lines.join('\n')
  }
}

/**
 * 创建验收标准生成器实例
 */
export function createAcceptanceCriteriaGenerator(): AcceptanceCriteriaGenerator {
  return new AcceptanceCriteriaGenerator()
}

export default {
  AcceptanceCriteriaGenerator,
  createAcceptanceCriteriaGenerator,
  SCENARIO_GENERATION_RULES
}
