/**
 * 意图识别模块
 * 用于识别用户输入的意图类型：问答、需求分析、闲聊
 */

// 意图匹配模式
const INTENT_PATTERNS = {
  // 问答意图模式
  QA: [
    /什么 (模型 | 技术 | 功能|AI|系统 | 工具 | 能力)/i,
    /为什么/i,
    /如何 | 怎么/i,
    /是谁/i,
    /哪里 | 何处/i,
    /何时 | 什么时候/i,
    /多少 | 几个/i,
    /吗$/i,
    /什么/i,
    /为什么/i,
    /怎样/i,
    // 新增：能力相关问答
    /能做什么/i,
    /会什么/i,
    /能力/i,
    /功能.*吗/i,
    /介绍.*自己/i,
    /擅长/i,
    /本领/i,
    /本事/i,
    /如何/i
  ],
  
  // 需求分析意图模式
  REQUIREMENT: [
    /我要做/,
    /我想 (做 | 实现 | 开发 | 创建 | 弄 | 搞 | 整)/i,
    /需要 (一个 | 个|套|款|种)/i,
    /设计 (一个 | 个|套)/i,
    /开发 (一个 | 个|套)/i,
    /实现 (一个 | 个|套)/i,
    /创建 (一个 | 个)/i,
    /帮我 (做 | 写 | 实现 | 开发 | 弄 | 搞)/i,
    /想要 (一个 | 个 | 种 | 套 | 款)/i,
    // 新增：口语化表达
    /弄个/i,
    /搞个/i,
    /整个/i,
    /做个/i,
    // 新增：行业术语和场景
    /咨询.*工具/i,
    /咨询.*系统/i,
    /订阅.*系统/i,
    /订阅.*工具/i,
    /管理.*系统/i,
    /管理.*平台/i,
    /CRM.*系统/i,
    /CRM/i,
    /小程序/i,
    /APP/i,
    /网站/i,
    /平台/i,
    /软件/i,
    /应用/i,
    // 新增：需求补充和延续模式
    /企业.*用/i,
    /部门.*用/i,
    /核心痛点/i,
    /痛点是/i,
    /问题是.*信息/i,
    /信息太多/i,
    /飞书.*体验/i,
    /点赞.*点踩/i,
    /自定义.*时间/i,
    /支持.*时间/i,
    /文章.*研报/i,
    /股价.*政策/i,
    /订阅.*来源/i,
    /AI.*审查/i,
    /RSS.*API/i,
    /不限制.*预算/i
  ]
};

/**
 * 识别用户输入的意图
 * @param {string} input - 用户输入
 * @returns {Object} 意图识别结果 { type: string, confidence: number }
 */
export function recognizeIntent(input) {
  if (!input || typeof input !== 'string') {
    return { type: 'CHAT', confidence: 0.5 };
  }
  
  const trimmedInput = input.trim();
  
  // 问答意图检测
  for (const pattern of INTENT_PATTERNS.QA) {
    if (pattern.test(trimmedInput)) {
      return { type: 'QA', confidence: 0.9 };
    }
  }
  
  // 需求分析意图检测
  for (const pattern of INTENT_PATTERNS.REQUIREMENT) {
    if (pattern.test(trimmedInput)) {
      return { type: 'REQUIREMENT', confidence: 0.9 };
    }
  }
  
  // 默认为闲聊意图
  return { type: 'CHAT', confidence: 0.5 };
}

/**
 * 获取意图类型的显示名称
 * @param {string} type - 意图类型
 * @returns {string} 显示名称
 */
export function getIntentDisplayName(type) {
  const displayNames = {
    QA: '问答',
    REQUIREMENT: '需求分析',
    CHAT: '闲聊'
  };
  return displayNames[type] || '未知';
}

export default {
  recognizeIntent,
  getIntentDisplayName,
  INTENT_PATTERNS
};
