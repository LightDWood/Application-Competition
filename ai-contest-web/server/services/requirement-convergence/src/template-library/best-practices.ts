export type IndustryType = 'ecommerce' | 'finance' | 'saas' | 'hardware' | 'general'

export type BusinessScenario =
  | 'user_management'
  | 'data_modeling'
  | 'api_design'
  | 'security'
  | 'performance'
  | 'scalability'
  | 'monitoring'
  | 'devops'
  | 'testing'
  | 'documentation'

export type PracticeLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface BestPractice {
  id: string
  name: string
  description: string
  industry: IndustryType[]
  scenarios: BusinessScenario[]
  level: PracticeLevel
  implementationSteps: ImplementationStep[]
  benefits: string[]
  tradeoffs: string[]
  references: Reference[]
  relatedPractices?: string[]
  tags: string[]
  version: string
  lastUpdated: string
}

export interface ImplementationStep {
  order: number
  title: string
  description: string
  codeExample?: string
  checklist: string[]
}

export interface Reference {
  title: string
  url?: string
  type: 'article' | 'book' | 'video' | 'documentation' | 'case_study'
}

export interface PracticeCategory {
  id: string
  name: string
  description: string
  practices: string[]
}

const userManagementPractices: BestPractice[] = [
  {
    id: 'bp-um-001',
    name: '密码安全存储最佳实践',
    description: '使用 bcrypt/Argon2 等强哈希算法存储用户密码，防止密码泄露',
    industry: ['general'],
    scenarios: ['user_management', 'security'],
    level: 'intermediate',
    implementationSteps: [
      {
        order: 1,
        title: '选择哈希算法',
        description: '优先选择 Argon2，其次 bcrypt，避免使用 MD5、SHA1 等弱算法',
        codeExample: `// 使用 bcrypt 示例
import bcrypt from 'bcrypt'

const saltRounds = 12
const hash = await bcrypt.hash(password, saltRounds)
const isValid = await bcrypt.compare(password, hash)`,
        checklist: [
          '选择 bcrypt 或 Argon2 算法',
          '设置合适的工作因子（bcrypt cost >= 12）',
          '不在代码中硬编码 salt'
        ]
      },
      {
        order: 2,
        title: '实施密码策略',
        description: '强制要求密码复杂度，防止弱密码',
        checklist: [
          '最小长度 8-12 位',
          '包含大小写字母、数字、特殊字符',
          '检查常见弱密码字典',
          '实施密码历史记录（防止重复使用）'
        ]
      },
      {
        order: 3,
        title: '添加速率限制',
        description: '防止暴力破解攻击',
        checklist: [
          '登录失败 5 次后锁定账户',
          '实施指数退避策略',
          '记录异常登录行为'
        ]
      }
    ],
    benefits: [
      '即使数据库泄露，密码也不易被破解',
      '符合安全合规要求',
      '提升用户信任度'
    ],
    tradeoffs: [
      '哈希计算增加 CPU 开销',
      '密码找回流程复杂（只能重置不能找回）'
    ],
    references: [
      {
        title: 'OWASP 密码存储指南',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
        type: 'documentation'
      },
      {
        title: 'bcrypt 规范',
        type: 'article'
      }
    ],
    tags: ['密码安全', '哈希', '认证', '安全'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  },
  {
    id: 'bp-um-002',
    name: '多因素认证（MFA）实施',
    description: '在密码基础上增加第二重认证，显著提升账户安全性',
    industry: ['finance', 'saas', 'ecommerce'],
    scenarios: ['user_management', 'security'],
    level: 'advanced',
    implementationSteps: [
      {
        order: 1,
        title: '选择 MFA 方式',
        description: '支持多种 MFA 方式：TOTP、短信、邮件、硬件密钥',
        codeExample: `// 使用 TOTP 示例
import { authenticator } from 'otplib'

// 生成密钥
const secret = authenticator.generateSecret()

// 验证 TOTP 码
const isValid = authenticator.verify({
  token: userToken,
  secret: secret
})`,
        checklist: [
          '至少支持 TOTP（Google Authenticator）',
          '提供短信/邮件备选方案',
          '生成并保存备用恢复码'
        ]
      },
      {
        order: 2,
        title: '实施 MFA 流程',
        description: '在关键操作时触发 MFA 验证',
        checklist: [
          '首次登录新设备时强制 MFA',
          '敏感操作（转账、修改密码）前验证',
          '提供信任设备选项（30 天内免验证）'
        ]
      },
      {
        order: 3,
        title: '异常检测',
        description: '基于风险动态触发 MFA',
        checklist: [
          '检测异常地理位置',
          '检测异常登录时间',
          '检测异常设备指纹'
        ]
      }
    ],
    benefits: [
      '阻止 99.9% 的账户劫持攻击',
      '符合金融等行业合规要求',
      '提升用户安全感'
    ],
    tradeoffs: [
      '增加用户操作步骤',
      '可能降低转化率',
      '需要处理 MFA 设备丢失场景'
    ],
    references: [
      {
        title: 'NIST MFA 指南',
        type: 'documentation'
      },
      {
        title: 'Google MFA 实施案例',
        type: 'case_study'
      }
    ],
    tags: ['MFA', '双因素认证', '安全', '身份验证'],
    version: '1.0.0',
    lastUpdated: '2026-03-17',
    relatedPractices: ['bp-um-001', 'bp-sec-001']
  }
]

const apiDesignPractices: BestPractice[] = [
  {
    id: 'bp-api-001',
    name: 'RESTful API 设计规范',
    description: '遵循 REST 原则设计清晰、一致、易用的 API 接口',
    industry: ['general'],
    scenarios: ['api_design'],
    level: 'intermediate',
    implementationSteps: [
      {
        order: 1,
        title: '资源命名规范',
        description: '使用名词复数形式，保持小写，用连字符分隔',
        codeExample: `// 好的示例
GET /api/users
GET /api/user-profiles
POST /api/orders

// 避免的示例
GET /api/getUsers
POST /api/createOrder`,
        checklist: [
          '使用名词而非动词',
          '使用复数形式',
          '小写字母，连字符分隔',
          '避免深层嵌套（不超过 3 层）'
        ]
      },
      {
        order: 2,
        title: 'HTTP 方法语义',
        description: '正确使用 HTTP 方法表达操作意图',
        checklist: [
          'GET：获取资源（幂等、安全）',
          'POST：创建资源',
          'PUT：完整更新资源（幂等）',
          'PATCH：部分更新资源',
          'DELETE：删除资源（幂等）'
        ]
      },
      {
        order: 3,
        title: '状态码使用',
        description: '返回合适的 HTTP 状态码',
        checklist: [
          '200：成功',
          '201：创建成功',
          '204：成功但无返回内容',
          '400：客户端错误',
          '401：未授权',
          '403：禁止访问',
          '404：资源不存在',
          '429：请求过多',
          '500：服务器错误'
        ]
      },
      {
        order: 4,
        title: '版本控制',
        description: '实施 API 版本管理',
        codeExample: `// URL 路径版本（推荐）
GET /api/v1/users
GET /api/v2/users

// 或 Accept Header 版本
Accept: application/vnd.api.v1+json`,
        checklist: [
          '在 URL 中包含版本号',
          '保持向后兼容',
          '提供弃用通知期（至少 6 个月）',
          '维护版本迁移文档'
        ]
      }
    ],
    benefits: [
      'API 直观易懂，降低学习成本',
      '便于客户端缓存',
      '易于扩展和演进',
      '符合行业标准，便于集成'
    ],
    tradeoffs: [
      '对于复杂操作可能不够灵活',
      '过度获取或获取不足问题（可通过 GraphQL 补充）'
    ],
    references: [
      {
        title: 'RESTful API 设计最佳实践',
        type: 'article'
      },
      {
        title: 'Microsoft REST API Guidelines',
        url: 'https://github.com/microsoft/api-guidelines',
        type: 'documentation'
      }
    ],
    tags: ['REST', 'API 设计', 'HTTP', '接口规范'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  },
  {
    id: 'bp-api-002',
    name: 'API 限流与配额管理',
    description: '防止 API 滥用，保障服务稳定性',
    industry: ['saas'],
    scenarios: ['api_design', 'performance', 'scalability'],
    level: 'advanced',
    implementationSteps: [
      {
        order: 1,
        title: '选择限流算法',
        description: '根据场景选择合适的限流算法',
        codeExample: `// 令牌桶算法示例
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity
    this.tokens = capacity
    this.refillRate = refillRate
    this.lastRefill = Date.now()
  }

  consume(tokens = 1) {
    this.refill()
    if (this.tokens >= tokens) {
      this.tokens -= tokens
      return true
    }
    return false
  }
}`,
        checklist: [
          '固定窗口：简单但不精确',
          '滑动窗口：更精确但复杂',
          '令牌桶：允许突发流量',
          '漏桶：平滑流出速率'
        ]
      },
      {
        order: 2,
        title: '实施分层限流',
        description: '针对不同维度实施限流',
        checklist: [
          '全局限流：保护整体服务',
          '用户限流：防止单用户滥用',
          'IP 限流：防止恶意攻击',
          'API 维度：不同接口不同限制'
        ]
      },
      {
        order: 3,
        title: '返回限流信息',
        description: '在响应头中告知客户端限流状态',
        codeExample: `HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1647072000

// 超限时
HTTP/1.1 429 Too Many Requests
Retry-After: 60`,
        checklist: [
          '返回剩余配额',
          '返回重置时间',
          '429 响应包含 Retry-After',
          '提供限流文档'
        ]
      }
    ],
    benefits: [
      '防止服务过载',
      '公平分配资源',
      '阻止 DDoS 攻击',
      '支持差异化服务（付费套餐）'
    ],
    tradeoffs: [
      '增加系统复杂度',
      '可能误伤正常用户',
      '需要存储限流状态'
    ],
    references: [
      {
        title: 'API 限流最佳实践',
        type: 'article'
      }
    ],
    tags: ['API', '限流', '性能', '稳定性'],
    version: '1.0.0',
    lastUpdated: '2026-03-17',
    relatedPractices: ['bp-api-001', 'bp-perf-001']
  }
]

const securityPractices: BestPractice[] = [
  {
    id: 'bp-sec-001',
    name: '防止 SQL 注入攻击',
    description: '使用参数化查询和 ORM，避免 SQL 注入风险',
    industry: ['general'],
    scenarios: ['security', 'data_modeling'],
    level: 'intermediate',
    implementationSteps: [
      {
        order: 1,
        title: '使用参数化查询',
        description: '永远不要拼接 SQL 字符串',
        codeExample: `// 错误示例 - 存在注入风险
const sql = \`SELECT * FROM users WHERE id = \${userId}\`

// 正确示例 - 参数化查询
const sql = 'SELECT * FROM users WHERE id = ?'
const result = await db.query(sql, [userId])`,
        checklist: [
          '所有查询使用参数化',
          '不使用字符串拼接',
          '存储过程也使用参数'
        ]
      },
      {
        order: 2,
        title: '使用 ORM',
        description: '优先使用 ORM 框架',
        codeExample: `// 使用 Prisma ORM
const user = await prisma.user.findUnique({
  where: { id: userId }
})

// 使用 TypeORM
const user = await userRepository.findOne({
  where: { id: userId }
})`,
        checklist: [
          '选择成熟 ORM（Prisma、TypeORM、Sequelize）',
          '理解 ORM 生成的 SQL',
          '注意 N+1 查询问题'
        ]
      },
      {
        order: 3,
        title: '输入验证',
        description: '对所有输入进行严格验证',
        checklist: [
          '白名单验证',
          '类型检查',
          '长度限制',
          '特殊字符转义'
        ]
      }
    ],
    benefits: [
      '完全防止 SQL 注入攻击',
      '代码更清晰易维护',
      'ORM 提供类型安全'
    ],
    tradeoffs: [
      'ORM 有学习成本',
      '复杂查询可能不够灵活',
      '性能开销（可接受）'
    ],
    references: [
      {
        title: 'OWASP SQL 注入防护',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
        type: 'documentation'
      }
    ],
    tags: ['SQL 注入', '安全', '输入验证', '数据库'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  },
  {
    id: 'bp-sec-002',
    name: 'XSS 攻击防护',
    description: '防止跨站脚本攻击，保护用户数据安全',
    industry: ['general'],
    scenarios: ['security'],
    level: 'intermediate',
    implementationSteps: [
      {
        order: 1,
        title: '输出编码',
        description: '对所有用户输入进行 HTML 编码后输出',
        codeExample: `// 使用 DOMPurify 清理 HTML
import DOMPurify from 'dompurify'

const clean = DOMPurify.sanitize(dirtyInput)

// React 自动编码
function Component() {
  return <div>{userInput}</div> // 安全
}

// 危险： dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{__html: userInput}} /> // 不安全`,
        checklist: [
          '所有用户输入编码后输出',
          '避免使用 innerHTML',
          '谨慎使用 eval()、Function()',
          '设置 Content-Security-Policy'
        ]
      },
      {
        order: 2,
        title: '设置 CSP 头',
        description: '内容安全策略限制脚本来源',
        codeExample: `// Express 示例
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://trusted.com"
  )
  next()
})`,
        checklist: [
          '限制脚本来源',
          '禁用 inline 脚本',
          '禁用 eval()',
          '报告违规'
        ]
      }
    ],
    benefits: [
      '防止窃取用户 Cookie',
      '防止页面篡改',
      '保护用户免受钓鱼攻击'
    ],
    tradeoffs: [
      'CSP 配置复杂',
      '可能影响第三方脚本'
    ],
    references: [
      {
        title: 'OWASP XSS 防护',
        type: 'documentation'
      }
    ],
    tags: ['XSS', '安全', '前端安全', 'CSP'],
    version: '1.0.0',
    lastUpdated: '2026-03-17',
    relatedPractices: ['bp-sec-001', 'bp-sec-003']
  }
]

const performancePractices: BestPractice[] = [
  {
    id: 'bp-perf-001',
    name: '数据库查询优化',
    description: '通过索引、缓存、分页等手段优化数据库性能',
    industry: ['general'],
    scenarios: ['performance', 'data_modeling'],
    level: 'advanced',
    implementationSteps: [
      {
        order: 1,
        title: '添加合适索引',
        description: '为高频查询字段添加索引',
        codeExample: `// PostgreSQL 示例
CREATE INDEX idx_users_email ON users(email)
CREATE INDEX idx_orders_user_created 
ON orders(user_id, created_at DESC)

// 查看索引使用情况
EXPLAIN ANALYZE 
SELECT * FROM users WHERE email = 'test@example.com'`,
        checklist: [
          '主键、外键自动索引',
          'WHERE 条件字段添加索引',
          'JOIN 字段添加索引',
          'ORDER BY 字段考虑索引',
          '避免过度索引（影响写入）'
        ]
      },
      {
        order: 2,
        title: '实施查询缓存',
        description: '缓存热点数据，减少数据库压力',
        codeExample: `// Redis 缓存示例
import Redis from 'ioredis'

const redis = new Redis()

async function getUser(id: string) {
  const cacheKey = \`user:\${id}\`
  
  // 尝试缓存
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)
  
  // 查询数据库
  const user = await db.query('SELECT * FROM users WHERE id = ?', [id])
  
  // 写入缓存（5 分钟过期）
  await redis.setex(cacheKey, 300, JSON.stringify(user))
  
  return user
}`,
        checklist: [
          '识别热点数据',
          '设置合理过期时间',
          '实现缓存失效策略',
          '考虑缓存穿透/击穿/雪崩'
        ]
      },
      {
        order: 3,
        title: '分页优化',
        description: '避免全表扫描，使用游标分页',
        codeExample: `// 避免：OFFSET 深分页
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 10000

// 推荐：游标分页
SELECT * FROM orders 
WHERE created_at < :cursor 
ORDER BY created_at DESC 
LIMIT 20`,
        checklist: [
          '避免大 OFFSET',
          '使用游标分页',
          '限制最大页大小',
          '提供总数时考虑异步计算'
        ]
      }
    ],
    benefits: [
      '查询速度提升 10-100 倍',
      '降低数据库负载',
      '提升用户体验',
      '减少服务器成本'
    ],
    tradeoffs: [
      '索引占用存储空间',
      '缓存增加系统复杂度',
      '需要监控缓存命中率'
    ],
    references: [
      {
        title: '高性能 MySQL',
        type: 'book'
      }
    ],
    tags: ['性能优化', '数据库', '索引', '缓存'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  }
]

const devopsPractices: BestPractice[] = [
  {
    id: 'bp-devops-001',
    name: 'CI/CD 流水线设计',
    description: '自动化构建、测试、部署流程，提升交付效率',
    industry: ['general'],
    scenarios: ['devops', 'testing'],
    level: 'advanced',
    implementationSteps: [
      {
        order: 1,
        title: '代码检查阶段',
        description: '提交时自动检查代码质量',
        codeExample: `# GitHub Actions 示例
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check`,
        checklist: [
          '代码风格检查（ESLint）',
          '类型检查（TypeScript）',
          '代码格式化（Prettier）',
          '敏感信息扫描'
        ]
      },
      {
        order: 2,
        title: '测试阶段',
        description: '自动化测试保证质量',
        codeExample: `  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - uses: codecov/codecov-action@v3`,
        checklist: [
          '单元测试（覆盖率 > 80%）',
          '集成测试',
          '端到端测试（关键路径）',
          '性能测试（可选）'
        ]
      },
      {
        order: 3,
        title: '构建部署阶段',
        description: '自动化构建和部署',
        codeExample: `  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: npm run build
      - uses: azure/webapps-deploy@v2
        with:
          app-name: my-app
          package: ./dist`,
        checklist: [
          '生产构建优化',
          '环境配置分离',
          '蓝绿部署/金丝雀发布',
          '回滚机制',
          '部署通知'
        ]
      }
    ],
    benefits: [
      '减少人工错误',
      '加快交付速度',
      '快速发现问题',
      '提升团队信心'
    ],
    tradeoffs: [
      '初期搭建成本高',
      '需要维护流水线配置',
      '运行时间成本'
    ],
    references: [
      {
        title: '持续交付',
        type: 'book'
      },
      {
        title: 'GitHub Actions 文档',
        type: 'documentation'
      }
    ],
    tags: ['CI/CD', 'DevOps', '自动化', '部署'],
    version: '1.0.0',
    lastUpdated: '2026-03-17'
  }
]

export const BEST_PRACTICES: BestPractice[] = [
  ...userManagementPractices,
  ...apiDesignPractices,
  ...securityPractices,
  ...performancePractices,
  ...devopsPractices
]

export const PRACTICE_CATEGORIES: PracticeCategory[] = [
  {
    id: 'cat-user-mgmt',
    name: '用户管理',
    description: '用户认证、授权、账户安全相关实践',
    practices: ['bp-um-001', 'bp-um-002']
  },
  {
    id: 'cat-api',
    name: 'API 设计',
    description: 'API 接口设计、限流、版本管理实践',
    practices: ['bp-api-001', 'bp-api-002']
  },
  {
    id: 'cat-security',
    name: '安全防护',
    description: '常见安全威胁防护实践',
    practices: ['bp-sec-001', 'bp-sec-002']
  },
  {
    id: 'cat-performance',
    name: '性能优化',
    description: '数据库、缓存、查询优化实践',
    practices: ['bp-perf-001']
  },
  {
    id: 'cat-devops',
    name: 'DevOps',
    description: '持续集成、持续部署实践',
    practices: ['bp-devops-001']
  }
]

export function getPractice(practiceId: string): BestPractice | undefined {
  return BEST_PRACTICES.find(p => p.id === practiceId)
}

export function getPracticesByIndustry(industry: IndustryType): BestPractice[] {
  return BEST_PRACTICES.filter(p => p.industry.includes(industry) || p.industry.includes('general'))
}

export function getPracticesByScenario(scenario: BusinessScenario): BestPractice[] {
  return BEST_PRACTICES.filter(p => p.scenarios.includes(scenario))
}

export function getPracticesByLevel(level: PracticeLevel): BestPractice[] {
  return BEST_PRACTICES.filter(p => p.level === level)
}

export function searchPractices(keyword: string): BestPractice[] {
  const lowerKeyword = keyword.toLowerCase()
  return BEST_PRACTICES.filter(
    p =>
      p.name.toLowerCase().includes(lowerKeyword) ||
      p.description.toLowerCase().includes(lowerKeyword) ||
      p.tags.some(t => t.toLowerCase().includes(lowerKeyword))
  )
}

export function getPracticesByTags(tags: string[]): BestPractice[] {
  return BEST_PRACTICES.filter(p => tags.some(tag => p.tags.includes(tag)))
}

export function getRelatedPractices(practiceId: string): BestPractice[] {
  const practice = getPractice(practiceId)
  if (!practice?.relatedPractices) {
    return []
  }
  return practice.relatedPractices.map(id => getPractice(id)).filter((p): p is BestPractice => !!p)
}

export class BestPracticeLibrary {
  getPractice = getPractice
  getPracticesByIndustry = getPracticesByIndustry
  getPracticesByScenario = getPracticesByScenario
  getPracticesByLevel = getPracticesByLevel
  searchPractices = searchPractices
  getPracticesByTags = getPracticesByTags
  getRelatedPractices = getRelatedPractices

  getAllPractices(): BestPractice[] {
    return BEST_PRACTICES
  }

  getCategories(): PracticeCategory[] {
    return PRACTICE_CATEGORIES
  }

  getPracticeStats() {
    return {
      total: BEST_PRACTICES.length,
      byIndustry: {
        ecommerce: this.getPracticesByIndustry('ecommerce').length,
        finance: this.getPracticesByIndustry('finance').length,
        saas: this.getPracticesByIndustry('saas').length,
        hardware: this.getPracticesByIndustry('hardware').length,
        general: this.getPracticesByIndustry('general').length
      },
      byLevel: {
        beginner: getPracticesByLevel('beginner').length,
        intermediate: getPracticesByLevel('intermediate').length,
        advanced: getPracticesByLevel('advanced').length,
        expert: getPracticesByLevel('expert').length
      }
    }
  }
}

export function createBestPracticeLibrary(): BestPracticeLibrary {
  return new BestPracticeLibrary()
}

export default {
  BEST_PRACTICES,
  PRACTICE_CATEGORIES,
  BestPracticeLibrary,
  createBestPracticeLibrary,
  getPractice,
  getPracticesByIndustry,
  getPracticesByScenario,
  searchPractices
}
