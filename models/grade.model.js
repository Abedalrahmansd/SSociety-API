import { DataTypes } from 'sequelize';
import sequelize from '../database/mysqldb.js';

const Grade = sequelize.define('Grade', {
  grade_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  chat_group_id: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'grades',
  timestamps: false,
});

export default Grade;


