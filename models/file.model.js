import { DataTypes } from 'sequelize';
import sequelize from '../database/mysqldb.js';

const File = sequelize.define('File', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    // owner/uploader (used by files.php)
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  uploaded_by: {
    // used by manager_files.php
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  grade_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  uploaded_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'files',
  timestamps: false,
  indexes: [
    { fields: ['grade_id', 'category'] },
    { fields: ['user_id'] },
    { fields: ['uploaded_at'] },
  ],
});

export default File;


