export interface TemplateModule {
  id: string
  name: string
  description: string
  features: string[]
  dependencies?: string[]
}

export interface ComplianceRequirement {
  id: string
  name: string
  description: string
  mandatory: boolean
  checkItems: string[]
}

export interface TypicalScenario {
  id: string
  name: string
  description: string
  userStories: string[]
  acceptanceCriteria: string[]
}

export interface IndustryTemplate {
  id: string
  name: string
  description: string
  modules: TemplateModule[]
  complianceRequirements: ComplianceRequirement[]
  typicalScenarios: TypicalScenario[]
  version: string
  lastUpdated: string
}

const ecommerceModules: TemplateModule[] = [
  {
    id: 'ec-product',
    name: '商品管理',
    description: '商品 SKU、库存、价格管理',
    features: [
      '商品 CRUD 操作',
      '多规格 SKU 管理',
      '库存预警',
      '价格策略（原价、促销价）',
      '商品分类与标签',
      '商品图片/视频管理'
    ]
  },
  {
    id: 'ec-order',
    name: '订单管理',
    description: '订单创建、状态流转、售后',
    features: [
      '购物车功能',
      '订单创建与确认',
      '订单状态机（待支付/已支付/发货/完成）',
      '订单取消与退款',
      '订单查询与导出',
      '批量订单处理'
    ]
  },
  {
    id: 'ec-payment',
    name: '支付管理',
    description: '多渠道支付集成',
    features: [
      '微信支付集成',
      '支付宝集成',
      '银行卡支付',
      '支付回调处理',
      '对账功能',
      '退款处理'
    ]
  },
  {
    id: 'ec-logistics',
    name: '物流管理',
    description: '物流配送跟踪',
    features: [
      '物流公司管理',
      '运费模板配置',
      '物流单号生成',
      '物流轨迹跟踪',
      '签收确认',
      '异常物流处理'
    ]
  }
]

const ecommerceTemplate: IndustryTemplate = {
  id: 'ecommerce',
  name: '电商行业模板',
  description: '适用于 B2C/B2B 电商平台，包含完整的商品、订单、支付、物流链路',
  modules: ecommerceModules,
  complianceRequirements: [
    {
      id: 'ec-compliance-1',
      name: '消费者权益保护',
      description: '符合电子商务法消费者权益条款',
      mandatory: true,
      checkItems: [
        '7 天无理由退货政策',
        '商品质量保障',
        '真实商品描述',
        '价格公示透明'
      ]
    },
    {
      id: 'ec-compliance-2',
      name: '数据安全',
      description: '用户数据与交易数据保护',
      mandatory: true,
      checkItems: [
        '用户信息加密存储',
        '支付数据 SSL 传输',
        '敏感信息脱敏展示',
        '数据备份机制'
      ]
    }
  ],
  typicalScenarios: [
    {
      id: 'ec-scenario-1',
      name: 'B2C 零售电商',
      description: '面向个人消费者的在线零售平台',
      userStories: [
        '作为用户，我可以浏览商品并加入购物车',
        '作为用户，我可以使用优惠券下单',
        '作为商家，我可以管理商品库存'
      ],
      acceptanceCriteria: [
        '商品详情页加载时间 < 2 秒',
        '订单创建成功率 > 99.9%',
        '支付成功率 > 98%'
      ]
    },
    {
      id: 'ec-scenario-2',
      name: '跨境电商',
      description: '涉及海关、税费的跨境贸易电商',
      userStories: [
        '作为用户，我可以查看关税预估',
        '作为运营，我可以管理保税仓库存',
        '作为系统，我可以自动申报海关'
      ],
      acceptanceCriteria: [
        '关税计算准确率 100%',
        '海关申报接口可用性 > 99%',
        '支持多币种结算'
      ]
    }
  ],
  version: '1.0.0',
  lastUpdated: '2026-03-17'
}

const financeModules: TemplateModule[] = [
  {
    id: 'fn-risk',
    name: '风控管理',
    description: '风险评估与控制体系',
    features: [
      '用户信用评分',
      '风险等级评估',
      '反欺诈检测',
      '黑名单管理',
      '风险预警',
      '风控规则引擎'
    ]
  },
  {
    id: 'fn-compliance',
    name: '合规管理',
    description: '金融监管合规要求',
    features: [
      'KYC 实名认证',
      '反洗钱 (AML) 检查',
      '大额交易报告',
      '合规审计日志',
      '监管报表生成',
      '牌照资质管理'
    ]
  },
  {
    id: 'fn-transaction',
    name: '交易管理',
    description: '金融交易处理核心',
    features: [
      '账户管理',
      '充值/提现',
      '转账汇款',
      '交易限额控制',
      '交易流水记录',
      '日终清算'
    ]
  },
  {
    id: 'fn-report',
    name: '报表管理',
    description: '财务与监管报表',
    features: [
      '资产负债表',
      '利润表',
      '现金流量表',
      '监管报送报表',
      '自定义报表',
      '数据可视化'
    ]
  }
]

const financeTemplate: IndustryTemplate = {
  id: 'finance',
  name: '金融行业模板',
  description: '适用于银行、证券、保险、互联网金融等持牌金融机构',
  modules: financeModules,
  complianceRequirements: [
    {
      id: 'fn-compliance-1',
      name: '金融监管合规',
      description: '符合银保监会、证监会监管要求',
      mandatory: true,
      checkItems: [
        '持牌经营资质',
        '资本充足率达标',
        '信息披露合规',
        '投资者适当性管理',
        '关联交易管控'
      ]
    },
    {
      id: 'fn-compliance-2',
      name: '数据安全与隐私',
      description: '金融数据安全管理规范',
      mandatory: true,
      checkItems: [
        '等保 2.0 三级认证',
        '数据加密存储（AES-256）',
        '传输加密（TLS 1.3+）',
        '敏感数据脱敏',
        '数据分级分类'
      ]
    },
    {
      id: 'fn-compliance-3',
      name: '反洗钱合规',
      description: '反洗钱法及相关规定',
      mandatory: true,
      checkItems: [
        '客户身份识别',
        '大额交易监测',
        '可疑交易报告',
        '客户风险等级划分',
        '交易记录保存 5 年以上'
      ]
    }
  ],
  typicalScenarios: [
    {
      id: 'fn-scenario-1',
      name: '网络借贷',
      description: 'P2P 网贷平台业务场景',
      userStories: [
        '作为投资人，我可以查看项目风险信息',
        '作为借款人，我可以提交借款申请',
        '作为风控，我可以审核借款人资质'
      ],
      acceptanceCriteria: [
        '风控审核通过率 < 30%',
        '逾期率 < 3%',
        '资金存管合规率 100%'
      ]
    },
    {
      id: 'fn-scenario-2',
      name: '互联网支付',
      description: '第三方支付平台场景',
      userStories: [
        '作为用户，我可以绑定银行卡',
        '作为商户，我可以接入支付接口',
        '作为运营，我可以监控交易风险'
      ],
      acceptanceCriteria: [
        '支付成功率 > 99%',
        '交易延迟 < 500ms',
        '风控拦截准确率 > 95%'
      ]
    }
  ],
  version: '1.0.0',
  lastUpdated: '2026-03-17'
}

const saasModules: TemplateModule[] = [
  {
    id: 'saas-subscription',
    name: '订阅管理',
    description: 'SaaS 订阅计费体系',
    features: [
      '套餐配置（免费版/专业版/企业版）',
      '订阅周期管理（月/年）',
      '自动续费',
      '升级/降级',
      '试用管理',
      '账单生成'
    ]
  },
  {
    id: 'saas-tenant',
    name: '多租户管理',
    description: 'SaaS 多租户隔离架构',
    features: [
      '租户创建与配置',
      '数据隔离（Schema/Row 级别）',
      '租户自定义域名',
      '租户配额管理',
      '租户状态监控',
      '跨租户数据同步'
    ]
  },
  {
    id: 'saas-permission',
    name: '权限管理',
    description: 'RBAC 权限控制体系',
    features: [
      '角色定义',
      '权限分配',
      '菜单权限',
      '数据权限',
      '操作审计日志',
      'SSO 单点登录'
    ]
  },
  {
    id: 'saas-api',
    name: 'API 开放平台',
    description: 'OpenAPI 与集成能力',
    features: [
      'API 密钥管理',
      'API 限流',
      'Webhook 回调',
      'API 文档生成',
      'SDK 生成',
      '第三方应用授权（OAuth2）'
    ]
  }
]

const saasTemplate: IndustryTemplate = {
  id: 'saas',
  name: 'SaaS 行业模板',
  description: '适用于 B2B SaaS 服务提供商，支持多租户、订阅制、开放 API',
  modules: saasModules,
  complianceRequirements: [
    {
      id: 'saas-compliance-1',
      name: '数据保护',
      description: '客户数据保护与隐私合规',
      mandatory: true,
      checkItems: [
        'GDPR 合规（面向欧盟用户）',
        '数据可携带权支持',
        '被遗忘权支持',
        '数据处理协议（DPA）',
        '数据泄露通知机制'
      ]
    },
    {
      id: 'saas-compliance-2',
      name: '服务等级协议',
      description: 'SLA 服务可用性承诺',
      mandatory: true,
      checkItems: [
        '可用性 >= 99.9%',
        '数据持久性 >= 99.999999999%',
        'RTO（恢复时间目标）< 4 小时',
        'RPO（恢复点目标）< 1 小时',
        '性能指标承诺'
      ]
    },
    {
      id: 'saas-compliance-3',
      name: '安全认证',
      description: '行业安全认证要求',
      mandatory: false,
      checkItems: [
        'SOC 2 Type II 认证',
        'ISO 27001 认证',
        'CSA STAR 认证',
        '渗透测试报告',
        '漏洞扫描报告'
      ]
    }
  ],
  typicalScenarios: [
    {
      id: 'saas-scenario-1',
      name: '企业协作 SaaS',
      description: '如项目管理、文档协作、团队沟通工具',
      userStories: [
        '作为管理员，我可以邀请团队成员',
        '作为成员，我可以创建项目空间',
        '作为管理员，我可以设置成员权限'
      ],
      acceptanceCriteria: [
        '支持 1000+ 并发用户',
        '实时协作延迟 < 100ms',
        '文件上传大小 >= 1GB'
      ]
    },
    {
      id: 'saas-scenario-2',
      name: 'CRM SaaS',
      description: '客户关系管理系统',
      userStories: [
        '作为销售，我可以管理客户线索',
        '作为经理，我可以查看销售漏斗',
        '作为系统，我可以自动分配线索'
      ],
      acceptanceCriteria: [
        '支持 10 万 + 客户数据',
        '报表生成时间 < 10 秒',
        'API 调用限流 1000 次/分钟'
      ]
    }
  ],
  version: '1.0.0',
  lastUpdated: '2026-03-17'
}

const hardwareModules: TemplateModule[] = [
  {
    id: 'hw-embedded',
    name: '嵌入式系统',
    description: '嵌入式软件开发框架',
    features: [
      'RTOS 集成（FreeRTOS/RT-Thread）',
      '驱动开发框架',
      '低功耗管理',
      '看门狗机制',
      'OTA 升级',
      '日志系统'
    ]
  },
  {
    id: 'hw-iot',
    name: '物联网平台',
    description: 'IoT 设备连接与管理',
    features: [
      '设备接入（MQTT/CoAP）',
      '设备影子',
      '远程配置',
      '设备分组管理',
      '消息路由',
      '边缘计算'
    ]
  },
  {
    id: 'hw-firmware',
    name: '固件管理',
    description: '固件开发与发布',
    features: [
      '版本管理',
      '差分升级',
      '签名验证',
      '回滚机制',
      '灰度发布',
      '升级进度跟踪'
    ]
  },
  {
    id: 'hw-telemetry',
    name: '遥测监控',
    description: '设备状态监控与数据采集',
    features: [
      '传感器数据采集',
      '实时监控面板',
      '异常告警',
      '历史数据存储',
      '数据分析',
      '预测性维护'
    ]
  }
]

const hardwareTemplate: IndustryTemplate = {
  id: 'hardware',
  name: '硬件行业模板',
  description: '适用于智能硬件、物联网设备、嵌入式系统开发',
  modules: hardwareModules,
  complianceRequirements: [
    {
      id: 'hw-compliance-1',
      name: '产品认证',
      description: '硬件产品市场准入认证',
      mandatory: true,
      checkItems: [
        'CE 认证（欧洲）',
        'FCC 认证（美国）',
        '3C 认证（中国）',
        'RoHS 环保指令',
        'REACH 法规'
      ]
    },
    {
      id: 'hw-compliance-2',
      name: '网络安全',
      description: 'IoT 设备网络安全要求',
      mandatory: true,
      checkItems: [
        '设备唯一标识',
        '安全启动（Secure Boot）',
        '固件签名验证',
        '通信加密（TLS/DTLS）',
        '漏洞响应机制'
      ]
    },
    {
      id: 'hw-compliance-3',
      name: '数据隐私',
      description: '智能设备数据收集合规',
      mandatory: true,
      checkItems: [
        '最小化数据收集原则',
        '用户知情同意',
        '本地数据处理优先',
        '匿名化处理',
        '数据删除机制'
      ]
    }
  ],
  typicalScenarios: [
    {
      id: 'hw-scenario-1',
      name: '智能家居',
      description: '智能家电、安防、照明等设备',
      userStories: [
        '作为用户，我可以远程控制家中设备',
        '作为设备，我可以自动上报状态',
        '作为系统，我可以执行场景联动'
      ],
      acceptanceCriteria: [
        '设备响应延迟 < 200ms',
        '离线可用功能',
        '支持 100+ 设备并发连接'
      ]
    },
    {
      id: 'hw-scenario-2',
      name: '工业物联网',
      description: '工业设备监控与预测性维护',
      userStories: [
        '作为工程师，我可以监控设备运行状态',
        '作为系统，我可以预测设备故障',
        '作为管理员，我可以接收告警通知'
      ],
      acceptanceCriteria: [
        '数据采集频率 >= 100Hz',
        '故障预测准确率 > 90%',
        '7x24 小时不间断运行'
      ]
    }
  ],
  version: '1.0.0',
  lastUpdated: '2026-03-17'
}

export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  ecommerce: ecommerceTemplate,
  finance: financeTemplate,
  saas: saasTemplate,
  hardware: hardwareTemplate
}

export function getTemplate(industryId: string): IndustryTemplate | undefined {
  return INDUSTRY_TEMPLATES[industryId]
}

export function listTemplates(): IndustryTemplate[] {
  return Object.values(INDUSTRY_TEMPLATES)
}

export function getTemplateModules(industryId: string): TemplateModule[] {
  const template = INDUSTRY_TEMPLATES[industryId]
  return template ? template.modules : []
}

export function searchTemplates(keyword: string): IndustryTemplate[] {
  const lowerKeyword = keyword.toLowerCase()
  return Object.values(INDUSTRY_TEMPLATES).filter(
    template =>
      template.name.toLowerCase().includes(lowerKeyword) ||
      template.description.toLowerCase().includes(lowerKeyword) ||
      template.modules.some(m =>
        m.name.toLowerCase().includes(lowerKeyword) ||
        m.description.toLowerCase().includes(lowerKeyword)
      )
  )
}

export default {
  INDUSTRY_TEMPLATES,
  getTemplate,
  listTemplates,
  getTemplateModules,
  searchTemplates
}
