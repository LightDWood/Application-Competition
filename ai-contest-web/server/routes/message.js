import express from 'express'
import db from '../models/index.js'
import userAuthMiddleware from '../middleware/userAuth.js'
import skillService from '../services/skillService.js'

const router = express.Router({ mergeParams: true })
const { Session, Message } = db

router.get('/', userAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, pageSize = 50 } = req.query
    const offset = (page - 1) * pageSize
    
    const session = await Session.findOne({
      where: { id, user_id: req.user.id }
    })
    
    if (!session) {
      return res.status(404).json({ code: 404, message: '会话不存在' })
    }
    
    const { count, rows } = await Message.findAndCountAll({
      where: { session_id: id },
      order: [['created_at', 'ASC']],
      limit: parseInt(pageSize),
      offset: offset
    })
    
    res.json({
      code: 0,
      message: 'success',
      data: { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) }
    })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ code: 500, message: '获取消息列表失败' })
  }
})

router.post('/', userAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { content, role = 'user' } = req.body
    
    if (!content) {
      return res.status(400).json({ code: 400, message: '消息内容不能为空' })
    }
    
    const session = await Session.findOne({
      where: { id, user_id: req.user.id }
    })
    
    if (!session) {
      return res.status(404).json({ code: 404, message: '会话不存在' })
    }
    
    const message = await Message.create({
      session_id: id,
      role,
      content
    })
    
    await session.update({ last_message_at: new Date() })
    
    res.status(201).json({ code: 0, message: '创建成功', data: message })
  } catch (error) {
    console.error('Create message error:', error)
    res.status(500).json({ code: 500, message: '创建消息失败' })
  }
})

router.post('/chat', userAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body
    
    if (!content) {
      return res.status(400).json({ code: 400, message: '消息内容不能为空' })
    }
    
    const session = await Session.findOne({
      where: { id, user_id: req.user.id }
    })
    
    if (!session) {
      return res.status(404).json({ code: 404, message: '会话不存在' })
    }
    
    await Message.create({
      session_id: id,
      role: 'user',
      content
    })
    
    await session.update({ last_message_at: new Date() })
    
    const history = await Message.findAll({
      where: { session_id: id },
      order: [['created_at', 'ASC']],
      attributes: ['role', 'content']
    })
    
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    
    let fullResponse = ''
    let metadata = null
    
    try {
      for await (const chunk of skillService.streamResponse(content, history)) {
        if (chunk.type === 'chunk') {
          fullResponse += chunk.content
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk.content })}\n\n`)
        } else if (chunk.type === 'complete') {
          metadata = chunk.metadata
          res.write(`data: ${JSON.stringify({ type: 'complete', metadata })}\n\n`)
        }
      }
    } catch (streamError) {
      console.error('Stream error:', streamError)
      res.write(`data: ${JSON.stringify({ type: 'error', message: '生成响应失败' })}\n\n`)
    }
    
    const assistantMessage = await Message.create({
      session_id: id,
      role: 'assistant',
      content: fullResponse,
      metadata
    })
    
    await session.update({ last_message_at: new Date() })
    
    res.write(`data: ${JSON.stringify({ type: 'done', messageId: assistantMessage.id })}\n\n`)
    res.end()
    
  } catch (error) {
    console.error('Chat error:', error)
    if (!res.headersSent) {
      res.status(500).json({ code: 500, message: '处理消息失败' })
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: '处理消息失败' })}\n\n`)
      res.end()
    }
  }
})

router.put('/:messageId', userAuthMiddleware, async (req, res) => {
  try {
    const { id, messageId } = req.params
    const { content } = req.body
    
    if (!content) {
      return res.status(400).json({ code: 400, message: '消息内容不能为空' })
    }
    
    const session = await Session.findOne({
      where: { id, user_id: req.user.id }
    })
    
    if (!session) {
      return res.status(404).json({ code: 404, message: '会话不存在' })
    }
    
    const message = await Message.findOne({
      where: { id: messageId, session_id: id }
    })
    
    if (!message) {
      return res.status(404).json({ code: 404, message: '消息不存在' })
    }
    
    if (message.role !== 'user') {
      return res.status(403).json({ code: 403, message: '只能编辑用户消息' })
    }
    
    message.content = content
    message.metadata = { ...message.metadata, edited: true, edited_at: new Date() }
    await message.save()
    
    res.json({ code: 0, message: '更新成功', data: message })
  } catch (error) {
    console.error('Update message error:', error)
    res.status(500).json({ code: 500, message: '更新消息失败' })
  }
})

export default router
