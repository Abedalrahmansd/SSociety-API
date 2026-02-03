import { DataTypes } from 'sequelize';
import sequelize from '../database/mysqldb.js';

const Message = sequelize.define('Message', {
  chat_group_id: {
    // maps to grades.chat_group_id or other chat room ids
    type: DataTypes.STRING,
    allowNull: false,
  },
  sender: {
    // user id
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  msg: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  hidefrom: {
    // array of user ids
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  readList: {
    // array of user ids who read the message
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'messages',
  timestamps: false,
  indexes: [
    { fields: ['chat_group_id', 'sentAt'] },
    { fields: ['sender'] },
    { fields: ['isDeleted'] },
  ],
});

export default Message;


