const SKILL_CONFIG = {
  name: 'requirement-convergence',
  description: '通过启发式对话帮助用户澄清模糊需求，支持检索增强、飞书同步和完整对话记录。',
  timeout: 60000,
  maxRetries: 3,
  
  api: {
    baseUrl: process.env.MODEL_API_URL || 'https://modelapi-test.haier.net/model/v1',
    apiKey: process.env.MODEL_API_KEY || 'apikey-69b8f5c1e4b0c281b94a4c49',
    model: process.env.MODEL_NAME || 'Qwen3.5-35B-A3B',
    maxTokens: parseInt(process.env.MODEL_MAX_TOKENS) || 2048,
    temperature: parseFloat(process.env.MODEL_TEMPERATURE) || 0.7,
    topP: parseFloat(process.env.MODEL_TOP_P) || 0.95
  },
  
  // 系统提示词配置
  SYSTEM_PROMPTS: {
    QA: `你是一个专业的需求分析助手。当用户提问时：
1. 直接、简洁地回答问题
2. 不要进行需求分析
3. 不要提供引导性问题
4. 保持回答准确、专业
5. 如果问题与需求分析无关，也请友好回答`,

    REQUIREMENT: `你是一个专业的需求分析助手。当用户描述需求时：
1. 进行完整性评估（使用 5W2H 框架：Who、What、Why、When、Where、How、HowMuch）
2. 识别潜在风险和模糊表述
3. 发现依赖关系
4. 提供引导性问题帮助用户完善需求
5. 使用友好的语气，避免过于机械`,

    CHAT: `你是一个友好的需求分析助手。与用户交流时：
1. 友好、自然地回应
2. 适时引导用户说明具体需求
3. 不要过于机械或公式化
4. 如果用户有明确的需求意图，引导其详细描述
5. 保持对话流畅自然`
  }
}

export default SKILL_CONFIG
export { SKILL_CONFIG }
