import db from './models/index.js'
import jwt from 'jsonwebtoken'

async function testLogin() {
  const { User } = db

  const user = await User.findOne({
    where: { username: 'admin' },
    attributes: ['id', 'username', 'email', 'role', 'avatar_url', 'created_at']
  })

  console.log('User from DB:', JSON.stringify(user, null, 2))

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email
    },
    process.env.JWT_SECRET || 'ai-contest-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

  const response = {
    code: 0,
    message: '登录成功',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      }
    }
  }

  console.log('\nResponse:', JSON.stringify(response, null, 2))
}

testLogin().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
