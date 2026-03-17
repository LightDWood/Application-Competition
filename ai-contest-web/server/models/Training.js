import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class Training extends Model {}

Training.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  video_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  cover_image: {
    type: DataTypes.STRING(500),
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
  modelName: 'Training',
  tableName: 'trainings'
})

export default Training
