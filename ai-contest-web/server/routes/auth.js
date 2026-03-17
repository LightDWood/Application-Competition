import express from 'express'
import jwt from 'jsonwebtoken'
import db from '../models/index.js'

const router = express.Router()
const { Admin } = db

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空'
      })
    }
    
    const admin = await Admin.findOne({
      where: { username }
    })
    
    if (!admin) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }
    
    const isValidPassword = await admin.validatePassword(password)
    
    if (!isValidPassword) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }
    
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role
      },
      process.env.JWT_SECRET || 'ai-contest-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    )
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          role: admin.role
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

router.post('/change-password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body
    
    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        message: '参数不完整'
      })
    }
    
    const admin = await Admin.findOne({
      where: { username }
    })
    
    if (!admin) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }
    
    const isValidPassword = await admin.validatePassword(oldPassword)
    
    if (!isValidPassword) {
      return res.status(401).json({
        code: 401,
        message: '原密码错误'
      })
    }
    
    admin.password_hash = newPassword
    await admin.save()
    
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
