import express from 'express'
import User from '../models/User.js'
import { Op } from 'sequelize'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

router.get('/users', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      code: 403,
      message: '需要管理员权限'
    })
  }

  try {
    const { page = 1, pageSize = 10, search = '', role = '' } = req.query

    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    const limit = parseInt(pageSize)

    const whereCondition = {}

    if (search) {
      whereCondition[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    }

    if (role) {
      whereCondition.role = role
    }

    const users = await User.findAndCountAll({
      where: whereCondition,
      attributes: ['id', 'username', 'email', 'role', 'created_at'],
      offset,
      limit,
      order: [['created_at', 'DESC']]
    })

    res.json({
      code: 200,
      message: '获取用户列表成功',
      data: {
        users: users.rows,
        total: users.count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(users.count / pageSize)
      }
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取用户列表失败',
      error: error.message
    })
  }
})

router.get('/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      code: 403,
      message: '需要管理员权限'
    })
  }

  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'role', 'created_at', 'updated_at']
    })

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    res.json({
      code: 200,
      message: '获取用户详情成功',
      data: user
    })
  } catch (error) {
    console.error('获取用户详情失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取用户详情失败',
      error: error.message
    })
  }
})

router.delete('/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      code: 403,
      message: '需要管理员权限'
    })
  }

  try {
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    if (user.id === req.user.id) {
      return res.status(400).json({
        code: 400,
        message: '不能删除自己'
      })
    }

    await user.destroy()

    res.json({
      code: 200,
      message: '删除用户成功'
    })
  } catch (error) {
    console.error('删除用户失败:', error)
    res.status(500).json({
      code: 500,
      message: '删除用户失败',
      error: error.message
    })
  }
})

router.put('/users/:id/role', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      code: 403,
      message: '需要管理员权限'
    })
  }

  try {
    const { role } = req.body

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        code: 400,
        message: '角色参数无效，必须是 user 或 admin'
      })
    }

    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    if (user.id === req.user.id) {
      return res.status(400).json({
        code: 400,
        message: '不能更改自己的角色'
      })
    }

    await user.update({ role })

    res.json({
      code: 200,
      message: '更新用户角色成功',
      data: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    })
  } catch (error) {
    console.error('更新用户角色失败:', error)
    res.status(500).json({
      code: 500,
      message: '更新用户角色失败',
      error: error.message
    })
  }
})

export default router
