import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class Registration extends Model {}

Registration.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  work_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  work_description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  user_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  user_employee_id: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'Registration',
  tableName: 'registrations'
})

export default Registration
