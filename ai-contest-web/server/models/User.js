import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'
import bcrypt from 'bcryptjs'

class User extends Model {
  async validatePassword(password) {
    return bcrypt.compare(password, this.password_hash)
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  avatar_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash && !user.password_hash.startsWith('$2a$')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10)
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash') && !user.password_hash.startsWith('$2a$')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10)
      }
    }
  }
})

export default User
