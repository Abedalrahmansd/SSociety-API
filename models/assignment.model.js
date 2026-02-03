import { DataTypes } from 'sequelize';
import sequelize from '../database/mysqldb.js';

const Assignment = sequelize.define('Assignment', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  grade_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'assignments',
  timestamps: false,
  indexes: [
    { fields: ['grade_id', 'start_date'] },
    { fields: ['created_by'] },
    { fields: ['is_verified'] },
  ],
});

export default Assignment;


