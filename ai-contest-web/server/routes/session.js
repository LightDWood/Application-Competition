import express from 'express'
import { Op } from 'sequelize'
import db from '../models/index.js'
import userAuthMiddleware from '../middleware/userAuth.js'
import messageRoutes from './message.js'

const router = express.Router()
const { Session, Message } = db

router.get('/', userAuthMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status, search } = req.query
    const offset = (page - 1) * pageSize
    
    const whereClause = {
      user_id: req.user.id
    }
    
    if (status && ['active', 'archived', 'deleted'].includes(status)) {
      whereClause.status = status
    }
    
    if (search) {
      whereClause.title = {
        [Op.like]: `%${search}%`
      }
    }
    
    const { count, rows } = await Session.findAndCountAll({
      where: whereClause,
      order: [['last_message_at', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: offset,
      include: [{
        model: Message,
        as: 'messages',
        limit: 1,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'role', 'content', 'created_at']
      }]
    })
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    res.status(500).json({
      code: 500,
      message: '获取会话列表失败'
    })
  }
})

router.post('/', userAuthMiddleware, async (req, res) => {
  try {
    const { title } = req.body
    
    const session = await Session.create({
      user_id: req.user.id,
      title: title || '新会话',
      status: 'active'
    })
    
    res.status(201).json({
      code: 0,
      message: '创建成功',
      data: session
    })
  } catch (error) {
    console.error('Create session error:', error)
    res.status(500).json({
      code: 500,
      message: '创建会话失败'
    })
  }
})

router.get('/:id', userAuthMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    })
    
    if (!session) {
      return res.status(404).json({
        code: 404,
        message: '会话不存在'
      })
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: session
    })
  } catch (error) {
    console.error('Get session error:', error)
    res.status(500).json({
      code: 500,
      message: '获取会话详情失败'
    })
  }
})

router.put('/:id', userAuthMiddleware, async (req, res) => {
  try {
    const { title, status } = req.body
    
    const session = await Session.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    })
    
    if (!session) {
      return res.status(404).json({
        code: 404,
        message: '会话不存在'
      })
    }
    
    if (title !== undefined) {
      session.title = title
    }
    
    if (status !== undefined && ['active', 'archived', 'deleted'].includes(status)) {
      session.status = status
    }
    
    await session.save()
    
    res.json({
      code: 0,
      message: '更新成功',
      data: session
    })
  } catch (error) {
    console.error('Update session error:', error)
    res.status(500).json({
      code: 500,
      message: '更新会话失败'
    })
  }
})

router.delete('/:id', userAuthMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    })
    
    if (!session) {
      return res.status(404).json({
        code: 404,
        message: '会话不存在'
      })
    }
    
    await session.destroy()
    
    res.json({
      code: 0,
      message: '删除成功'
    })
  } catch (error) {
    console.error('Delete session error:', error)
    res.status(500).json({
      code: 500,
      message: '删除会话失败'
    })
  }
})

router.use('/:id/messages', messageRoutes)

export default router
