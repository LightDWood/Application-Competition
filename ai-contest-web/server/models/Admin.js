import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'
import bcrypt from 'bcryptjs'

class Admin extends Model {
  async validatePassword(password) {
    return bcrypt.compare(password, this.password_hash)
  }
}

Admin.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'admin'
  }
}, {
  sequelize,
  modelName: 'Admin',
  tableName: 'admins',
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.password_hash && !admin.password_hash.startsWith('$2a$')) {
        admin.password_hash = await bcrypt.hash(admin.password_hash, 10)
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('password_hash') && !admin.password_hash.startsWith('$2a$')) {
        admin.password_hash = await bcrypt.hash(admin.password_hash, 10)
      }
    }
  }
})

export default Admin
