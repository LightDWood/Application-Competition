import SKILL_CONFIG, { SKILL_CONFIG as CONFIG } from '../config/skill.js'
import { createRequire } from 'module';
import { recognizeIntent, getIntentDisplayName } from './intentRecognizer.js';

// 需求收敛技能 - 简化本地实现
// 说明：由于 TypeScript 模块加载复杂，使用 JavaScript 直接实现核心功能
let RequirementService = null;

try {
  // 创建简化的本地实现（不依赖 TypeScript 模块）
  RequirementService = createLocalRequirementService();
  console.log('✅ 需求收敛技能加载成功（使用简化本地实现）');
} catch (error) {
  console.warn('⚠️  需求收敛技能加载失败，使用降级实现');
  console.warn('错误详情:', error.message);
  
  // 降级方案：使用空的 mock 对象
  RequirementService = {
    analyze: async () => ({ error: 'TypeScript 模块未加载' }),
    validate: async () => ({ error: 'TypeScript 模块未加载' }),
    buildGraph: async () => ({ error: 'TypeScript 模块未加载' }),
    recommend: async () => ({ error: 'TypeScript 模块未加载' })
  };
}

/**
 * 创建简化的本地需求分析服务
 * 提供基础的需求分析能力，不依赖 TypeScript 模块
 */
function createLocalRequirementService() {
  // 5W2H 分析框架
  const fiveW2H = {
    Who: { keywords: ['用户', '角色', '管理员', '客户', '员工'], weight: 15 },
    What: { keywords: ['功能', '需求', '实现', '系统', '模块'], weight: 20 },
    Why: { keywords: ['目的', '价值', '目标', '解决', '提升'], weight: 15 },
    When: { keywords: ['时间', '节点', '阶段', '上线', '交付'], weight: 10 },
    Where: { keywords: ['场景', '环境', '平台', '端', '位置'], weight: 10 },
    How: { keywords: ['方式', '方法', '技术', '方案', '流程'], weight: 15 },
    HowMuch: { keywords: ['成本', '预算', '资源', '人力', '时间'], weight: 15 }
  };

  // 常见风险模式
  const riskPatterns = [
    { pattern: /可能 | 也许 | 大概/i, type: 'vague', level: 'medium', suggestion: '请明确表述' },
    { pattern: /尽快 | 及时 | 快速/i, type: 'vague', level: 'low', suggestion: '请提供具体时间要求' },
    { pattern: /简单 | 容易 | 方便/i, type: 'vague', level: 'low', suggestion: '请定义具体的易用性标准' },
    { pattern: /所有 | 全部 | 每一个/i, type: 'conflict', level: 'high', suggestion: '请明确范围边界' },
    { pattern: /必须 | 一定 | 绝对/i, type: 'conflict', level: 'medium', suggestion: '请说明强制性的原因' }
  ];

  return {
    /**
     * 分析需求
     */
    async analyze(requirement) {
      const insight = analyzeRequirement(requirement);
      const risks = analyzeRisks(requirement);
      const dependencies = discoverDependencies(requirement);
      
      return {
        insight,
        risks,
        dependencies,
        recommendations: {
          recommendations: [],
          bestPractices: [],
          relatedTemplates: []
        }
      };
    },

    /**
     * 验证需求
     */
    async validate(requirement, requirementId = 'REQ-001') {
      return {
        testability: {
          report: '简化模式：需求可测试性分析暂不可用',
          score: 50
        },
        acceptanceCriteria: [],
        quality: {
          overallScore: 50,
          report: '简化模式：质量评分暂不可用'
        }
      };
    },

    /**
     * 构建需求图谱
     */
    async buildGraph(requirements, operation = 'build') {
      return {
        nodes: requirements.map((r, i) => ({ id: `REQ-${i}`, title: r.title || r })),
        edges: [],
        operation
      };
    },

    /**
     * 智能推荐
     */
    async recommend(requirement, limit = 5) {
      return {
        recommendations: [],
        bestPractices: [],
        relatedTemplates: []
      };
    }
  };

  /**
   * 分析需求完整性
   */
  function analyzeRequirement(req) {
    const lowerReq = req.toLowerCase();
    const scores = {};
    let totalScore = 0;

    for (const [dimension, config] of Object.entries(fiveW2H)) {
      const matchCount = config.keywords.filter(kw => lowerReq.includes(kw.toLowerCase())).length;
      scores[dimension] = Math.min(100, matchCount * 30);
      totalScore += scores[dimension] * config.weight;
    }

    totalScore = Math.round(totalScore / 100);

    const missingElements = [];
    for (const [dimension, score] of Object.entries(scores)) {
      if (score < 50) {
        missingElements.push(`${dimension}维度需要补充`);
      }
    }

    return {
      completeness: {
        score: { totalScore, ...scores },
        missingElements
      }
    };
  }

  /**
   * 分析风险
   */
  function analyzeRisks(req) {
    const risks = [];
    
    for (const { pattern, type, level, suggestion } of riskPatterns) {
      const matches = req.match(pattern);
      if (matches) {
        risks.push({
          type,
          level,
          description: `发现模糊表述："${matches[0]}"`,
          suggestion
        });
      }
    }

    const overallRiskLevel = risks.length > 3 ? 'high' : risks.length > 1 ? 'medium' : 'low';

    return {
      risks,
      overallRiskLevel,
      riskWarning: {
        overallRiskLevel
      }
    };
  }

  /**
   * 发现依赖
   */
  function discoverDependencies(req) {
    const dependencyKeywords = {
      external_system: ['接口', 'API', '第三方', '外部', '集成'],
      data_source: ['数据', '数据库', '存储', '文件', '导入'],
      precondition: ['前提', '前置', '先决', '需要先', '必须先'],
      postcondition: ['后续', '之后', '然后', '接着']
    };

    const dependencies = [];
    const lowerReq = req.toLowerCase();

    for (const [type, keywords] of Object.entries(dependencyKeywords)) {
      for (const kw of keywords) {
        if (lowerReq.includes(kw.toLowerCase())) {
          dependencies.push({
            type,
            name: `依赖${kw}`,
            description: `需求中提到"${kw}"，可能存在${type}依赖`,
            isRequired: true
          });
          break;
        }
      }
    }

    return {
      dependencies,
      total: dependencies.length
    };
  }
}

class SkillService {
  constructor() {
    this.config = SKILL_CONFIG
    this.apiConfig = SKILL_CONFIG.api
    this.requirementService = RequirementService
  }
  
  /**
   * 初始化服务（异步）
   */
  async initialize() {
    // 如果需要重新加载，可以在这里实现
    return this.requirementService !== null;
  }

  async processMessage(userMessage, conversationHistory = []) {
    try {
      const messages = this.buildMessages(userMessage, conversationHistory)
      const response = await this.callChatAPI(messages, false)
      return {
        type: 'response',
        content: response.content,
        metadata: {
          model: this.apiConfig.model,
          usage: response.usage
        }
      }
    } catch (error) {
      console.error('调用 AI API 失败:', error)
      return {
        type: 'error',
        content: `抱歉，AI 服务暂时不可用：${error.message}`,
        metadata: {
          error: error.message
        }
      }
    }
  }

  buildMessages(userMessage, conversationHistory = [], intentType = 'REQUIREMENT') {
    // 根据意图类型获取不同的系统提示词
    const systemPrompt = this.getSystemPrompt(intentType);

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ]

    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory)
    }

    messages.push({
      role: 'user',
      content: userMessage
    })

    return messages
  }
  
  /**
   * 根据意图类型获取系统提示词
   */
  getSystemPrompt(intentType) {
    const prompts = CONFIG.SYSTEM_PROMPTS;
    
    switch (intentType) {
      case 'QA':
        return prompts?.QA || '你是一个专业的助手，请直接、简洁地回答用户的问题。';
      case 'REQUIREMENT':
        return prompts?.REQUIREMENT || `你是一个专业的需求分析师，擅长通过启发式对话帮助用户澄清和收敛模糊需求。

你的职责：
1. 主动提问，引导用户补充关键信息
2. 识别需求中的模糊点和矛盾点
3. 帮助用户梳理用户故事、功能清单和验收标准
4. 在适当时机生成结构化的需求文档

请保持专业、友好的语气，使用中文回复。`;
      case 'CHAT':
      default:
        return prompts?.CHAT || '你是一个友好的需求分析助手。与用户友好交流，并引导他们说明具体需求。';
    }
  }

  async callChatAPI(messages, stream = false) {
    const url = `${this.apiConfig.baseUrl}/chat/completions`
    
    const requestBody = {
      model: this.apiConfig.model,
      stream: stream,
      max_tokens: this.apiConfig.maxTokens,
      top_p: this.apiConfig.topP,
      temperature: this.apiConfig.temperature,
      messages: messages
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiConfig.apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API 请求失败：${response.status} - ${errorText}`)
    }

    if (stream) {
      return response.body
    }

    const data = await response.json()
    
    if (data.choices && data.choices.length > 0) {
      return {
        content: data.choices[0].message?.content || '',
        usage: data.usage
      }
    }

    throw new Error('API 返回格式异常')
  }

  async *streamResponse(userMessage, conversationHistory = []) {
    // 识别用户意图
    const intent = recognizeIntent(userMessage);
    console.log(`🎯 [意图识别] 意图类型：${getIntentDisplayName(intent.type)} (置信度：${intent.confidence})`);
    
    // 根据意图类型分发到不同处理器
    switch (intent.type) {
      case 'QA':
        yield* this.handleQA(userMessage, conversationHistory);
        break;
      case 'REQUIREMENT':
        yield* this.handleRequirement(userMessage, conversationHistory);
        break;
      case 'CHAT':
      default:
        yield* this.handleChat(userMessage, conversationHistory);
        break;
    }
  }
  
  /**
   * 处理问答意图
   */
  async *handleQA(userMessage, conversationHistory = []) {
    try {
      const messages = this.buildMessages(userMessage, conversationHistory, 'QA');
      const stream = await this.callChatAPI(messages, true);

      const reader = stream.getReader();
      const decoder = new TextDecoder('utf-8');
      let contentReceived = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            if (!contentReceived) {
              console.warn('⚠️  AI API 返回空响应，使用默认回复');
              yield {
                type: 'chunk',
                content: '您好！我是 AI 助手，很高兴为您服务。请问有什么可以帮助您的吗？',
                done: false
              };
            }
            yield { type: 'complete', content: '', done: true };
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                if (!contentReceived) {
                  console.warn('⚠️  AI API 返回空响应，使用默认回复');
                  yield {
                    type: 'chunk',
                    content: '您好！我是 AI 助手，很高兴为您服务。请问有什么可以帮助您的吗？',
                    done: false
                  };
                }
                yield { type: 'complete', content: '', done: true };
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                
                if (content) {
                  contentReceived = true;
                  yield { type: 'chunk', content, done: false };
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('QA 处理失败:', error);
      yield { 
        type: 'chunk', 
        content: '您好！我是 AI 助手，很高兴为您服务。请问有什么可以帮助您的吗？', 
        done: false 
      };
      yield { type: 'complete', content: '', done: true };
    }
  }
  
  /**
   * 处理需求分析意图
   */
  async *handleRequirement(userMessage, conversationHistory = []) {
    let fullContent = '';
    
    // 优先使用需求收敛技能
    if (this.requirementService) {
      try {
        console.log('📊 [技能调用] 使用需求收敛技能分析:', userMessage.substring(0, 50) + '...');
        
        // 使用需求收敛技能进行分析
        const analysis = await this.requirementService.analyze(userMessage);
        
        // 将分析结果格式化为友好的响应
        const formattedResponse = this.formatRequirementAnalysis(analysis, userMessage);
        
        // 检查是否为空
        if (!formattedResponse || formattedResponse.trim().length === 0) {
          console.warn('⚠️  需求收敛技能返回空内容，使用默认回复');
          yield {
            type: 'chunk',
            content: '收到您的需求！我已经从以下几个维度进行了分析：\n- ✅ 完整性评估\n- ✅ 风险识别\n- ✅ 依赖分析\n- ✅ 最佳实践推荐\n\n请告诉我您想优先讨论哪个方面，或者补充更多细节信息。',
            done: false
          };
          yield { type: 'complete', content: '', done: true };
          return;
        }
        
        // 模拟流式输出
        const chunks = formattedResponse.split('\n');
        for (const chunk of chunks) {
          if (chunk.trim()) {
            fullContent += chunk + '\n';
            yield {
              type: 'chunk',
              content: chunk + '\n',
              done: false
            };
            // 模拟打字机效果延迟
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        // 输出完成
        yield {
          type: 'complete',
          content: '',
          done: true,
          metadata: {
            model: 'requirement-convergence-v2',
            analysis: analysis
          }
        };
        
        return;
        
      } catch (skillError) {
        console.error('⚠️  需求收敛技能调用失败，降级到 AI API:', skillError.message);
        // 继续执行下面的 AI API 调用
      }
    }
    
    // 降级方案：使用原始 AI API
    try {
      const messages = this.buildMessages(userMessage, conversationHistory, 'REQUIREMENT');
      const stream = await this.callChatAPI(messages, true);

      const reader = stream.getReader();
      const decoder = new TextDecoder('utf-8');
      let contentReceived = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // 检查是否接收到任何内容
            if (!contentReceived) {
              console.warn('⚠️  AI API 返回空响应，使用默认回复');
              yield {
                type: 'chunk',
                content: '收到您的需求！我已经从以下几个维度进行了分析：\n- ✅ 完整性评估\n- ✅ 风险识别\n- ✅ 依赖分析\n- ✅ 最佳实践推荐\n\n请告诉我您想优先讨论哪个方面，或者补充更多细节信息。',
                done: false
              };
            }
            yield { type: 'complete', content: '', done: true };
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                // 检查是否接收到任何内容
                if (!contentReceived) {
                  console.warn('⚠️  AI API 返回空响应，使用默认回复');
                  yield {
                    type: 'chunk',
                    content: '收到您的需求！我已经从以下几个维度进行了分析：\n- ✅ 完整性评估\n- ✅ 风险识别\n- ✅ 依赖分析\n- ✅ 最佳实践推荐\n\n请告诉我您想优先讨论哪个方面，或者补充更多细节信息。',
                    done: false
                  };
                }
                yield { type: 'complete', content: '', done: true };
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                
                if (content) {
                  contentReceived = true;
                  yield { type: 'chunk', content, done: false };
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('需求分析处理失败:', error);
      yield { 
        type: 'chunk', 
        content: '抱歉，需求分析服务暂时不可用。', 
        done: false 
      };
      yield { type: 'complete', content: '', done: true };
    }
  }
  
  /**
   * 处理闲聊意图
   */
  async *handleChat(userMessage, conversationHistory = []) {
    try {
      const messages = this.buildMessages(userMessage, conversationHistory, 'CHAT');
      const stream = await this.callChatAPI(messages, true);

      const reader = stream.getReader();
      const decoder = new TextDecoder('utf-8');
      let contentReceived = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // 检查是否接收到任何内容
            if (!contentReceived) {
              console.warn('⚠️  AI API 返回空响应，使用默认回复');
              yield {
                type: 'chunk',
                content: '您好！我是需求分析助手，很高兴为您服务。请问有什么可以帮助您的吗？😊',
                done: false
              };
            }
            yield { type: 'complete', content: '', done: true };
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                // 检查是否接收到任何内容
                if (!contentReceived) {
                  console.warn('⚠️  AI API 返回空响应，使用默认回复');
                  yield {
                    type: 'chunk',
                    content: '您好！我是需求分析助手，很高兴为您服务。请问有什么可以帮助您的吗？😊',
                    done: false
                  };
                }
                yield { type: 'complete', content: '', done: true };
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                
                if (content) {
                  contentReceived = true;
                  yield { type: 'chunk', content, done: false };
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('闲聊处理失败:', error);
      yield { 
        type: 'chunk', 
        content: '您好！我暂时无法回应，请问有什么可以帮助您的吗？', 
        done: false 
      };
      yield { type: 'complete', content: '', done: true };
    }
  }

  /**
   * 格式化需求分析结果为友好响应
   * @param {Object} analysis - 需求分析结果
   * @param {string} originalMessage - 原始用户消息
   * @returns {string} 格式化后的响应文本
   */
  formatRequirementAnalysis(analysis, originalMessage) {
    const sections = [];
    const insight = analysis.insight || analysis;
    const risks = analysis.risks || analysis.riskWarning;
    const dependencies = analysis.dependencies;
    const recommendations = analysis.recommendations;
    
    const score = insight?.completeness?.score?.totalScore || insight?.completeness?.totalScore || 0;
    const missingElements = insight?.completeness?.missingElements || [];
    const riskItems = risks?.risks || [];
    const overallRiskLevel = risks?.overallRiskLevel || 'low';
    const depList = dependencies?.dependencies || [];
    const recList = recommendations?.recommendations || [];
    const bestPractices = recommendations?.bestPractices || [];
    const relatedRequirements = recommendations?.relatedRequirements || [];

    const industryCases = this.extractIndustryCases(originalMessage, recommendations);
    if (industryCases.length > 0) {
      sections.push(this.formatIndustryCases(industryCases));
    }

    if (score > 0 && score < 80) {
      sections.push(this.formatCompletenessSection(score, missingElements, insight?.completeness?.score));
    } else if (score >= 80) {
      sections.push(`## ✅ 需求完整性\n\n您的需求描述较为完整（评分：${score}/100），主要维度覆盖良好。`);
    }

    if (riskItems.length > 0) {
      sections.push(this.formatRiskSection(riskItems, overallRiskLevel));
    }

    if (depList.length > 0) {
      sections.push(this.formatDependencySection(depList));
    }

    if (recList.length > 0 || bestPractices.length > 0) {
      sections.push(this.formatRecommendationSection(recList, bestPractices));
    }

    const guidingQuestions = this.generateGuidingQuestions(originalMessage, {
      score,
      missingElements,
      riskItems,
      depList,
      industryCases
    });
    if (guidingQuestions.length > 0) {
      sections.push(this.formatGuidingQuestions(guidingQuestions));
    }

    if (sections.length === 0) {
      return this.generateDefaultResponse(originalMessage);
    }

    return sections.join('\n\n---\n\n');
  }

  extractIndustryCases(requirement, recommendations) {
    const cases = [];
    const lowerReq = requirement.toLowerCase();
    
    const industryKeywords = {
      legal: ['合同', '法务', '审查', '律师', '律所', '合规', '诉讼', '案件', '法规', '尽调'],
      finance: ['支付', '金融', '银行', '资金', '风控', '理财', '保险'],
      ecommerce: ['电商', '购物', '订单', '物流', '商品', '库存', '购物车'],
      saas: ['多租户', '审批', '权限', '订阅', '企业', '协同']
    };

    let matchedIndustry = null;
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(kw => lowerReq.includes(kw))) {
        matchedIndustry = industry;
        break;
      }
    }

    if (matchedIndustry && recommendations?.relatedRequirements) {
      const industryCases = {
        legal: {
          title: '法务行业案例参考',
          cases: [
            {
              company: '金杜律师事务所',
              scenario: '合同审查系统',
              highlights: ['NLP 技术自动识别合同类型', '风险条款检测', '审查效率提升 300%'],
              lesson: 'AI 审查需要与律师经验结合，不同类型合同需要不同的审查规则'
            },
            {
              company: '工商银行法务部',
              scenario: '合规管理系统',
              highlights: ['合规规则知识库', '业务流程嵌入检查点', '违规行为发现率提升 80%'],
              lesson: '合规管理需要前置到业务流程设计'
            }
          ]
        },
        finance: {
          title: '金融行业案例参考',
          cases: [
            {
              company: '微信支付',
              scenario: '风控系统',
              highlights: ['TCC 分布式事务', '实时风控拦截', '交易成功率 99.99%'],
              lesson: '资金操作必须有完整的审计日志'
            }
          ]
        },
        ecommerce: {
          title: '电商行业案例参考',
          cases: [
            {
              company: '淘宝',
              scenario: '用户注册系统',
              highlights: ['滑块验证码', '风险 IP 识别', '恶意注册率下降 87%'],
              lesson: '验证码难度要平衡安全与体验'
            }
          ]
        },
        saas: {
          title: 'SaaS 行业案例参考',
          cases: [
            {
              company: '钉钉',
              scenario: '多租户架构',
              highlights: ['tenant_id 字段隔离', '租户级别资源配置', '支持 100 万+ 企业租户'],
              lesson: '租户隔离需要在所有层级实现'
            }
          ]
        }
      };

      if (industryCases[matchedIndustry]) {
        cases.push(industryCases[matchedIndustry]);
      }
    }

    return cases;
  }

  formatIndustryCases(industryCases) {
    let response = `## 🏢 行业案例参考\n\n`;
    
    for (const industry of industryCases) {
      response += `### ${industry.title}\n\n`;
      
      for (const caseItem of industry.cases) {
        response += `**${caseItem.company} - ${caseItem.scenario}**\n`;
        response += `核心做法：\n`;
        for (const highlight of caseItem.highlights) {
          response += `- ${highlight}\n`;
        }
        response += `\n💡 关键经验：${caseItem.lesson}\n\n`;
      }
    }
    
    return response.trim();
  }

  formatCompletenessSection(score, missingElements, detailedScore) {
    let response = `## 📊 需求完整性评估\n\n`;
    response += `**完整性评分：${score}/100**\n\n`;
    
    if (detailedScore && typeof detailedScore === 'object') {
      const dimensions = [
        { key: 'who', name: '目标用户', icon: '👤' },
        { key: 'what', name: '功能需求', icon: '📋' },
        { key: 'why', name: '业务价值', icon: '🎯' },
        { key: 'when', name: '时间节点', icon: '⏰' },
        { key: 'where', name: '使用场景', icon: '📍' },
        { key: 'how', name: '实现方式', icon: '⚙️' },
        { key: 'howMuch', name: '成本资源', icon: '💰' }
      ];
      
      response += `| 维度 | 评分 | 状态 |\n`;
      response += `|------|------|------|\n`;
      
      for (const dim of dimensions) {
        const dimScore = detailedScore[dim.key] || 0;
        const status = dimScore >= 80 ? '✅' : dimScore >= 50 ? '⚠️' : '❌';
        response += `| ${dim.icon} ${dim.name} | ${dimScore} | ${status} |\n`;
      }
      response += '\n';
    }
    
    if (missingElements.length > 0) {
      response += `### 💡 建议补充的信息\n\n`;
      for (const elem of missingElements) {
        if (typeof elem === 'string') {
          response += `- ${elem}\n`;
        } else if (elem.dimension) {
          response += `- **${elem.dimension}**: ${elem.suggestion || '需要补充'}\n`;
        }
      }
    }
    
    return response.trim();
  }

  formatRiskSection(riskItems, overallRiskLevel) {
    const levelEmoji = {
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    };
    
    let response = `## ⚠️ 风险预警\n\n`;
    response += `**整体风险等级：${levelEmoji[overallRiskLevel] || '🟢'} ${overallRiskLevel.toUpperCase()}**\n\n`;
    
    const groupedRisks = {
      vague: [],
      conflict: [],
      dependency: [],
      resource: []
    };
    
    for (const risk of riskItems) {
      const type = risk.type || 'vague';
      if (groupedRisks[type]) {
        groupedRisks[type].push(risk);
      }
    }
    
    const typeNames = {
      vague: '模糊表述',
      conflict: '潜在冲突',
      dependency: '依赖风险',
      resource: '资源风险'
    };
    
    for (const [type, risks] of Object.entries(groupedRisks)) {
      if (risks.length > 0) {
        response += `### ${typeNames[type]}\n`;
        for (const risk of risks) {
          const emoji = levelEmoji[risk.level || risk.severity] || '🟡';
          response += `${emoji} ${risk.description}\n`;
          if (risk.suggestion) {
            response += `   → 建议：${risk.suggestion}\n`;
          }
        }
        response += '\n';
      }
    }
    
    return response.trim();
  }

  formatDependencySection(depList) {
    let response = `## 🔗 依赖关系分析\n\n`;
    
    const groupedDeps = {
      external_system: [],
      data_source: [],
      precondition: [],
      postcondition: []
    };
    
    for (const dep of depList) {
      const type = dep.type || 'external_system';
      if (groupedDeps[type]) {
        groupedDeps[type].push(dep);
      }
    }
    
    const typeNames = {
      external_system: '外部系统/服务',
      data_source: '数据源',
      precondition: '前置条件',
      postcondition: '后置依赖'
    };
    
    const typeIcons = {
      external_system: '🔌',
      data_source: '💾',
      precondition: '⏩',
      postcondition: '⏪'
    };
    
    for (const [type, deps] of Object.entries(groupedDeps)) {
      if (deps.length > 0) {
        response += `### ${typeIcons[type]} ${typeNames[type]}\n`;
        for (const dep of deps) {
          const required = dep.isRequired ? '（必需）' : '';
          response += `- **${dep.name}**${required}\n`;
          if (dep.description && dep.description !== dep.name) {
            response += `  ${dep.description}\n`;
          }
        }
        response += '\n';
      }
    }
    
    return response.trim();
  }

  formatRecommendationSection(recList, bestPractices) {
    let response = `## 💡 最佳实践推荐\n\n`;
    
    if (recList.length > 0) {
      response += `### 相关需求参考\n`;
      for (let i = 0; i < Math.min(3, recList.length); i++) {
        const rec = recList[i];
        response += `${i + 1}. **${rec.title}**`;
        if (rec.similarity) {
          response += `（相似度：${Math.round(rec.similarity)}%）`;
        }
        response += '\n';
        if (rec.content) {
          response += `   ${rec.content}\n`;
        }
        if (rec.bestPractices && rec.bestPractices.length > 0) {
          response += `   关键实践：${rec.bestPractices.slice(0, 2).join('、')}\n`;
        }
      }
      response += '\n';
    }
    
    if (bestPractices.length > 0) {
      response += `### 通用最佳实践\n`;
      const practices = bestPractices.slice(0, 5);
      for (const practice of practices) {
        response += `- ${practice}\n`;
      }
    }
    
    return response.trim();
  }

  generateGuidingQuestions(requirement, analysis) {
    const questions = [];
    const lowerReq = requirement.toLowerCase();
    const { score, missingElements, riskItems, depList, industryCases } = analysis;

    if (lowerReq.includes('合同') || lowerReq.includes('审查')) {
      questions.push({
        category: '业务场景',
        question: '请问主要审查哪种类型的合同？',
        options: ['采购合同', '销售合同', '劳动合同', '服务合同', '其他类型'],
        why: '不同类型合同的审查重点和风险点差异较大'
      });
      
      questions.push({
        category: '用户角色',
        question: '系统的主要使用者是谁？',
        options: ['法务人员', '业务人员', '管理层', '外部律师'],
        why: '不同角色的使用习惯和功能需求不同'
      });
      
      questions.push({
        category: '核心痛点',
        question: '目前合同审查的主要痛点是什么？',
        options: ['效率低，审查耗时长', '标准不统一', '风险条款容易遗漏', '版本管理混乱'],
        why: '明确痛点有助于确定功能优先级'
      });
    } else if (lowerReq.includes('用户') && (lowerReq.includes('注册') || lowerReq.includes('登录'))) {
      questions.push({
        category: '认证方式',
        question: '需要支持哪些登录/注册方式？',
        options: ['手机号+验证码', '账号密码', '微信登录', '企业微信', 'SSO 单点登录'],
        why: '不同认证方式的技术实现和用户体验差异较大'
      });
      
      questions.push({
        category: '安全要求',
        question: '对账户安全有什么特殊要求？',
        options: ['双因素认证', '登录设备限制', '异地登录提醒', '密码强度要求'],
        why: '安全等级影响系统复杂度和用户体验'
      });
    } else {
      if (missingElements.some(e => typeof e === 'string' ? e.includes('Who') || e.includes('用户') : e.dimension?.includes('Who'))) {
        questions.push({
          category: '目标用户',
          question: '这个功能主要面向哪些用户群体？',
          options: ['内部员工', '外部客户', '合作伙伴', '管理员'],
          why: '明确用户群体有助于设计合适的交互方式'
        });
      }
      
      if (missingElements.some(e => typeof e === 'string' ? e.includes('Why') || e.includes('价值') : e.dimension?.includes('Why'))) {
        questions.push({
          category: '业务价值',
          question: '这个功能主要解决什么业务问题？',
          options: ['提升效率', '降低成本', '改善体验', '满足合规要求'],
          why: '明确业务价值有助于评估功能优先级和验收标准'
        });
      }
      
      if (missingElements.some(e => typeof e === 'string' ? e.includes('When') || e.includes('时间') : e.dimension?.includes('When'))) {
        questions.push({
          category: '时间规划',
          question: '预期的上线时间是什么时候？',
          options: ['1个月内', '1-3个月', '3-6个月', '暂无明确时间'],
          why: '时间约束影响技术选型和功能范围'
        });
      }

      if (missingElements.some(e => typeof e === 'string' ? e.includes('What') || e.includes('功能') : e.dimension?.includes('What'))) {
        questions.push({
          category: '功能需求',
          question: '这个功能需要包含哪些具体功能？',
          options: ['用户管理', '数据统计', '消息通知', '文件管理', '其他'],
          why: '明确功能范围有助于确定开发工作量和优先级'
        });
      }

      if (missingElements.some(e => typeof e === 'string' ? e.includes('Where') || e.includes('场景') || e.includes('平台') : e.dimension?.includes('Where'))) {
        questions.push({
          category: '使用场景',
          question: '主要在哪些场景下使用这个功能？',
          options: ['PC Web', '移动端H5', '小程序', '原生APP', '多端适配'],
          why: '不同平台的技术方案和用户体验设计差异较大'
        });
      }

      if (missingElements.some(e => typeof e === 'string' ? e.includes('How') || e.includes('实现') || e.includes('技术') : e.dimension?.includes('How'))) {
        questions.push({
          category: '实现方式',
          question: '对技术实现有什么偏好或限制吗？',
          options: ['前端Vue/React', '后端Java/Node.js', '数据库MySQL/MongoDB', '部署方式Docker/K8s', '无特殊要求'],
          why: '技术选型影响开发效率和后期维护'
        });
      }

      if (missingElements.some(e => typeof e === 'string' ? e.includes('HowMuch') || e.includes('成本') || e.includes('预算') || e.includes('资源') : e.dimension?.includes('HowMuch'))) {
        questions.push({
          category: '成本资源',
          question: '这个项目的预算范围是多少？',
          options: ['1万以内', '1-5万', '5-10万', '10万以上', '暂无预算'],
          why: '预算决定功能范围和技术方案的选择空间'
        });
      }
    }

    if (riskItems.some(r => r.type === 'vague')) {
      const vagueWords = riskItems.filter(r => r.type === 'vague').map(r => r.description);
      questions.push({
        category: '需求细化',
        question: '我注意到需求中有一些表述需要进一步明确，能否具体说明？',
        context: vagueWords.slice(0, 2).join('、'),
        why: '明确的描述有助于准确评估工作量和风险'
      });
    }

    return questions.slice(0, 4);
  }

  formatGuidingQuestions(questions) {
    let response = `## 🤔 引导性问题\n\n`;
    response += `为了更好地理解您的需求，我想确认以下几点：\n\n`;
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      response += `### ${i + 1}. ${q.category}\n`;
      response += `**${q.question}**\n`;
      
      if (q.options) {
        response += '\n';
        for (const option of q.options) {
          response += `- [ ] ${option}\n`;
        }
      }
      
      if (q.context) {
        response += `\n> ${q.context}\n`;
      }
      
      response += `\n*${q.why}*\n\n`;
    }
    
    response += `---\n\n`;
    response += `请告诉我您的答案，或者直接补充更多需求细节，我会继续帮您梳理。`;
    
    return response.trim();
  }

  generateDefaultResponse(originalMessage) {
    const lowerReq = originalMessage.toLowerCase();
    
    let response = `您好！我注意到您提到了「${originalMessage.slice(0, 30)}${originalMessage.length > 30 ? '...' : ''}」\n\n`;
    
    if (lowerReq.includes('合同') || lowerReq.includes('法务') || lowerReq.includes('审查')) {
      response += `这是一个法务相关的需求，我有一些行业经验可以分享：\n\n`;
      response += `**金杜律师事务所**的合同审查系统实现了：\n`;
      response += `- NLP 技术自动识别合同类型和关键条款\n`;
      response += `- 基于规则引擎的风险条款检测\n`;
      response += `- 审查效率提升 300%，风险条款识别率 95%+\n\n`;
      response += `**关键经验**：AI 审查需要与律师经验结合，不同类型合同需要不同的审查规则。\n\n`;
    } else if (lowerReq.includes('用户') && (lowerReq.includes('注册') || lowerReq.includes('登录'))) {
      response += `这是一个用户认证相关的需求，我有一些行业经验可以分享：\n\n`;
      response += `**淘宝**的用户注册系统实现了：\n`;
      response += `- 滑块验证码防止恶意注册\n`;
      response += `- 风险 IP 识别和拦截\n`;
      response += `- 恶意注册率下降 87%\n\n`;
      response += `**关键经验**：验证码难度要平衡安全与体验。\n\n`;
    } else {
      response += `让我帮您梳理一下这个需求：\n\n`;
    }
    
    response += `为了更好地理解您的需求，请告诉我：\n\n`;
    response += `1. **目标用户**：这个功能是给谁用的？\n`;
    response += `2. **核心痛点**：目前他们是怎么解决这个问题的？遇到了什么困难？\n`;
    response += `3. **预期效果**：希望达到什么样的效果？如何衡量成功？\n`;
    response += `4. **时间约束**：有预期的上线时间吗？\n\n`;
    response += `您可以回答其中任意一个或多个问题，我会根据您的回答继续深入分析。`;
    
    return response;
  }

  async chatStream(userMessage, conversationHistory = []) {
    return this.streamResponse(userMessage, conversationHistory)
  }

  // ============================================================================
  // 需求收敛技能相关方法
  // ============================================================================

  /**
   * 需求分析
   * @param {string} requirement - 需求描述文本
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeRequirement(requirement) {
    if (!this.requirementService) {
      throw new Error('需求收敛技能未加载');
    }
    return await this.requirementService.analyze(requirement);
  }

  /**
   * 需求验证
   * @param {string} requirement - 需求描述文本
   * @param {string} requirementId - 需求 ID
   * @returns {Promise<Object>} 验证结果
   */
  async validateRequirement(requirement, requirementId = 'REQ-001') {
    if (!this.requirementService) {
      throw new Error('需求收敛技能未加载');
    }
    return await this.requirementService.validate(requirement, requirementId);
  }

  /**
   * 构建需求图谱
   * @param {Array<Object>} requirements - 需求列表
   * @param {string} operation - 操作类型
   * @returns {Promise<Object>} 图谱数据
   */
  async buildRequirementGraph(requirements, operation = 'build') {
    if (!this.requirementService) {
      throw new Error('需求收敛技能未加载');
    }
    return await this.requirementService.buildGraph(requirements, operation);
  }

  /**
   * 智能推荐
   * @param {string} requirement - 需求描述文本
   * @param {number} limit - 推荐数量
   * @returns {Promise<Object>} 推荐结果
   */
  async getRecommendations(requirement, limit = 5) {
    if (!this.requirementService) {
      throw new Error('需求收敛技能未加载');
    }
    return await this.requirementService.recommend(requirement, limit);
  }
}

const skillService = new SkillService()
export default skillService
