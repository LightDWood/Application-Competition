import db from '../models/index.js'

const { Training, Stage, AiTool, ContestInfo } = db

const trainings = [
  { name: 'AI说-AI赋能法律人工作：原理、工具', videoUrl: 'https://live-og3lg6.vhall.cn/v3/lives/watch/763568303', sortOrder: 1 },
  { name: '圆桌论坛：生成式AI对企业合规的挑战', videoUrl: 'https://t.568live.cn/FK1YtW', sortOrder: 2 },
  { name: '主题演讲：全球视角下的AI合规与监管趋势', videoUrl: 'https://live.vhall.com/v3/lives/watch/686916117', sortOrder: 3 },
  { name: '专家视角：通用型AI与法律AI的差异与融合', videoUrl: 'https://live.vhall.com/v3/lives/watch/560575636', sortOrder: 4 },
  { name: '圆桌讨论：法务部门如何使用AI赋能工作场景', videoUrl: 'https://live.vhall.com/v3/lives/watch/626184781', sortOrder: 5 },
  { name: '圆桌讨论：生成式AI对企业合规的挑战与风险防控', videoUrl: 'https://live.vhall.com/v3/lives/watch/580655488', sortOrder: 6 },
  { name: '生成式AI法律治理：全球热点、法律挑战与合规实践', videoUrl: 'https://live.vhall.com/v3/lives/watch/627813242', sortOrder: 7 },
  { name: 'AI+应用出海合规风险', videoUrl: 'https://live.vhall.com/v3/lives/watch/254857703', sortOrder: 8 },
  { name: '人工智能的法律边界与出海路径之一', videoUrl: 'https://live.vhall.com/v3/lives/watch/617378607', sortOrder: 9 },
  { name: '未来法律·AI说-跨境出海中的AI法律应用', videoUrl: 'https://live-og3lg6.vhall.cn/v3/lives/watch/998354907', sortOrder: 10 },
  { name: '未来法律·AI说-企业法务如何高效使用AI', videoUrl: 'https://live-og3lg6.vhall.cn/v3/lives/watch/959768469', sortOrder: 11 },
  { name: '未来法律·AI说-AIGC应用中的法律挑战', videoUrl: 'https://live-og3lg6.vhall.cn/v3/lives/watch/178631583', sortOrder: 12 },
  { name: '未来法律·AI说-法律人共创畅想法律AI的未来', videoUrl: 'https://live-og3lg6.vhall.cn/v3/lives/watch/433075047', sortOrder: 13 },
  { name: '未来法律·AI说-律所与企业双重视角下的人机协同', videoUrl: 'https://live-og3lg6.vhall.cn/v3/lives/watch/293362594', sortOrder: 14 }
]

const stages = [
  { name: 'AI应用技巧培训', description: '系统学习AI应用技能，掌握主流AI工具使用方法', time: '3月-4月', sortOrder: 1, status: 1 },
  { name: '创意提交与评审', description: '发挥创意，提出AI副驾驶应用场景构想', time: '5月初', sortOrder: 2, status: 0 },
  { name: '智能体培训实战', description: '学习构建复杂智能体，掌握Agent模板', time: '6月-8月', sortOrder: 3, status: 0 },
  { name: '作品提交与评审', description: '提交复杂智能体设计作品，展示实战成果', time: '9月初', sortOrder: 4, status: 0 },
  { name: '应用开发与上线', description: '进阶实战，打造高质量应用成果', time: '10月-12月', sortOrder: 5, status: 0 }
]

const aiTools = [
  { category: 'AI对话助手', categoryIcon: 'K', name: 'Kimi', url: 'https://kimi.moonshot.cn', rank: 1, recommend: '推荐', description: '长文本处理能力强', sortOrder: 1 },
  { category: 'AI对话助手', categoryIcon: 'K', name: '通义千问', url: 'https://tongyi.aliyun.com', rank: 2, recommend: '推荐', description: '阿里出品，功能全面', sortOrder: 2 },
  { category: 'AI对话助手', categoryIcon: 'K', name: '文心一言', url: 'https://yiyan.baidu.com', rank: 3, recommend: '推荐', description: '百度出品，中文理解好', sortOrder: 3 },
  { category: 'AI对话助手', categoryIcon: 'K', name: '豆包', url: 'https://www.doubao.com', rank: 4, recommend: null, description: '字节跳动出品', sortOrder: 4 },
  { category: 'AI对话助手', categoryIcon: 'K', name: '智谱清言', url: 'https://chatglm.cn', rank: 5, recommend: null, description: '清华技术背景', sortOrder: 5 },
  { category: 'AI写作工具', categoryIcon: 'W', name: 'Kimi', url: 'https://kimi.moonshot.cn', rank: 1, recommend: '推荐', description: '文档处理能力强', sortOrder: 1 },
  { category: 'AI写作工具', categoryIcon: 'W', name: '通义千问', url: 'https://tongyi.aliyun.com', rank: 2, recommend: '推荐', description: '写作辅助功能丰富', sortOrder: 2 },
  { category: 'AI写作工具', categoryIcon: 'W', name: '秘塔写作猫', url: 'https://xiezuocat.com', rank: 3, recommend: null, description: '专业写作助手', sortOrder: 3 },
  { category: 'AI写作工具', categoryIcon: 'W', name: '讯飞写作', url: 'https://writing.iflyrec.com', rank: 4, recommend: null, description: '语音转写+写作', sortOrder: 4 },
  { category: 'AI绘图工具', categoryIcon: 'D', name: '即梦AI', url: 'https://jimeng.jianying.com', rank: 1, recommend: '推荐', description: '字节出品，中文理解好', sortOrder: 1 },
  { category: 'AI绘图工具', categoryIcon: 'D', name: '通义万相', url: 'https://tongyi.aliyun.com/wanxiang', rank: 2, recommend: '推荐', description: '阿里出品，功能强大', sortOrder: 2 },
  { category: 'AI绘图工具', categoryIcon: 'D', name: '文心一格', url: 'https://yige.baidu.com', rank: 3, recommend: null, description: '百度出品', sortOrder: 3 },
  { category: 'AI绘图工具', categoryIcon: 'D', name: '混元助手', url: 'https://hunyuan.tencent.com', rank: 4, recommend: null, description: '腾讯出品', sortOrder: 4 },
  { category: 'AI办公工具', categoryIcon: 'O', name: 'Kimi', url: 'https://kimi.moonshot.cn', rank: 1, recommend: '推荐', description: '文档分析能力强', sortOrder: 1 },
  { category: 'AI办公工具', categoryIcon: 'O', name: '飞书智能伙伴', url: 'https://www.feishu.cn/product/feishu-ai', rank: 2, recommend: '推荐', description: '企业协作首选', sortOrder: 2 },
  { category: 'AI办公工具', categoryIcon: 'O', name: '通义千问', url: 'https://tongyi.aliyun.com', rank: 3, recommend: null, description: '文档处理功能全', sortOrder: 3 },
  { category: 'AI办公工具', categoryIcon: 'O', name: 'WPS AI', url: 'https://ai.wps.cn', rank: 4, recommend: null, description: '办公文档智能', sortOrder: 4 }
]

const contestInfo = {
  title: '法务"AI副驾驶"设计大赛',
  subtitle: '让法务拥有自己的"AI副驾驶"！',
  badgeText: '海尔集团法务数字化创新',
  statPhases: '5',
  statTrainings: '10+',
  statCreative: '∞',
  infoParticipants: '海尔集团所有法务人员',
  infoRewards: '最终漏出作品，优先录入三金奖、月度奖等集团奖项，并优先获得发展。',
  infoHighlights: '零门槛参与，全程培训指导；创意无限，设计专属AI副驾驶；优秀创意落地实施。'
}

async function migrateData() {
  try {
    console.log('开始迁移数据...')
    
    await Training.destroy({ where: {}, truncate: true })
    await Stage.destroy({ where: {}, truncate: true })
    await AiTool.destroy({ where: {}, truncate: true })
    await ContestInfo.destroy({ where: {}, truncate: true })
    console.log('已清空现有数据')
    
    for (const t of trainings) {
      await Training.create({
        name: t.name,
        video_url: t.videoUrl,
        sort_order: t.sortOrder,
        status: 1
      })
    }
    console.log(`已插入 ${trainings.length} 条培训资料`)
    
    for (const s of stages) {
      await Stage.create({
        name: s.name,
        description: s.description,
        time_range: s.time,
        sort_order: s.sortOrder,
        status: s.status
      })
    }
    console.log(`已插入 ${stages.length} 个比赛阶段`)
    
    for (const t of aiTools) {
      await AiTool.create({
        category: t.category,
        category_icon: t.categoryIcon,
        name: t.name,
        url: t.url,
        rank: t.rank,
        recommend: t.recommend,
        description: t.description,
        sort_order: t.sortOrder,
        status: 1
      })
    }
    console.log(`已插入 ${aiTools.length} 个AI工具`)
    
    await ContestInfo.create({
      title: contestInfo.title,
      subtitle: contestInfo.subtitle,
      badge_text: contestInfo.badgeText,
      stat_phases: contestInfo.statPhases,
      stat_trainings: contestInfo.statTrainings,
      stat_creative: contestInfo.statCreative,
      info_participants: contestInfo.infoParticipants,
      info_rewards: contestInfo.infoRewards,
      info_highlights: contestInfo.infoHighlights
    })
    console.log('已插入大赛信息')
    
    console.log('数据迁移完成！')
    process.exit(0)
  } catch (error) {
    console.error('迁移失败:', error)
    process.exit(1)
  }
}

migrateData()
