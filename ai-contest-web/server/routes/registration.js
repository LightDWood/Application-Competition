import express from 'express'
import db from '../models/index.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()
const { Registration } = db

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, keyword, page = 1, pageSize = 20 } = req.query
    
    const whereClause = {}
    
    if (status !== undefined && status !== '') {
      whereClause.status = parseInt(status)
    }
    
    if (keyword) {
      const { Op } = db.sequelize.Sequelize
      whereClause[Op.or] = [
        { work_name: { [Op.like]: `%${keyword}%` } },
        { user_name: { [Op.like]: `%${keyword}%` } },
        { user_employee_id: { [Op.like]: `%${keyword}%` } }
      ]
    }
    
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    
    const { count, rows } = await Registration.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset
    })
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        list: rows.map(r => ({
          id: r.id,
          workName: r.work_name,
          workDescription: r.work_description,
          userName: r.user_name,
          userEmployeeId: r.user_employee_id,
          status: r.status,
          createdAt: r.created_at
        })),
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('Get registrations error:', error)
    res.status(500).json({
      code: 500,
      message: '获取报名列表失败'
    })
  }
})

router.post('/', async (req, res) => {
  try {
    const { workName, workDescription, userName, userEmployeeId } = req.body
    
    if (!workName || !workDescription || !userName || !userEmployeeId) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整的报名信息'
      })
    }
    
    const registration = await Registration.create({
      work_name: workName.trim(),
      work_description: workDescription.trim(),
      user_name: userName.trim(),
      user_employee_id: userEmployeeId.trim()
    })
    
    res.json({
      code: 0,
      message: '报名提交成功',
      data: {
        id: registration.id,
        workName: registration.work_name,
        workDescription: registration.work_description,
        userName: registration.user_name,
        userEmployeeId: registration.user_employee_id,
        status: registration.status,
        createdAt: registration.created_at
      }
    })
  } catch (error) {
    console.error('Create registration error:', error)
    res.status(500).json({
      code: 500,
      message: '报名提交失败'
    })
  }
})

router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    if (status === undefined || ![0, 1, 2].includes(parseInt(status))) {
      return res.status(400).json({
        code: 400,
        message: '无效的状态值'
      })
    }
    
    const registration = await Registration.findByPk(id)
    
    if (!registration) {
      return res.status(404).json({
        code: 404,
        message: '报名记录不存在'
      })
    }
    
    registration.status = parseInt(status)
    await registration.save()
    
    res.json({
      code: 0,
      message: '状态更新成功',
      data: {
        id: registration.id,
        status: registration.status
      }
    })
  } catch (error) {
    console.error('Update registration status error:', error)
    res.status(500).json({
      code: 500,
      message: '更新状态失败'
    })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    const registration = await Registration.findByPk(id)
    
    if (!registration) {
      return res.status(404).json({
        code: 404,
        message: '报名记录不存在'
      })
    }
    
    await registration.destroy()
    
    res.json({
      code: 0,
      message: '删除成功'
    })
  } catch (error) {
    console.error('Delete registration error:', error)
    res.status(500).json({
      code: 500,
      message: '删除报名记录失败'
    })
  }
})

router.get('/export', authMiddleware, async (req, res) => {
  try {
    const registrations = await Registration.findAll({
      order: [['created_at', 'DESC']]
    })
    
    const exportData = registrations.map((r, index) => ({
      '序号': index + 1,
      '作品名称': r.work_name,
      '作品概述': r.work_description,
      '参赛人姓名': r.user_name,
      '参赛人工号': r.user_employee_id,
      '状态': r.status === 0 ? '待审核' : (r.status === 1 ? '通过' : '驳回'),
      '提交时间': r.created_at
    }))
    
    res.json({
      code: 0,
      message: 'success',
      data: exportData
    })
  } catch (error) {
    console.error('Export registrations error:', error)
    res.status(500).json({
      code: 500,
      message: '导出失败'
    })
  }
})

export default router
