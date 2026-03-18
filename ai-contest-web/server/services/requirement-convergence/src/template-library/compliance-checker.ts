export type ComplianceStandard = 'GDPR' | 'MLPS' | 'FINANCE' | 'HEALTHCARE' | 'ISO27001'

export type CheckResult = 'PASS' | 'FAIL' | 'PARTIAL' | 'NOT_APPLICABLE'

export interface CheckItem {
  id: string
  name: string
  description: string
  standard: ComplianceStandard
  category: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  requirement: string
  evidence?: string[]
}

export interface CheckResultDetail {
  itemId: string
  itemName: string
  result: CheckResult
  score: number
  findings: string[]
  recommendations: string[]
  evidence?: string[]
}

export interface ComplianceReport {
  standard: ComplianceStandard
  overallScore: number
  passRate: number
  totalItems: number
  passedItems: number
  failedItems: number
  partialItems: number
  notApplicableItems: number
  details: CheckResultDetail[]
  criticalIssues: string[]
  generatedAt: string
}

export interface GapAnalysis {
  standard: ComplianceStandard
  gaps: GapItem[]
  totalGaps: number
  criticalGaps: number
  estimatedEffort: string
}

export interface GapItem {
  itemId: string
  requirement: string
  currentStatus: string
  gapDescription: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  remediationSteps: string[]
  estimatedDays: number
}

const gdprCheckItems: CheckItem[] = [
  {
    id: 'gdpr-1',
    name: '数据收集合法性',
    description: '确保所有个人数据收集有合法依据',
    standard: 'GDPR',
    category: '数据收集',
    severity: 'CRITICAL',
    requirement: '所有个人数据收集必须基于用户同意、合同履约、法律义务等合法依据',
    evidence: ['隐私政策', '用户同意记录', '数据处理协议']
  },
  {
    id: 'gdpr-2',
    name: '知情同意',
    description: '用户明确同意数据处理',
    standard: 'GDPR',
    category: '同意管理',
    severity: 'CRITICAL',
    requirement: '必须以清晰易懂的语言告知用户数据处理目的，并获得明确同意',
    evidence: ['同意弹窗截图', '隐私政策版本记录', '同意撤回机制']
  },
  {
    id: 'gdpr-3',
    name: '数据最小化',
    description: '仅收集实现目的所需的最少数据',
    standard: 'GDPR',
    category: '数据收集',
    severity: 'HIGH',
    requirement: '数据收集应限制在实现处理目的所必要的最小范围内',
    evidence: ['数据清单', '数据流图', '数据分类文档']
  },
  {
    id: 'gdpr-4',
    name: '目的限制',
    description: '数据仅用于收集时声明的目的',
    standard: 'GDPR',
    category: '数据处理',
    severity: 'HIGH',
    requirement: '个人数据只能用于收集时明确的特定、明确和合法的目的',
    evidence: ['数据处理记录', '目的变更流程']
  },
  {
    id: 'gdpr-5',
    name: '数据准确性',
    description: '确保个人数据准确并及时更新',
    standard: 'GDPR',
    category: '数据质量',
    severity: 'MEDIUM',
    requirement: '必须采取合理措施确保不准确的个人数据及时删除或更正',
    evidence: ['数据更新机制', '用户自助修改功能']
  },
  {
    id: 'gdpr-6',
    name: '存储限制',
    description: '数据保存期限不超过必要时间',
    standard: 'GDPR',
    category: '数据保留',
    severity: 'HIGH',
    requirement: '个人数据保存时间不得超过实现处理目的所需的时间',
    evidence: ['数据保留政策', '自动删除机制', '归档策略']
  },
  {
    id: 'gdpr-7',
    name: '完整性与保密性',
    description: '采取适当安全措施保护数据',
    standard: 'GDPR',
    category: '数据安全',
    severity: 'CRITICAL',
    requirement: '必须采取适当的技术和组织措施保护个人数据安全',
    evidence: ['加密方案', '访问控制', '安全审计报告']
  },
  {
    id: 'gdpr-8',
    name: '数据主体访问权',
    description: '用户可访问其个人数据',
    standard: 'GDPR',
    category: '用户权利',
    severity: 'HIGH',
    requirement: '数据主体有权确认其个人数据是否正在被处理并获得副本',
    evidence: ['数据导出功能', '访问请求响应流程']
  },
  {
    id: 'gdpr-9',
    name: '被遗忘权',
    description: '用户可要求删除其个人数据',
    standard: 'GDPR',
    category: '用户权利',
    severity: 'HIGH',
    requirement: '在特定条件下，数据主体有权要求删除其个人数据',
    evidence: ['数据删除功能', '删除请求处理流程']
  },
  {
    id: 'gdpr-10',
    name: '数据可携带权',
    description: '用户可获取并转移其数据',
    standard: 'GDPR',
    category: '用户权利',
    severity: 'MEDIUM',
    requirement: '数据主体有权以结构化、常用格式获取其数据并转移给其他控制者',
    evidence: ['数据导出接口', '机器可读格式支持']
  },
  {
    id: 'gdpr-11',
    name: '数据泄露通知',
    description: '72 小时内报告数据泄露',
    standard: 'GDPR',
    category: '事件响应',
    severity: 'CRITICAL',
    requirement: '发现数据泄露后必须在 72 小时内向监管机构报告',
    evidence: ['事件响应预案', '泄露通知流程', '演练记录']
  },
  {
    id: 'gdpr-12',
    name: '跨境数据传输',
    description: '确保跨境传输有适当保障',
    standard: 'GDPR',
    category: '数据传输',
    severity: 'HIGH',
    requirement: '向欧盟以外国家传输数据必须有适当的保障措施',
    evidence: ['标准合同条款 SCC', '约束性企业规则 BCR', '充分性认定']
  }
]

const mlpsCheckItems: CheckItem[] = [
  {
    id: 'mlps-1',
    name: '安全管理制度',
    description: '建立网络安全管理制度体系',
    standard: 'MLPS',
    category: '安全管理',
    severity: 'HIGH',
    requirement: '建立网络安全工作方针、管理制度和操作规程',
    evidence: ['安全管理制度文档', '操作规程', '审批流程']
  },
  {
    id: 'mlps-2',
    name: '安全管理机构',
    description: '设立网络安全管理机构',
    standard: 'MLPS',
    category: '组织架构',
    severity: 'MEDIUM',
    requirement: '设立网络安全管理职能部门，配备专职人员',
    evidence: ['组织架构图', '岗位说明书', '人员任命文件']
  },
  {
    id: 'mlps-3',
    name: '人员安全管理',
    description: '人员录用、考核、培训管理',
    standard: 'MLPS',
    category: '人员安全',
    severity: 'MEDIUM',
    requirement: '对关键岗位人员进行背景审查，签署保密协议',
    evidence: ['背景审查记录', '保密协议', '培训记录']
  },
  {
    id: 'mlps-4',
    name: '系统建设管理',
    description: '系统全生命周期安全管理',
    standard: 'MLPS',
    category: '系统建设',
    severity: 'HIGH',
    requirement: '在系统规划、设计、开发、测试、上线各阶段落实安全要求',
    evidence: ['安全需求文档', '安全设计文档', '代码审计报告']
  },
  {
    id: 'mlps-5',
    name: '访问控制',
    description: '用户身份鉴别与访问控制',
    standard: 'MLPS',
    category: '访问控制',
    severity: 'CRITICAL',
    requirement: '对用户进行身份鉴别，实施最小权限原则',
    evidence: ['身份认证机制', '权限管理策略', '访问控制列表']
  },
  {
    id: 'mlps-6',
    name: '安全审计',
    description: '记录并审计安全相关事件',
    standard: 'MLPS',
    category: '安全审计',
    severity: 'HIGH',
    requirement: '对系统运行、用户行为、安全事件进行审计记录',
    evidence: ['审计日志', '审计报告', '日志分析工具']
  },
  {
    id: 'mlps-7',
    name: '入侵防范',
    description: '检测和防止网络攻击',
    standard: 'MLPS',
    category: '入侵防范',
    severity: 'CRITICAL',
    requirement: '部署入侵检测/防御系统，及时更新特征库',
    evidence: ['IDS/IPS 部署', '攻击检测记录', '特征库更新记录']
  },
  {
    id: 'mlps-8',
    name: '恶意代码防范',
    description: '防范病毒和恶意软件',
    standard: 'MLPS',
    category: '恶意代码防范',
    severity: 'HIGH',
    requirement: '安装防病毒软件，定期更新病毒库',
    evidence: ['防病毒软件部署', '病毒库更新记录', '扫描报告']
  },
  {
    id: 'mlps-9',
    name: '数据备份恢复',
    description: '数据备份与灾难恢复能力',
    standard: 'MLPS',
    category: '备份恢复',
    severity: 'CRITICAL',
    requirement: '建立数据备份制度，定期进行恢复演练',
    evidence: ['备份策略', '备份记录', '恢复演练报告']
  },
  {
    id: 'mlps-10',
    name: '网络安全',
    description: '网络边界防护',
    standard: 'MLPS',
    category: '网络安全',
    severity: 'CRITICAL',
    requirement: '划分安全域，部署防火墙，控制网络访问',
    evidence: ['网络拓扑图', '防火墙策略', '安全域划分文档']
  },
  {
    id: 'mlps-11',
    name: '主机安全',
    description: '服务器和终端安全防护',
    standard: 'MLPS',
    category: '主机安全',
    severity: 'HIGH',
    requirement: '操作系统安全配置，及时安装安全补丁',
    evidence: ['安全基线配置', '补丁更新记录', '漏洞扫描报告']
  },
  {
    id: 'mlps-12',
    name: '应用安全',
    description: '应用系统安全防护',
    standard: 'MLPS',
    category: '应用安全',
    severity: 'HIGH',
    requirement: '防止 SQL 注入、XSS、CSRF 等常见攻击',
    evidence: ['安全编码规范', '渗透测试报告', '代码审计记录']
  },
  {
    id: 'mlps-13',
    name: '数据安全',
    description: '数据加密与完整性保护',
    standard: 'MLPS',
    category: '数据安全',
    severity: 'CRITICAL',
    requirement: '敏感数据加密存储和传输，保证数据完整性',
    evidence: ['加密方案', '密钥管理', '完整性校验机制']
  },
  {
    id: 'mlps-14',
    name: '应急预案',
    description: '网络安全事件应急响应',
    standard: 'MLPS',
    category: '应急管理',
    severity: 'HIGH',
    requirement: '制定网络安全事件应急预案，定期演练',
    evidence: ['应急预案文档', '演练记录', '应急响应团队']
  }
]

const financeCheckItems: CheckItem[] = [
  {
    id: 'fin-1',
    name: '持牌经营',
    description: '取得相应金融业务牌照',
    standard: 'FINANCE',
    category: '市场准入',
    severity: 'CRITICAL',
    requirement: '从事金融业务必须取得监管机构颁发的相应牌照',
    evidence: ['金融许可证', '营业执照', '业务范围批准文件']
  },
  {
    id: 'fin-2',
    name: '资本充足率',
    description: '满足最低资本要求',
    standard: 'FINANCE',
    category: '风险管理',
    severity: 'CRITICAL',
    requirement: '资本充足率不低于监管要求（商业银行≥8%）',
    evidence: ['资本充足率报告', '审计报告', '监管报表']
  },
  {
    id: 'fin-3',
    name: '客户资金存管',
    description: '客户资金第三方存管',
    standard: 'FINANCE',
    category: '资金安全',
    severity: 'CRITICAL',
    requirement: '客户资金必须由符合条件的商业银行存管',
    evidence: ['资金存管协议', '存管银行资质', '资金流水对账单']
  },
  {
    id: 'fin-4',
    name: '投资者适当性',
    description: '评估投资者风险承受能力',
    standard: 'FINANCE',
    category: '消费者保护',
    severity: 'HIGH',
    requirement: '向投资者销售产品时应评估其风险承受能力',
    evidence: ['风险评估问卷', '适当性匹配规则', '双录资料']
  },
  {
    id: 'fin-5',
    name: '反洗钱',
    description: '履行反洗钱义务',
    standard: 'FINANCE',
    category: '合规管理',
    severity: 'CRITICAL',
    requirement: '建立反洗钱内控制度，报告大额和可疑交易',
    evidence: ['反洗钱制度', '客户身份识别记录', '可疑交易报告']
  },
  {
    id: 'fin-6',
    name: '信息披露',
    description: '按规定披露信息',
    standard: 'FINANCE',
    category: '信息披露',
    severity: 'HIGH',
    requirement: '真实、准确、完整、及时地披露信息',
    evidence: ['信息披露文件', '定期报告', '临时公告']
  },
  {
    id: 'fin-7',
    name: '关联交易管理',
    description: '规范关联交易行为',
    standard: 'FINANCE',
    category: '风险管理',
    severity: 'HIGH',
    requirement: '关联交易应遵循公允原则，履行审批程序',
    evidence: ['关联方清单', '关联交易审批记录', '独立董事意见']
  },
  {
    id: 'fin-8',
    name: '流动性风险管理',
    description: '保持充足流动性',
    standard: 'FINANCE',
    category: '风险管理',
    severity: 'HIGH',
    requirement: '建立流动性风险管理体系，保持充足流动性',
    evidence: ['流动性风险政策', '流动性指标监测', '压力测试报告']
  },
  {
    id: 'fin-9',
    name: '操作风险管理',
    description: '防范操作风险',
    standard: 'FINANCE',
    category: '风险管理',
    severity: 'MEDIUM',
    requirement: '建立操作风险识别、评估、控制和报告机制',
    evidence: ['操作风险管理制度', '损失事件记录', '关键风险指标']
  },
  {
    id: 'fin-10',
    name: '业务连续性',
    description: '保障业务持续运营',
    standard: 'FINANCE',
    category: '应急管理',
    severity: 'HIGH',
    requirement: '建立业务连续性管理体系，制定应急预案',
    evidence: ['业务连续性计划', '灾备中心', '应急演练记录']
  }
]

const healthcareCheckItems: CheckItem[] = [
  {
    id: 'hc-1',
    name: '患者隐私保护',
    description: '保护患者个人隐私信息',
    standard: 'HEALTHCARE',
    category: '隐私保护',
    severity: 'CRITICAL',
    requirement: '严格保护患者隐私，未经授权不得泄露',
    evidence: ['隐私政策', '授权管理', '访问日志']
  },
  {
    id: 'hc-2',
    name: '医疗数据分类',
    description: '医疗数据分级分类管理',
    standard: 'HEALTHCARE',
    category: '数据管理',
    severity: 'HIGH',
    requirement: '对医疗数据进行分类分级，实施差异化保护',
    evidence: ['数据分类清单', '分级保护策略']
  },
  {
    id: 'hc-3',
    name: '电子病历管理',
    description: '规范电子病历管理',
    standard: 'HEALTHCARE',
    category: '病历管理',
    severity: 'CRITICAL',
    requirement: '电子病历应符合国家规范，保证真实性、完整性',
    evidence: ['电子病历系统认证', '病历质控记录']
  },
  {
    id: 'hc-4',
    name: '医疗质量监控',
    description: '医疗质量监测与控制',
    standard: 'HEALTHCARE',
    category: '质量管理',
    severity: 'HIGH',
    requirement: '建立医疗质量监测体系，持续改进医疗质量',
    evidence: ['质控指标', '质量分析报告', '改进措施']
  },
  {
    id: 'hc-5',
    name: '处方管理',
    description: '规范处方开具与审核',
    standard: 'HEALTHCARE',
    category: '药事管理',
    severity: 'HIGH',
    requirement: '处方应经药师审核，符合处方管理办法',
    evidence: ['处方审核记录', '合理用药监测']
  },
  {
    id: 'hc-6',
    name: '医疗器械管理',
    description: '医疗器械安全使用',
    standard: 'HEALTHCARE',
    category: '器械管理',
    severity: 'MEDIUM',
    requirement: '医疗器械应符合注册要求，定期维护检测',
    evidence: ['器械注册证', '维护记录', '检测报告']
  }
]

const iso27001CheckItems: CheckItem[] = [
  {
    id: 'iso-1',
    name: '信息安全政策',
    description: '建立信息安全方针和政策',
    standard: 'ISO27001',
    category: '信息安全管理体系',
    severity: 'HIGH',
    requirement: '制定信息安全方针，获得管理层批准和支持',
    evidence: ['信息安全方针文件', '管理层承诺声明']
  },
  {
    id: 'iso-2',
    name: '风险评估',
    description: '信息安全风险评估',
    standard: 'ISO27001',
    category: '风险管理',
    severity: 'CRITICAL',
    requirement: '定期进行信息安全风险评估，识别风险和处置措施',
    evidence: ['风险评估报告', '风险处置计划', '残余风险接受']
  },
  {
    id: 'iso-3',
    name: '资产管理',
    description: '信息资产分类与管理',
    standard: 'ISO27001',
    category: '资产管理',
    severity: 'MEDIUM',
    requirement: '识别信息资产，分类分级，明确管理责任',
    evidence: ['资产清单', '资产分类标准', '资产责任人']
  },
  {
    id: 'iso-4',
    name: '人力资源安全',
    description: '员工信息安全意识',
    standard: 'ISO27001',
    category: '人力资源',
    severity: 'MEDIUM',
    requirement: '对员工进行安全意识培训，签署保密协议',
    evidence: ['培训记录', '保密协议', '考核记录']
  },
  {
    id: 'iso-5',
    name: '物理安全',
    description: '物理环境安全防护',
    standard: 'ISO27001',
    category: '物理安全',
    severity: 'HIGH',
    requirement: '保护物理场所、设备免受未授权访问和灾害',
    evidence: ['门禁系统', '监控录像', '消防设施']
  },
  {
    id: 'iso-6',
    name: '通信安全',
    description: '通信网络安全保护',
    standard: 'ISO27001',
    category: '通信安全',
    severity: 'HIGH',
    requirement: '保护通信网络，防止未授权访问和窃听',
    evidence: ['网络拓扑', '加密方案', '网络监控']
  },
  {
    id: 'iso-7',
    name: '访问控制',
    description: '信息系统访问控制',
    standard: 'ISO27001',
    category: '访问控制',
    severity: 'CRITICAL',
    requirement: '实施基于角色的访问控制，定期审查权限',
    evidence: ['访问控制策略', '权限列表', '权限审查记录']
  },
  {
    id: 'iso-8',
    name: '系统获取维护',
    description: '系统安全开发与维护',
    standard: 'ISO27001',
    category: '系统开发',
    severity: 'HIGH',
    requirement: '在系统开发生命周期中融入安全要求',
    evidence: ['安全开发规范', '代码审计', '变更管理记录']
  },
  {
    id: 'iso-9',
    name: '供应商关系',
    description: '供应商安全管理',
    standard: 'ISO27001',
    category: '供应商管理',
    severity: 'MEDIUM',
    requirement: '管理供应商带来的信息安全风险',
    evidence: ['供应商评估', '安全协议', '审计报告']
  },
  {
    id: 'iso-10',
    name: '事件管理',
    description: '信息安全事件管理',
    standard: 'ISO27001',
    category: '事件管理',
    severity: 'HIGH',
    requirement: '建立安全事件报告和响应机制',
    evidence: ['事件管理流程', '事件记录', '响应报告']
  },
  {
    id: 'iso-11',
    name: '业务连续性',
    description: '业务连续性管理',
    standard: 'ISO27001',
    category: '业务连续性',
    severity: 'HIGH',
    requirement: '确保信息安全事件发生时业务能够持续',
    evidence: ['业务连续性计划', '灾备方案', '演练记录']
  },
  {
    id: 'iso-12',
    name: '合规性',
    description: '法律法规合规',
    standard: 'ISO27001',
    category: '合规管理',
    severity: 'CRITICAL',
    requirement: '识别并遵守适用的法律法规和合同要求',
    evidence: ['合规清单', '合规审计报告', '许可证照']
  }
]

export const COMPLIANCE_CHECK_ITEMS: Record<ComplianceStandard, CheckItem[]> = {
  GDPR: gdprCheckItems,
  MLPS: mlpsCheckItems,
  FINANCE: financeCheckItems,
  HEALTHCARE: healthcareCheckItems,
  ISO27001: iso27001CheckItems
}

export class ComplianceChecker {
  private checkResults: Map<string, CheckResultDetail> = new Map()

  getCheckItems(standard: ComplianceStandard): CheckItem[] {
    return COMPLIANCE_CHECK_ITEMS[standard] || []
  }

  getAllCheckItems(): CheckItem[] {
    return Object.values(COMPLIANCE_CHECK_ITEMS).flat()
  }

  getCheckItemsByCategory(standard: ComplianceStandard, category: string): CheckItem[] {
    return this.getCheckItems(standard).filter(item => item.category === category)
  }

  getCheckItemsBySeverity(standard: ComplianceStandard, severity: CheckItem['severity']): CheckItem[] {
    return this.getCheckItems(standard).filter(item => item.severity === severity)
  }

  performCheck(
    standard: ComplianceStandard,
    itemId: string,
    evidence: string[],
    status: 'implemented' | 'partial' | 'not_implemented'
  ): CheckResultDetail {
    const item = this.getCheckItems(standard).find(i => i.id === itemId)
    if (!item) {
      throw new Error(`Check item ${itemId} not found for standard ${standard}`)
    }

    let result: CheckResult
    let score: number
    const findings: string[] = []
    const recommendations: string[] = []

    switch (status) {
      case 'implemented':
        result = 'PASS'
        score = 100
        findings.push(`已实施：${item.requirement}`)
        break
      case 'partial':
        result = 'PARTIAL'
        score = 50
        findings.push(`部分实施：${item.requirement}`)
        recommendations.push(`完成 ${item.name} 的全部实施`)
        break
      case 'not_implemented':
        result = 'FAIL'
        score = 0
        findings.push(`未实施：${item.requirement}`)
        recommendations.push(`立即实施 ${item.name}`)
        break
    }

    if (item.evidence) {
      const missingEvidence = item.evidence.filter(e => !evidence.includes(e))
      if (missingEvidence.length > 0) {
        findings.push(`缺少证据：${missingEvidence.join(', ')}`)
        if (result === 'PASS') {
          result = 'PARTIAL'
          score = 70
        }
      }
    }

    const detail: CheckResultDetail = {
      itemId: item.id,
      itemName: item.name,
      result,
      score,
      findings,
      recommendations,
      evidence
    }

    this.checkResults.set(`${standard}-${itemId}`, detail)
    return detail
  }

  generateReport(standard: ComplianceStandard): ComplianceReport {
    const items = this.getCheckItems(standard)
    const details: CheckResultDetail[] = []
    let passedItems = 0
    let failedItems = 0
    let partialItems = 0
    let notApplicableItems = 0
    let totalScore = 0
    const criticalIssues: string[] = []

    for (const item of items) {
      const key = `${standard}-${item.id}`
      const detail = this.checkResults.get(key)

      if (!detail) {
        notApplicableItems++
        continue
      }

      details.push(detail)
      totalScore += detail.score

      switch (detail.result) {
        case 'PASS':
          passedItems++
          break
        case 'FAIL':
          failedItems++
          if (item.severity === 'CRITICAL') {
            criticalIssues.push(`${item.name}: ${item.requirement}`)
          }
          break
        case 'PARTIAL':
          partialItems++
          if (item.severity === 'CRITICAL') {
            criticalIssues.push(`${item.name}: 仅部分实施`)
          }
          break
      }
    }

    const applicableItems = items.length - notApplicableItems
    const overallScore = applicableItems > 0 ? Math.round(totalScore / applicableItems) : 0
    const passRate = applicableItems > 0 ? Math.round((passedItems / applicableItems) * 100) : 0

    return {
      standard,
      overallScore,
      passRate,
      totalItems: items.length,
      passedItems,
      failedItems,
      partialItems,
      notApplicableItems,
      details,
      criticalIssues,
      generatedAt: new Date().toISOString()
    }
  }

  performGapAnalysis(
    standard: ComplianceStandard,
    implementationStatus: Map<string, 'implemented' | 'partial' | 'not_implemented'>
  ): GapAnalysis {
    const items = this.getCheckItems(standard)
    const gaps: GapItem[] = []
    let criticalGaps = 0
    let totalDays = 0

    for (const item of items) {
      const status = implementationStatus.get(item.id) || 'not_implemented'

      if (status === 'implemented') {
        continue
      }

      const isGap = status === 'not_implemented' || status === 'partial'
      if (!isGap) {
        continue
      }

      const gap: GapItem = {
        itemId: item.id,
        requirement: item.requirement,
        currentStatus: status === 'not_implemented' ? '未实施' : '部分实施',
        gapDescription: status === 'not_implemented'
          ? `完全缺失：${item.name}`
          : `需要完善：${item.name}`,
        severity: item.severity,
        remediationSteps: this.getRemediationSteps(item, status),
        estimatedDays: this.estimateRemediationDays(item, status)
      }

      gaps.push(gap)
      totalDays += gap.estimatedDays

      if (item.severity === 'CRITICAL') {
        criticalGaps++
      }
    }

    return {
      standard,
      gaps,
      totalGaps: gaps.length,
      criticalGaps,
      estimatedEffort: this.formatEffort(totalDays)
    }
  }

  private getRemediationSteps(item: CheckItem, status: 'partial' | 'not_implemented'): string[] {
    const baseSteps = [
      `理解 ${item.name} 的具体要求`,
      `制定实施方案`,
      `分配资源和责任人`,
      `实施控制措施`,
      `收集证据材料`,
      `内部验证`
    ]

    if (status === 'not_implemented') {
      return ['立项审批', ...baseSteps, '外部审计（如需要）']
    }

    return baseSteps
  }

  private estimateRemediationDays(item: CheckItem, status: 'partial' | 'not_implemented'): number {
    const baseDays: Record<string, number> = {
      CRITICAL: 15,
      HIGH: 10,
      MEDIUM: 5,
      LOW: 2
    }

    const multiplier = status === 'not_implemented' ? 1.5 : 0.5
    return Math.round(baseDays[item.severity] * multiplier)
  }

  private formatEffort(totalDays: number): string {
    if (totalDays <= 5) {
      return '低（1 周内）'
    } else if (totalDays <= 20) {
      return '中（1-4 周）'
    } else if (totalDays <= 60) {
      return '高（1-3 个月）'
    } else {
      return '非常高（3 个月以上）'
    }
  }

  clearResults(): void {
    this.checkResults.clear()
  }
}

export function createComplianceChecker(): ComplianceChecker {
  return new ComplianceChecker()
}

export default {
  ComplianceChecker,
  createComplianceChecker,
  COMPLIANCE_CHECK_ITEMS
}
