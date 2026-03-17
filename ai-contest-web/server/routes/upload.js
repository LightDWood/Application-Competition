import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import authMiddleware from '../middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

const uploadDir = path.join(__dirname, '../uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`
    cb(null, filename)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件类型'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
  }
})

router.post('/image', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择要上传的图片'
      })
    }
    
    const fileUrl = `/uploads/${req.file.filename}`
    
    res.json({
      code: 0,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      code: 500,
      message: '上传失败'
    })
  }
})

router.use('/uploads', express.static(uploadDir))

export default router
