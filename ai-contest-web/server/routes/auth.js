import express from 'express'
import jwt from 'jsonwebtoken'
import db from '../models/index.js'
import { sanitizeForLog, sanitizeError } from '../utils/sanitize.js'

const router = express.Router()
const { User } = db

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
        [db.Sequelize.Op.or]: [
          { username },
          { email: username }
        ]
      }
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

    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    )

    const refreshToken = jwt.sign(
      {
        id: user.id,
        type: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({
      code: 0,
      message: 'success',
      data: {
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          is_active: user.is_active
        }
      }
    })
  } catch (error) {
    console.error('Login error:', sanitizeError(error))
    res.status(500).json({
      code: 500,
      message: '登录失败'
    })
  }
})

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res.status(401).json({
        code: 401,
        message: 'Refresh Token缺失'
      })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        code: 401,
        message: '无效的Refresh Token'
      })
    }

    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在'
      })
    }

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    )

    const newRefreshToken = jwt.sign(
      {
        id: user.id,
        type: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    )

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({
      code: 0,
      data: { accessToken: newAccessToken }
    })
  } catch (error) {
    console.error('Refresh error:', sanitizeError(error))
    res.status(401).json({
      code: 401,
      message: 'Refresh Token无效'
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

    const user = await User.findOne({
      where: { username }
    })

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
    console.error('Change password error:', sanitizeError(error))
    res.status(500).json({
      code: 500,
      message: '密码修改失败'
    })
  }
})

export default router
