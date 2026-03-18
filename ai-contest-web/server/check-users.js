import db from './models/index.js'

async function addRoleColumn() {
  try {
    const queryInterface = db.sequelize.getQueryInterface()
    
    // 检查 role 字段是否存在
    const tableDescription = await queryInterface.describeTable('users')
    
    if (tableDescription.role) {
      console.log('✅ role 字段已存在')
    } else {
      console.log('开始添加 role 字段...')
      
      // 添加 role 字段（ENUM 类型）
      await db.sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
      `)
      
      console.log('✅ role 字段添加成功')
    }
    
    // 查询所有用户
    const users = await db.sequelize.query(
      'SELECT id, username, email, role, created_at FROM users',
      { type: db.sequelize.QueryTypes.SELECT }
    )
    
    console.log('\n=== 用户列表 ===\n')
    console.log(`共找到 ${users.length} 个用户\n`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 用户名：${user.username}`)
      console.log(`   邮箱：${user.email}`)
      console.log(`   角色：${user.role}`)
      console.log(`   注册时间：${new Date(user.created_at).toLocaleString('zh-CN')}`)
      console.log()
    })
    
    console.log('=== 默认管理员账号 ===\n')
    console.log('用户名：admin')
    console.log('密码：admin123')
    console.log('角色：admin')
    console.log()
    
  } catch (error) {
    console.error('操作失败:', error)
  }
}

addRoleColumn()
