import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class ContestInfo extends Model {}

ContestInfo.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '法务"AI副驾驶"设计大赛'
  },
  subtitle: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: '让法务拥有自己的"AI副驾驶"！'
  },
  badge_text: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '海尔集团法务数字化创新'
  },
  stat_phases: {
    type: DataTypes.STRING(20),
    defaultValue: '5'
  },
  stat_trainings: {
    type: DataTypes.STRING(20),
    defaultValue: '10+'
  },
  stat_creative: {
    type: DataTypes.STRING(20),
    defaultValue: '∞'
  },
  poster_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  info_participants: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  info_rewards: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  info_highlights: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'ContestInfo',
  tableName: 'contest_info'
})

export default ContestInfo
