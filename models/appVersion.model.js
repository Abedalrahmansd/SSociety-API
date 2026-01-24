import { DataTypes } from 'sequelize';
import sequelize from '../database/mysqldb.js';

const AppVersion = sequelize.define('AppVersion', {
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  version_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  min_supported_version: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_forced: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'app_version',
  timestamps: false,
});

export default AppVersion;


