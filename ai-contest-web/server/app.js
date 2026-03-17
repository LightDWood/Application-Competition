import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import db from './models/index.js'
import routes from './routes/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api', routes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  })
})

app.use((err, req, res, next) => {
  console.error('Server error:', err)
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      code: 400,
      message: '文件大小超过限制'
    })
  }
  
  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器错误'
  })
})

const startServer = async () => {
  try {
    await db.sequelize.authenticate()
    console.log('数据库连接成功')
    
    await db.sequelize.sync({ alter: true })
    console.log('数据库表同步完成')
    
    const { Admin } = db
    const adminCount = await Admin.count()
    
    if (adminCount === 0) {
      await Admin.create({
        username: 'admin',
        password_hash: 'admin123'
      })
      console.log('默认管理员已创建 (用户名: admin, 密码: admin123)')
    }
    
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`)
      console.log(`环境: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

startServer()

export default app
