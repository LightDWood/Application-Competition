import express from 'express'
import db from '../models/index.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()
const { ContestInfo, Stage, AiTool } = db

router.get('/info', async (req, res) => {
  try {
    let contestInfo = await ContestInfo.findOne()
    
    if (!contestInfo) {
      contestInfo = await ContestInfo.create({
        title: '法务"AI副驾驶"设计大赛',
        subtitle: '让法务拥有自己的"AI副驾驶"！',
        badge_text: '海尔集团法务数字化创新',
        stat_phases: '5',
        stat_trainings: '10+',
        stat_creative: '∞'
      })
    }
    
    const stages = await Stage.findAll({
      order: [['sort_order', 'ASC'], ['id', 'ASC']]
    })
    
    const tools = await AiTool.findAll({
      where: { status: 1 },
      order: [['category', 'ASC'], ['sort_order', 'ASC'], ['rank', 'ASC']]
    })
    
    const aiToolsMap = {}
    tools.forEach(tool => {
      if (!aiToolsMap[tool.category]) {
        aiToolsMap[tool.category] = {
          category: tool.category,
          icon: tool.category_icon,
          tools: []
        }
      }
      aiToolsMap[tool.category].tools.push({
        name: tool.name,
        url: tool.url,
        rank: tool.rank,
        recommend: tool.recommend,
        desc: tool.description
      })
    })
    
    const infoCards = []
    if (contestInfo.info_participants) {
      infoCards.push({
        icon: '👥',
        title: '参赛对象',
        content: contestInfo.info_participants
      })
    }
    if (contestInfo.info_rewards) {
      infoCards.push({
        icon: '🏆',
        title: '奖励机制',
        content: contestInfo.info_rewards
      })
    }
    if (contestInfo.info_highlights) {
      infoCards.push({
        icon: '✨',
        title: '大赛亮点',
        content: contestInfo.info_highlights
      })
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        title: contestInfo.title,
        subtitle: contestInfo.subtitle,
        badgeText: contestInfo.badge_text,
        statPhases: contestInfo.stat_phases,
        statTrainings: contestInfo.stat_trainings,
        statCreative: contestInfo.stat_creative,
        posterUrl: contestInfo.poster_url,
        infoCards,
        stages: stages.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          time: s.time_range,
          sortOrder: s.sort_order,
          status: s.status
        })),
        aiTools: Object.values(aiToolsMap)
      }
    })
  } catch (error) {
    console.error('Get contest info error:', error)
    res.status(500).json({
      code: 500,
      message: '获取大赛信息失败'
    })
  }
})

router.put('/info', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      subtitle,
      badgeText,
      statPhases,
      statTrainings,
      statCreative,
      posterUrl,
      infoParticipants,
      infoRewards,
      infoHighlights
    } = req.body
    
    let contestInfo = await ContestInfo.findOne()
    
    if (!contestInfo) {
      contestInfo = await ContestInfo.create({})
    }
    
    if (title !== undefined) contestInfo.title = title
    if (subtitle !== undefined) contestInfo.subtitle = subtitle
    if (badgeText !== undefined) contestInfo.badge_text = badgeText
    if (statPhases !== undefined) contestInfo.stat_phases = statPhases
    if (statTrainings !== undefined) contestInfo.stat_trainings = statTrainings
    if (statCreative !== undefined) contestInfo.stat_creative = statCreative
    if (posterUrl !== undefined) contestInfo.poster_url = posterUrl
    if (infoParticipants !== undefined) contestInfo.info_participants = infoParticipants
    if (infoRewards !== undefined) contestInfo.info_rewards = infoRewards
    if (infoHighlights !== undefined) contestInfo.info_highlights = infoHighlights
    
    await contestInfo.save()
    
    res.json({
      code: 0,
      message: '更新成功',
      data: {
        title: contestInfo.title,
        subtitle: contestInfo.subtitle,
        badgeText: contestInfo.badge_text,
        statPhases: contestInfo.stat_phases,
        statTrainings: contestInfo.stat_trainings,
        statCreative: contestInfo.stat_creative,
        posterUrl: contestInfo.poster_url
      }
    })
  } catch (error) {
    console.error('Update contest info error:', error)
    res.status(500).json({
      code: 500,
      message: '更新大赛信息失败'
    })
  }
})

router.get('/stages', async (req, res) => {
  try {
    const stages = await Stage.findAll({
      order: [['sort_order', 'ASC'], ['id', 'ASC']]
    })
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        list: stages.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          time: s.time_range,
          sortOrder: s.sort_order,
          status: s.status
        })),
        total: stages.length
      }
    })
  } catch (error) {
    console.error('Get stages error:', error)
    res.status(500).json({
      code: 500,
      message: '获取比赛阶段失败'
    })
  }
})

router.post('/stages', authMiddleware, async (req, res) => {
  try {
    const { name, description, time, sortOrder, status } = req.body
    
    if (!name) {
      return res.status(400).json({
        code: 400,
        message: '阶段名称不能为空'
      })
    }
    
    const stage = await Stage.create({
      name,
      description: description || null,
      time_range: time || null,
      sort_order: sortOrder || 0,
      status: status !== undefined ? status : 1
    })
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        id: stage.id,
        name: stage.name,
        description: stage.description,
        time: stage.time_range,
        sortOrder: stage.sort_order,
        status: stage.status
      }
    })
  } catch (error) {
    console.error('Create stage error:', error)
    res.status(500).json({
      code: 500,
      message: '创建比赛阶段失败'
    })
  }
})

router.put('/stages/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, time, sortOrder, status } = req.body
    
    const stage = await Stage.findByPk(id)
    
    if (!stage) {
      return res.status(404).json({
        code: 404,
        message: '比赛阶段不存在'
      })
    }
    
    if (name !== undefined) stage.name = name
    if (description !== undefined) stage.description = description
    if (time !== undefined) stage.time_range = time
    if (sortOrder !== undefined) stage.sort_order = sortOrder
    if (status !== undefined) stage.status = status
    
    await stage.save()
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        id: stage.id,
        name: stage.name,
        description: stage.description,
        time: stage.time_range,
        sortOrder: stage.sort_order,
        status: stage.status
      }
    })
  } catch (error) {
    console.error('Update stage error:', error)
    res.status(500).json({
      code: 500,
      message: '更新比赛阶段失败'
    })
  }
})

router.delete('/stages/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    const stage = await Stage.findByPk(id)
    
    if (!stage) {
      return res.status(404).json({
        code: 404,
        message: '比赛阶段不存在'
      })
    }
    
    await stage.destroy()
    
    res.json({
      code: 0,
      message: '删除成功'
    })
  } catch (error) {
    console.error('Delete stage error:', error)
    res.status(500).json({
      code: 500,
      message: '删除比赛阶段失败'
    })
  }
})

router.get('/tools', async (req, res) => {
  try {
    const tools = await AiTool.findAll({
      order: [['category', 'ASC'], ['sort_order', 'ASC'], ['rank', 'ASC']]
    })
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        list: tools.map(t => ({
          id: t.id,
          category: t.category,
          categoryIcon: t.category_icon,
          name: t.name,
          url: t.url,
          rank: t.rank,
          recommend: t.recommend,
          description: t.description,
          sortOrder: t.sort_order,
          status: t.status
        })),
        total: tools.length
      }
    })
  } catch (error) {
    console.error('Get ai tools error:', error)
    res.status(500).json({
      code: 500,
      message: '获取AI工具失败'
    })
  }
})

router.post('/tools', authMiddleware, async (req, res) => {
  try {
    const { category, categoryIcon, name, url, rank, recommend, description, sortOrder, status } = req.body
    
    if (!category || !name || !url) {
      return res.status(400).json({
        code: 400,
        message: '分类、名称和链接不能为空'
      })
    }
    
    const tool = await AiTool.create({
      category,
      category_icon: categoryIcon || null,
      name,
      url,
      rank: rank || 0,
      recommend: recommend || null,
      description: description || null,
      sort_order: sortOrder || 0,
      status: status !== undefined ? status : 1
    })
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        id: tool.id,
        category: tool.category,
        categoryIcon: tool.category_icon,
        name: tool.name,
        url: tool.url,
        rank: tool.rank,
        recommend: tool.recommend,
        description: tool.description,
        sortOrder: tool.sort_order,
        status: tool.status
      }
    })
  } catch (error) {
    console.error('Create ai tool error:', error)
    res.status(500).json({
      code: 500,
      message: '创建AI工具失败'
    })
  }
})

router.put('/tools/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { category, categoryIcon, name, url, rank, recommend, description, sortOrder, status } = req.body
    
    const tool = await AiTool.findByPk(id)
    
    if (!tool) {
      return res.status(404).json({
        code: 404,
        message: 'AI工具不存在'
      })
    }
    
    if (category !== undefined) tool.category = category
    if (categoryIcon !== undefined) tool.category_icon = categoryIcon
    if (name !== undefined) tool.name = name
    if (url !== undefined) tool.url = url
    if (rank !== undefined) tool.rank = rank
    if (recommend !== undefined) tool.recommend = recommend
    if (description !== undefined) tool.description = description
    if (sortOrder !== undefined) tool.sort_order = sortOrder
    if (status !== undefined) tool.status = status
    
    await tool.save()
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        id: tool.id,
        category: tool.category,
        categoryIcon: tool.category_icon,
        name: tool.name,
        url: tool.url,
        rank: tool.rank,
        recommend: tool.recommend,
        description: tool.description,
        sortOrder: tool.sort_order,
        status: tool.status
      }
    })
  } catch (error) {
    console.error('Update ai tool error:', error)
    res.status(500).json({
      code: 500,
      message: '更新AI工具失败'
    })
  }
})

router.delete('/tools/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    const tool = await AiTool.findByPk(id)
    
    if (!tool) {
      return res.status(404).json({
        code: 404,
        message: 'AI工具不存在'
      })
    }
    
    await tool.destroy()
    
    res.json({
      code: 0,
      message: '删除成功'
    })
  } catch (error) {
    console.error('Delete ai tool error:', error)
    res.status(500).json({
      code: 500,
      message: '删除AI工具失败'
    })
  }
})

export default router
