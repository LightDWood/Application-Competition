import jwt from 'jsonwebtoken'

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      })
    }
    
    const token = authHeader.split(' ')[1]
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ai-contest-secret-key')
    
    req.admin = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    }
    
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        code: 401,
        message: '无效的认证令牌'
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '认证令牌已过期'
      })
    }
    return res.status(500).json({
      code: 500,
      message: '认证失败'
    })
  }
}

export default authMiddleware
