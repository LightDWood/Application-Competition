import db from './models/index.js'

async function cleanUserData() {
  try {
    const { User } = db
    
    console.log('=== 开始清理用户数据 ===\n')
    
    // 查询所有用户
    const allUsers = await db.sequelize.query(
      'SELECT id, username, email, role, created_at FROM users',
      { type: db.sequelize.QueryTypes.SELECT }
    )
    
    console.log('清理前:')
    allUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username} (${user.email}) - 角色: ${user.role}`)
    })
    console.log()
    
    // 1. 删除错误注册的 admin@163.com 用户
    const wrongAdmin = await User.findOne({
      where: { email: 'admin@163.com' }
    })
    
    if (wrongAdmin) {
      console.log('发现错误注册的 admin 用户 (admin@163.com)，正在删除...')
      await wrongAdmin.destroy()
      console.log('✅ 已删除\n')
    }
    
    // 2. 检查是否已存在正确的管理员账号
    let correctAdmin = await User.findOne({
      where: { email: 'admin@ai-contest.com' }
    })
    
    if (!correctAdmin) {
      console.log('创建正确的管理员账号...')
      // 需要先确保 admin 用户不存在
      const existingAdmin = await User.findOne({
        where: { username: 'admin' }
      })
      
      if (existingAdmin) {
        console.log('发现残留的 admin 用户，正在删除...')
        await existingAdmin.destroy()
      }
      
      // 创建正确的管理员账号
      correctAdmin = await User.create({
        username: 'admin',
        email: 'admin@ai-contest.com',
        password_hash: 'admin123',  // 会自动哈希
        role: 'admin'
      })
      console.log('✅ 管理员账号已创建\n')
    } else {
      // 确保角色是 admin
      if (correctAdmin.role !== 'admin') {
        console.log('更新管理员角色...')
        correctAdmin.role = 'admin'
        await correctAdmin.save()
        console.log('✅ 管理员角色已更新\n')
      }
    }
    
    // 3. 确保 test 用户存在且角色为 user
    let testUser = await User.findOne({
      where: { username: 'test' }
    })
    
    if (testUser && testUser.role !== 'user') {
      testUser.role = 'user'
      await testUser.save()
      console.log('✅ test 用户角色已更新为 user\n')
    }
    
    // 4. 确保 213 用户存在且角色为 user
    let user213 = await User.findOne({
      where: { username: '213' }
    })
    
    if (user213 && user213.role !== 'user') {
      user213.role = 'user'
      await user213.save()
      console.log('✅ 213 用户角色已更新为 user\n')
    }
    
    // 查询清理后的所有用户
    const cleanUsers = await db.sequelize.query(
      'SELECT id, username, email, role, created_at FROM users',
      { type: db.sequelize.QueryTypes.SELECT }
    )
    
    console.log('=== 清理后的用户列表 ===\n')
    console.log(`共 ${cleanUsers.length} 个用户:\n`)
    
    cleanUsers.forEach((user, index) => {
      console.log(`${index + 1}. 用户名: ${user.username}`)
      console.log(`   邮箱: ${user.email}`)
      console.log(`   角色: ${user.role}`)
      console.log(`   注册时间: ${new Date(user.created_at).toLocaleString('zh-CN')}`)
      console.log()
    })
    
    console.log('=== 账号信息 ===\n')
    console.log('【管理员账号】')
    console.log('  用户名: admin')
    console.log('  密码: admin123')
    console.log('  角色: admin')
    console.log()
    console.log('【一般用户账号】')
    cleanUsers.filter(u => u.role === 'user').forEach((user, index) => {
      console.log(`  ${index + 1}. 用户名: ${user.username} / 邮箱: ${user.email}`)
    })
    console.log()
    
  } catch (error) {
    console.error('清理失败:', error)
  }
  
  process.exit(0)
}

cleanUserData()
