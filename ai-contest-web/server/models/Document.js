import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class Document extends Model {}

Document.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  session_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sessions',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  file_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'markdown'
  },
  current_version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Document',
  tableName: 'documents'
})

export default Document
