import sequelize from '../config/database.js'
import Admin from './Admin.js'
import Training from './Training.js'
import Registration from './Registration.js'
import ContestInfo from './ContestInfo.js'
import Stage from './Stage.js'
import AiTool from './AiTool.js'

const db = {
  sequelize,
  Admin,
  Training,
  Registration,
  ContestInfo,
  Stage,
  AiTool
}

export default db
