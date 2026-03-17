import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class AiTool extends Model {}

AiTool.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  category_icon: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  rank: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  recommend: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  }
}, {
  sequelize,
  modelName: 'AiTool',
  tableName: 'ai_tools'
})

export default AiTool
