import sequelize from '../config/database.js'
import Admin from './Admin.js'
import Training from './Training.js'
import Registration from './Registration.js'
import ContestInfo from './ContestInfo.js'
import Stage from './Stage.js'
import AiTool from './AiTool.js'
import User from './User.js'
import Session from './Session.js'
import Message from './Message.js'
import Document from './Document.js'
import DocumentVersion from './DocumentVersion.js'

User.hasMany(Session, { foreignKey: 'user_id', as: 'sessions' })
Session.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

Session.hasMany(Message, { foreignKey: 'session_id', as: 'messages' })
Message.belongsTo(Session, { foreignKey: 'session_id', as: 'session' })

Session.hasMany(Document, { foreignKey: 'session_id', as: 'documents' })
Document.belongsTo(Session, { foreignKey: 'session_id', as: 'session' })

Document.hasMany(DocumentVersion, { foreignKey: 'document_id', as: 'versions' })
DocumentVersion.belongsTo(Document, { foreignKey: 'document_id', as: 'document' })

User.hasMany(DocumentVersion, { foreignKey: 'created_by', as: 'documentVersions' })
DocumentVersion.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })

const db = {
  sequelize,
  Admin,
  Training,
  Registration,
  ContestInfo,
  Stage,
  AiTool,
  User,
  Session,
  Message,
  Document,
  DocumentVersion
}

export default db
