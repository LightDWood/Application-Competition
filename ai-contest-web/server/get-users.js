import db from './models/index.js'

async function getUsers() {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'createdAt']
    })
    
    console.log('\n=== 用户列表 ===\n')
    console.log(`共找到 ${users.length} 个用户\n`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 用户名：${user.username}`)
      console.log(`   邮箱：${user.email}`)
      console.log(`   角色：${user.role}`)
      console.log(`   注册时间：${user.createdAt.toLocaleString('zh-CN')}`)
      console.log()
    })
    
    console.log('=== 默认管理员账号 ===\n')
    console.log('用户名：admin')
    console.log('密码：admin123')
    console.log('角色：admin')
    console.log()
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

getUsers()
