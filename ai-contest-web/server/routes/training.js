import express from 'express'
import db from '../models/index.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()
const { Training } = db

router.get('/', async (req, res) => {
  try {
    const trainings = await Training.findAll({
      where: { status: 1 },
      order: [['sort_order', 'ASC'], ['id', 'DESC']]
    })
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        list: trainings.map(t => ({
          id: t.id,
          name: t.name,
          videoUrl: t.video_url,
          coverImage: t.cover_image,
          sortOrder: t.sort_order,
          status: t.status,
          createdAt: t.created_at
        })),
        total: trainings.length
      }
    })
  } catch (error) {
    console.error('Get trainings error:', error)
    res.status(500).json({
      code: 500,
      message: '获取培训资料失败'
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const training = await Training.findByPk(id)
    
    if (!training) {
      return res.status(404).json({
        code: 404,
        message: '培训资料不存在'
      })
    }
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        id: training.id,
        name: training.name,
        videoUrl: training.video_url,
        coverImage: training.cover_image,
        sortOrder: training.sort_order,
        status: training.status,
        createdAt: training.created_at
      }
    })
  } catch (error) {
    console.error('Get training error:', error)
    res.status(500).json({
      code: 500,
      message: '获取培训资料失败'
    })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, videoUrl, coverImage, sortOrder } = req.body
    
    if (!name || !videoUrl) {
      return res.status(400).json({
        code: 400,
        message: '培训名称和视频链接不能为空'
      })
    }
    
    const training = await Training.create({
      name,
      video_url: videoUrl,
      cover_image: coverImage || null,
      sort_order: sortOrder || 0
    })
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        id: training.id,
        name: training.name,
        videoUrl: training.video_url,
        coverImage: training.cover_image,
        sortOrder: training.sort_order,
        status: training.status,
        createdAt: training.created_at
      }
    })
  } catch (error) {
    console.error('Create training error:', error)
    res.status(500).json({
      code: 500,
      message: '创建培训资料失败'
    })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { name, videoUrl, coverImage, sortOrder, status } = req.body
    
    const training = await Training.findByPk(id)
    
    if (!training) {
      return res.status(404).json({
        code: 404,
        message: '培训资料不存在'
      })
    }
    
    if (name !== undefined) training.name = name
    if (videoUrl !== undefined) training.video_url = videoUrl
    if (coverImage !== undefined) training.cover_image = coverImage
    if (sortOrder !== undefined) training.sort_order = sortOrder
    if (status !== undefined) training.status = status
    
    await training.save()
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        id: training.id,
        name: training.name,
        videoUrl: training.video_url,
        coverImage: training.cover_image,
        sortOrder: training.sort_order,
        status: training.status,
        createdAt: training.created_at
      }
    })
  } catch (error) {
    console.error('Update training error:', error)
    res.status(500).json({
      code: 500,
      message: '更新培训资料失败'
    })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    const training = await Training.findByPk(id)
    
    if (!training) {
      return res.status(404).json({
        code: 404,
        message: '培训资料不存在'
      })
    }
    
    await training.destroy()
    
    res.json({
      code: 0,
      message: '删除成功'
    })
  } catch (error) {
    console.error('Delete training error:', error)
    res.status(500).json({
      code: 500,
      message: '删除培训资料失败'
    })
  }
})

export default router
