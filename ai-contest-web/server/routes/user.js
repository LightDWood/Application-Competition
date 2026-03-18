import express from 'express'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import db from '../models/index.js'
import userAuthMiddleware from '../middleware/userAuth.js'

const router = express.Router()
const { User } = db

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    
    if (!username || !email || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名、邮箱和密码不能为空'
      })
    }
    
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    })
    
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({
          code: 400,
          message: '用户名已存在'
        })
      }
      return res.status(400).json({
        code: 400,
        message: '邮箱已被注册'
      })
    }
    
    const user = await User.create({
      username,
      email,
      password_hash: password,
      role: 'user'  // 默认角色为一般用户
    })
    
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET || 'ai-contest-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    
    res.status(201).json({
      code: 0,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,  // 新增
          avatar_url: user.avatar_url,
          created_at: user.created_at
        }
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      code: 500,
      message: '注册失败'
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空'
      })
    }
    
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email: username }
        ]
      },
      attributes: ['id', 'username', 'email', 'password_hash', 'role', 'avatar_url', 'is_active', 'created_at', 'last_login_at']
    })
    
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }
    
    if (!user.is_active) {
      return res.status(403).json({
        code: 403,
        message: '账号已被禁用'
      })
    }
    
    const isValidPassword = await user.validatePassword(password)
    
    if (!isValidPassword) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }
    
    await user.update({ last_login_at: new Date() })
    
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET || 'ai-contest-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    
    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          created_at: user.created_at
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      code: 500,
      message: '登录失败'
    })
  }
})

router.post('/logout', userAuthMiddleware, async (req, res) => {
  res.json({
    code: 0,
    message: '登出成功'
  })
})

router.get('/profile', userAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'avatar_url', 'created_at', 'last_login_at']
    })
    
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: user
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      code: 500,
      message: '获取用户信息失败'
    })
  }
})

router.put('/profile', userAuthMiddleware, async (req, res) => {
  try {
    const { username, avatar_url } = req.body
    const user = await User.findByPk(req.user.id)
    
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }
    
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } })
      if (existingUser) {
        return res.status(400).json({
          code: 400,
          message: '用户名已存在'
        })
      }
      user.username = username
    }
    
    if (avatar_url !== undefined) {
      user.avatar_url = avatar_url
    }
    
    await user.save()
    
    res.json({
      code: 0,
      message: '更新成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      code: 500,
      message: '更新用户信息失败'
    })
  }
})

router.post('/change-password', userAuthMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        message: '原密码和新密码不能为空'
      })
    }
    
    const user = await User.findByPk(req.user.id)
    
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }
    
    const isValidPassword = await user.validatePassword(oldPassword)
    
    if (!isValidPassword) {
      return res.status(401).json({
        code: 401,
        message: '原密码错误'
      })
    }
    
    user.password_hash = newPassword
    await user.save()
    
    res.json({
      code: 0,
      message: '密码修改成功'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      code: 500,
      message: '密码修改失败'
    })
  }
})

export default router
