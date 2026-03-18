export type AntiPatternCategory =
  | 'requirements'
  | 'architecture'
  | 'coding'
  | 'testing'
  | 'deployment'
  | 'team'
  | 'product'

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface AntiPattern {
  id: string
  name: string
  description: string
  category: AntiPatternCategory
  severity: SeverityLevel
  symptoms: string[]
  causes: string[]
  consequences: string[]
  detection: DetectionMethod[]
  solutions: Solution[]
  relatedPatterns?: string[]
  examples: Example[]
  tags: string[]
  version: string
  lastUpdated: string
}

export interface DetectionMethod {
  type: 'code_review' | 'metric' | 'behavior' | 'artifact'
  description: string
  indicators: string[]
}

export interface Solution {
  title: string
  description: string
  steps: string[]
  effort: 'LOW' | 'MEDIUM' | 'HIGH'
  priority: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM'
}

export interface Example {
  title: string
  context: string
  badCode?: string
  goodCode?: string
  lesson: string
}

const requirementsAntiPatterns: AntiPattern[] = [
  {
    id: 'ap-req-001',
    name: '需求蔓延 (Scope Creep)',
    description: '项目进行中不断添加新需求，导致范围失控、延期和超预算',
    category: 'requirements',
    severity: 'CRITICAL',
    symptoms: [
      '需求文档频繁变更',
      '迭代中不断插入新故事',
      '项目结束日期不断推迟',
      '团队持续加班但进度滞后',
      '干系人期望不一致'
    ],
    causes: [
      '初期需求调研不充分',
      '缺乏变更控制流程',
      '干系人参与不足',
      '产品负责人无法说"不"',
      '市场竞争压力导致盲目跟风'
    ],
    consequences: [
      '项目延期交付',
      '预算超支',
      '团队士气低落',
      '产品质量下降',
      '技术债务累积'
    ],
    detection: [
      {
        type: 'metric',
        description: '通过项目指标检测需求蔓延',
        indicators: [
          '需求变更率 > 20%/迭代',
          '计划完成率 < 70%',
          '迭代周期不断延长'
        ]
      },
      {
        type: 'behavior',
        description: '观察团队行为模式',
        indicators: [
          '团队抱怨需求变化太快',
          '开发中途频繁切换任务',
          '测试时间被压缩'
        ]
      }
    ],
    solutions: [
      {
        title: '建立变更控制委员会 (CCB)',
        description: '所有需求变更必须经过正式审批流程',
        steps: [
          '定义变更请求流程',
          '成立 CCB（产品、技术、业务代表）',
          '评估变更影响（范围、时间、成本）',
          '优先级排序，必要时置换需求',
          '记录所有变更决策'
        ],
        effort: 'MEDIUM',
        priority: 'IMMEDIATE'
      },
      {
        title: '实施迭代锁定',
        description: '迭代开始后不允许添加新需求',
        steps: [
          '迭代计划会后锁定 backlog',
          '新需求放入下一个迭代',
          '紧急需求需 PO 和团队共识',
          '记录紧急插入的原因和影响'
        ],
        effort: 'LOW',
        priority: 'IMMEDIATE'
      },
      {
        title: '强化需求评审',
        description: '确保需求在进入开发前充分明确',
        steps: [
          '定义 DoR（就绪定义）',
          '需求必须包含验收标准',
          '三方评审（产品、开发、测试）',
          '使用原型/线框图辅助理解'
        ],
        effort: 'LOW',
        priority: 'SHORT_TERM'
      }
    ],
    examples: [
      {
        title: '电商项目功能膨胀',
        context: '某电商项目初期规划 10 个核心功能，开发过程中陆续添加直播、社交、游戏等功能',
        lesson: '没有严格的需求边界控制，导致项目延期 6 个月，预算超支 200%'
      }
    ],
    relatedPatterns: ['ap-prod-001', 'ap-team-001'],
    tags: ['需求管理', '范围控制', '项目管理'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  },
  {
    id: 'ap-req-002',
    name: '镀金 (Gold Plating)',
    description: '开发人员添加超出需求范围的功能或过度优化，造成资源浪费',
    category: 'requirements',
    severity: 'HIGH',
    symptoms: [
      '功能超出原始需求描述',
      '代码复杂度高于必要水平',
      '开发时间超出估算',
      '用户并不使用新增功能',
      '技术完美但业务价值低'
    ],
    causes: [
      '技术人员追求完美主义',
      '对需求理解不清晰',
      '缺乏明确的验收标准',
      '担心未来需求变更',
      '个人技术炫耀心理'
    ],
    consequences: [
      '浪费开发资源',
      '增加维护成本',
      '延迟交付时间',
      '引入额外 bug',
      '偏离业务目标'
    ],
    detection: [
      {
        type: 'code_review',
        description: '代码审查时识别镀金行为',
        indicators: [
          '实现了需求文档没有的功能',
          '过度设计的架构',
          '过度优化的性能代码'
        ]
      },
      {
        type: 'artifact',
        description: '对比需求和实现',
        indicators: [
          '功能清单超出 backlog 范围',
          '用户故事包含未约定的细节',
          'UI 设计过度复杂'
        ]
      }
    ],
    solutions: [
      {
        title: '明确验收标准',
        description: '每个用户故事必须有清晰的验收条件',
        steps: [
          '使用 Given-When-Then 格式',
          'PO 确认验收标准',
          '测试基于验收标准编写用例',
          '验收通过即停止开发'
        ],
        effort: 'LOW',
        priority: 'IMMEDIATE'
      },
      {
        title: '实施 YAGNI 原则',
        description: 'You Aren\'t Gonna Need It - 不做未来可能需要的功能',
        steps: [
          '团队培训 YAGNI 理念',
          '代码审查时挑战过度设计',
          '质疑每个功能的必要性',
          '优先简单方案'
        ],
        effort: 'LOW',
        priority: 'SHORT_TERM'
      }
    ],
    examples: [
      {
        title: '过度设计的日志系统',
        context: '需求只需记录操作日志，开发人员实现了支持 10 种输出目标、自定义格式、实时过滤的通用日志框架',
        badCode: '// 实现了复杂的日志抽象层、策略模式、插件系统...',
        lesson: '简单需求简单实现，避免过度抽象和通用化'
      }
    ],
    tags: ['镀金', '过度设计', '需求范围'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  }
]

const architectureAntiPatterns: AntiPattern[] = [
  {
    id: 'ap-arch-001',
    name: '大泥球 (Big Ball of Mud)',
    description: '系统缺乏清晰架构，代码随意耦合，难以理解和维护',
    category: 'architecture',
    severity: 'CRITICAL',
    symptoms: [
      '没有清晰的模块边界',
      '循环依赖普遍存在',
      '全局变量和单例滥用',
      '复制粘贴代码泛滥',
      '新人无法理解系统',
      '修改一处影响多处'
    ],
    causes: [
      '缺乏架构设计阶段',
      '快速迭代忽视质量',
      '人员流动导致知识断层',
      '缺乏代码审查',
      '技术债务长期未偿还'
    ],
    consequences: [
      '维护成本极高',
      '新功能开发缓慢',
      'bug 频发且难以定位',
      '团队士气低落',
      '系统难以扩展'
    ],
    detection: [
      {
        type: 'code_review',
        description: '代码结构分析',
        indicators: [
          '单文件超过 1000 行',
          '函数超过 100 行',
          '循环依赖检测工具报警'
        ]
      },
      {
        type: 'metric',
        description: '架构指标检测',
        indicators: [
          '耦合度 > 阈值',
          '内聚度 < 阈值',
          '重复代码率 > 10%'
        ]
      }
    ],
    solutions: [
      {
        title: '重构计划',
        description: '制定渐进式重构计划',
        steps: [
          '进行架构审计，绘制依赖图',
          '识别核心问题区域',
          '制定分阶段重构计划',
          '每阶段设定可衡量目标',
          '持续集成保证不回归'
        ],
        effort: 'HIGH',
        priority: 'LONG_TERM'
      },
      {
        title: '引入架构原则',
        description: '建立并执行架构规范',
        steps: [
          '定义分层架构（如 Clean Architecture）',
          '制定依赖规则（内层不依赖外层）',
          '实施架构守护（ArchUnit 等）',
          '定期架构审查'
        ],
        effort: 'MEDIUM',
        priority: 'SHORT_TERM'
      }
    ],
    examples: [
      {
        title: '5 年老系统重构',
        context: '某系统 5 年累积 50 万行代码，无清晰架构，重构耗时 1 年才完成模块化',
        lesson: '架构治理要趁早，避免债务累积到不可收拾'
      }
    ],
    tags: ['架构', '技术债务', '重构'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  },
  {
    id: 'ap-arch-002',
    name: '过度设计 (Over-Engineering)',
    description: '为不存在的未来需求设计复杂架构，造成资源浪费',
    category: 'architecture',
    severity: 'HIGH',
    symptoms: [
      '抽象层次过多',
      '设计模式滥用',
      '配置极其复杂',
      '文档比代码多',
      '简单需求复杂实现'
    ],
    causes: [
      '设计师简历驱动开发',
      '过度担心未来变化',
      '缺乏 YAGNI 意识',
      '模仿大厂架构但规模不匹配'
    ],
    consequences: [
      '开发效率低下',
      '学习曲线陡峭',
      '维护成本高',
      '灵活性反而降低'
    ],
    detection: [
      {
        type: 'code_review',
        description: '识别过度抽象',
        indicators: [
          '为单一实现创建接口',
          '超过 3 层的继承体系',
          '不必要的泛型嵌套'
        ]
      }
    ],
    solutions: [
      {
        title: '遵循 KISS 原则',
        description: 'Keep It Simple, Stupid - 保持简单',
        steps: [
          '质疑每个抽象的必要性',
          '优先选择简单方案',
          '重构时消除不必要的复杂',
          '代码审查时挑战复杂度'
        ],
        effort: 'LOW',
        priority: 'IMMEDIATE'
      }
    ],
    examples: [
      {
        title: '微服务过早拆分',
        context: '日活 1000 的应用拆分成 20 个微服务，运维成本激增',
        lesson: '单体优先，有明确需求时再拆分'
      }
    ],
    tags: ['过度设计', '架构', 'KISS'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  }
]

const codingAntiPatterns: AntiPattern[] = [
  {
    id: 'ap-code-001',
    name: '魔法数字 (Magic Numbers)',
    description: '代码中直接使用未解释的数字常量，降低可读性和可维护性',
    category: 'coding',
    severity: 'MEDIUM',
    symptoms: [
      '代码中出现无意义的数字',
      '相同数字在多处重复',
      '修改数字需要查找所有位置',
      '新人不理解数字含义'
    ],
    causes: [
      '赶工期忽视质量',
      '缺乏编码规范意识',
      '认为常量定义麻烦'
    ],
    consequences: [
      '代码难以理解',
      '修改容易出错',
      '维护成本高'
    ],
    detection: [
      {
        type: 'code_review',
        description: '代码审查识别魔法数字',
        indicators: [
          '非 0、1、2 的字面数字',
          '重复出现的相同数字',
          '没有注释说明的数字'
        ]
      }
    ],
    solutions: [
      {
        title: '定义命名常量',
        description: '为所有魔法数字赋予有意义的名称',
        steps: [
          '识别代码中的魔法数字',
          '提取为常量或枚举',
          '使用描述性名称',
          '集中管理相关常量'
        ],
        effort: 'LOW',
        priority: 'IMMEDIATE'
      }
    ],
    examples: [
      {
        title: '超时时间魔法数字',
        context: '代码中多处出现 3000、5000 等数字表示超时毫秒数',
        badCode: 'setTimeout(handle, 3000)',
        goodCode: 'const DEFAULT_TIMEOUT = 3000\nsetTimeout(handle, DEFAULT_TIMEOUT)',
        lesson: '常量命名让代码自解释'
      }
    ],
    tags: ['代码质量', '常量', '可维护性'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  },
  {
    id: 'ap-code-002',
    name: '上帝类 (God Class)',
    description: '单个类承担过多职责，包含大量方法和属性',
    category: 'coding',
    severity: 'HIGH',
    symptoms: [
      '类文件超过 1000 行',
      '方法数量超过 20 个',
      '类名包含 Manager、Helper、Util',
      '修改类影响多个功能'
    ],
    causes: [
      '违反单一职责原则',
      '方便主义设计',
      '缺乏重构意识'
    ],
    consequences: [
      '难以理解和测试',
      '合并冲突频繁',
      '复用性差'
    ],
    detection: [
      {
        type: 'metric',
        description: '通过代码度量检测',
        indicators: [
          '行数 > 500',
          '方法数 > 15',
          '耦合度 > 10'
        ]
      }
    ],
    solutions: [
      {
        title: '应用单一职责原则',
        description: '将上帝类拆分为多个小类',
        steps: [
          '识别类的不同职责',
          '为每职责创建新类',
          '逐步迁移方法',
          '更新依赖引用'
        ],
        effort: 'MEDIUM',
        priority: 'SHORT_TERM'
      }
    ],
    examples: [
      {
        title: 'UserService 上帝类',
        context: 'UserService 类包含 2000 行代码，负责用户 CRUD、邮件、短信、报表、权限等',
        lesson: '按职责拆分为 UserRepository、EmailService、SmsService、ReportService 等'
      }
    ],
    tags: ['SOLID', '单一职责', '重构'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  }
]

const testingAntiPatterns: AntiPattern[] = [
  {
    id: 'ap-test-001',
    name: '测试过度依赖 Mock',
    description: '单元测试中过度使用 Mock，导致测试与实现强耦合',
    category: 'testing',
    severity: 'MEDIUM',
    symptoms: [
      '每个测试都有大量 Mock 设置',
      'Mock 设置代码比测试逻辑多',
      '重构时测试大量失败',
      '测试通过但集成失败'
    ],
    causes: [
      '测试实现细节而非行为',
      '不了解 Mock 适用场景',
      '追求 100% 覆盖率'
    ],
    consequences: [
      '测试维护成本高',
      '测试失去信心',
      '无法保证系统行为'
    ],
    detection: [
      {
        type: 'code_review',
        description: '审查测试代码',
        indicators: [
          'Mock 设置超过 10 行',
          'Mock 内部方法而非边界',
          '测试名称包含方法名'
        ]
      }
    ],
    solutions: [
      {
        title: '测试行为而非实现',
        description: '关注输入输出，减少 Mock 使用',
        steps: [
          '优先使用真实对象',
          '只在边界 Mock（IO、网络、时间）',
          '使用集成测试补充',
          '重构测试如同重构代码'
        ],
        effort: 'MEDIUM',
        priority: 'SHORT_TERM'
      }
    ],
    examples: [
      {
        title: 'Mock 所有依赖',
        context: '测试一个方法 Mock 了 8 个依赖，设置代码 100 行，实际测试 5 行',
        lesson: '如果 Mock 太多，说明被测对象职责过多，需要重构'
      }
    ],
    tags: ['测试', 'Mock', '单元测试'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  }
]

const deploymentAntiPatterns: AntiPattern[] = [
  {
    id: 'ap-deploy-001',
    name: '手动部署 (Manual Deployment)',
    description: '依赖人工步骤进行部署，容易出错且效率低下',
    category: 'deployment',
    severity: 'HIGH',
    symptoms: [
      '部署文档超过 10 页',
      '部署需要特定人员',
      '部署经常出错',
      '部署耗时超过 1 小时',
      '回滚困难'
    ],
    causes: [
      '忽视自动化投资',
      '环境差异大',
      '缺乏 CI/CD 实践'
    ],
    consequences: [
      '部署风险高',
      '发布频率低',
      '恢复时间长',
      '人员依赖风险'
    ],
    detection: [
      {
        type: 'behavior',
        description: '观察部署过程',
        indicators: [
          '部署检查清单超过 20 项',
          '需要多人协作部署',
          '部署后需要手动验证'
        ]
      }
    ],
    solutions: [
      {
        title: '自动化部署流水线',
        description: '建设 CI/CD 实现一键部署',
        steps: [
          '版本控制所有配置',
          '编写部署脚本',
          '搭建 CI/CD 平台',
          '实施自动化测试',
          '支持一键回滚'
        ],
        effort: 'HIGH',
        priority: 'LONG_TERM'
      }
    ],
    examples: [
      {
        title: '周末部署噩梦',
        context: '手动部署需要 6 小时，经常出问题，只能周末低峰期部署',
        lesson: '自动化部署让发布变得平凡可靠'
      }
    ],
    tags: ['部署', 'CI/CD', '自动化'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  }
]

const teamAntiPatterns: AntiPattern[] = [
  {
    id: 'ap-team-001',
    name: '巴士系数过低 (Low Bus Factor)',
    description: '关键知识集中在少数人手中，人员流失风险高',
    category: 'team',
    severity: 'HIGH',
    symptoms: [
      '只有某人懂某模块',
      '关键人员请假项目停滞',
      '代码审查只有特定人能做',
      '新人上手极慢'
    ],
    causes: [
      '缺乏知识分享',
      '专人专模块',
      '文档缺失',
      '代码可读性差'
    ],
    consequences: [
      '人员流失风险高',
      '成为瓶颈',
      '团队扩展困难'
    ],
    detection: [
      {
        type: 'behavior',
        description: '评估知识分布',
        indicators: [
          '问谁能修改某模块',
          '检查代码提交者分布',
          '评估文档完整性'
        ]
      }
    ],
    solutions: [
      {
        title: '知识共享计划',
        description: '建立机制促进知识传播',
        steps: [
          '实施结对编程',
          '定期技术分享',
          '强制代码审查轮换',
          '编写维护文档',
          '模块负责人轮岗'
        ],
        effort: 'MEDIUM',
        priority: 'SHORT_TERM'
      }
    ],
    examples: [
      {
        title: '核心开发离职',
        context: '唯一懂核心算法的工程师离职，项目停滞 3 个月',
        lesson: '巴士系数至少为 2，关键知识必须共享'
      }
    ],
    tags: ['团队', '知识管理', '风险'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  }
]

const productAntiPatterns: AntiPattern[] = [
  {
    id: 'ap-prod-001',
    name: '功能堆砌 (Feature Bloat)',
    description: '不断添加功能而非优化核心体验，导致产品复杂难用',
    category: 'product',
    severity: 'HIGH',
    symptoms: [
      '功能菜单超过 3 层',
      '用户找不到常用功能',
      '80% 用户只用 20% 功能',
      '性能随功能增加变慢'
    ],
    causes: [
      '竞品有什么就加什么',
      '无法对需求说不',
      '以功能数量衡量进展'
    ],
    consequences: [
      '用户体验下降',
      '维护成本增加',
      '核心价值模糊'
    ],
    detection: [
      {
        type: 'metric',
        description: '分析功能使用情况',
        indicators: [
          '功能使用率 < 10%',
          '用户完成任务时间增长',
          '用户投诉复杂度'
        ]
      }
    ],
    solutions: [
      {
        title: '做减法',
        description: '聚焦核心价值，移除冗余功能',
        steps: [
          '分析功能使用数据',
          '识别核心功能（80% 用户使用）',
          '逐步废弃低使用率功能',
          '新功能必须置换旧功能'
        ],
        effort: 'MEDIUM',
        priority: 'LONG_TERM'
      }
    ],
    examples: [
      {
        title: 'IM 应用变成操作系统',
        context: '聊天应用添加游戏、购物、理财等功能，用户抱怨找不到聊天入口',
        lesson: '少即是多，专注核心价值'
      }
    ],
    tags: ['产品', '用户体验', '功能管理'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  }
]

export const ANTI_PATTERNS: AntiPattern[] = [
  ...requirementsAntiPatterns,
  ...architectureAntiPatterns,
  ...codingAntiPatterns,
  ...testingAntiPatterns,
  ...deploymentAntiPatterns,
  ...teamAntiPatterns,
  ...productAntiPatterns
]

export const ANTI_PATTERN_CATEGORIES: Record<AntiPatternCategory, string> = {
  requirements: '需求管理',
  architecture: '架构设计',
  coding: '编码实践',
  testing: '测试策略',
  deployment: '部署运维',
  team: '团队协作',
  product: '产品设计'
}

export function getAntiPattern(patternId: string): AntiPattern | undefined {
  return ANTI_PATTERNS.find(p => p.id === patternId)
}

export function getPatternsByCategory(category: AntiPatternCategory): AntiPattern[] {
  return ANTI_PATTERNS.filter(p => p.category === category)
}

export function getPatternsBySeverity(severity: SeverityLevel): AntiPattern[] {
  return ANTI_PATTERNS.filter(p => p.severity === severity)
}

export function searchPatterns(keyword: string): AntiPattern[] {
  const lowerKeyword = keyword.toLowerCase()
  return ANTI_PATTERNS.filter(
    p =>
      p.name.toLowerCase().includes(lowerKeyword) ||
      p.description.toLowerCase().includes(lowerKeyword) ||
      p.symptoms.some(s => s.toLowerCase().includes(lowerKeyword)) ||
      p.tags.some(t => t.toLowerCase().includes(lowerKeyword))
  )
}

export function detectPatterns(symptoms: string[]): AntiPattern[] {
  const lowerSymptoms = symptoms.map(s => s.toLowerCase())
  
  return ANTI_PATTERNS.filter(pattern => {
    const matchCount = pattern.symptoms.filter(s =>
      lowerSymptoms.some(ls => ls.includes(s.toLowerCase()) || s.toLowerCase().includes(ls))
    ).length
    
    return matchCount >= 2
  })
}

export class AntiPatternDetector {
  private detectedPatterns: Map<string, { pattern: AntiPattern; detectedAt: string }> = new Map()

  getPattern = getAntiPattern
  getPatternsByCategory = getPatternsByCategory
  getPatternsBySeverity = getPatternsBySeverity
  searchPatterns = searchPatterns

  detect(symptoms: string[]): AntiPattern[] {
    return detectPatterns(symptoms)
  }

  reportPattern(patternId: string, context?: string): void {
    const pattern = getAntiPattern(patternId)
    if (pattern) {
      this.detectedPatterns.set(patternId, {
        pattern,
        detectedAt: new Date().toISOString()
      })
    }
  }

  getDetectedPatterns(): Array<{ pattern: AntiPattern; detectedAt: string }> {
    return Array.from(this.detectedPatterns.values())
  }

  generateReport(): {
    totalDetected: number
    byCategory: Record<AntiPatternCategory, number>
    bySeverity: Record<SeverityLevel, number>
    patterns: Array<{ pattern: AntiPattern; detectedAt: string }>
  } {
    const patterns = this.getDetectedPatterns()
    
    const byCategory: Record<AntiPatternCategory, number> = {
      requirements: 0,
      architecture: 0,
      coding: 0,
      testing: 0,
      deployment: 0,
      team: 0,
      product: 0
    }
    
    const bySeverity: Record<SeverityLevel, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0
    }
    
    patterns.forEach(({ pattern }) => {
      byCategory[pattern.category]++
      bySeverity[pattern.severity]++
    })
    
    return {
      totalDetected: patterns.length,
      byCategory,
      bySeverity,
      patterns
    }
  }

  getRecommendations(): Array<{
    pattern: AntiPattern
    solution: Solution
    priority: number
  }> {
    const recommendations: Array<{
      pattern: AntiPattern
      solution: Solution
      priority: number
    }> = []
    
    const priorityMap: Record<Solution['priority'], number> = {
      IMMEDIATE: 1,
      SHORT_TERM: 2,
      LONG_TERM: 3
    }
    
    this.getDetectedPatterns().forEach(({ pattern }) => {
      pattern.solutions.forEach(solution => {
        recommendations.push({
          pattern,
          solution,
          priority: priorityMap[solution.priority]
        })
      })
    })
    
    return recommendations.sort((a, b) => a.priority - b.priority)
  }

  clear(): void {
    this.detectedPatterns.clear()
  }
}

export function createAntiPatternDetector(): AntiPatternDetector {
  return new AntiPatternDetector()
}

export default {
  ANTI_PATTERNS,
  ANTI_PATTERN_CATEGORIES,
  AntiPatternDetector,
  createAntiPatternDetector,
  getAntiPattern,
  getPatternsByCategory,
  getPatternsBySeverity,
  searchPatterns,
  detectPatterns
}
