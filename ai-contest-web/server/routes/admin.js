import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { Op } from 'sequelize';

const router = express.Router();

// 管理员权限验证中间件
const requireAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'ai-contest-secret-key'
    );

    const user = await User.findByPk(decoded.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '无管理员权限'
      });
    }

    req.user = { id: user.id, username: user.username, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: '认证令牌无效'
    });
  }
};

// 获取用户列表
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search = '', role = '' } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const whereCondition = {};
    
    if (search) {
      whereCondition[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (role) {
      whereCondition.role = role;
    }

    const users = await User.findAndCountAll({
      where: whereCondition,
      attributes: ['id', 'username', 'email', 'role', 'created_at'],
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });

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
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户列表失败',
      error: error.message
    });
  }
});

// 获取用户详情
router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'role', 'created_at', 'updated_at']
    });

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取用户详情成功',
      data: user
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户详情失败',
      error: error.message
    });
  }
});

// 删除用户
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    // 不允许删除自己
    // TODO: 实际应用中需要获取当前用户ID来验证
    if (user.id === req.user.id) {
      return res.status(400).json({
        code: 400,
        message: '不能删除自己'
      });
    }

    await user.destroy();

    res.json({
      code: 200,
      message: '删除用户成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除用户失败',
      error: error.message
    });
  }
});

// 更新用户角色
router.put('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        code: 400,
        message: '角色参数无效，必须是 user 或 admin'
      });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    // 不允许更改自己的角色
    // TODO: 实际应用中需要获取当前用户ID来验证
    if (user.id === req.user.id) {
      return res.status(400).json({
        code: 400,
        message: '不能更改自己的角色'
      });
    }

    await user.update({ role });

    res.json({
      code: 200,
      message: '更新用户角色成功',
      data: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('更新用户角色失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新用户角色失败',
      error: error.message
    });
  }
});

export default router;