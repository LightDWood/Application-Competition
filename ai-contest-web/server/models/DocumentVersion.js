import { DataTypes, Model } from 'sequelize'
import sequelize from '../config/database.js'

class DocumentVersion extends Model {}

DocumentVersion.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  document_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'documents',
      key: 'id'
    }
  },
  version_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  change_summary: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'DocumentVersion',
  tableName: 'document_versions',
  indexes: [
    {
      unique: true,
      fields: ['document_id', 'version_number']
    }
  ]
})

export default DocumentVersion
