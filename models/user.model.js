import { DataTypes } from 'sequelize';
import sequelize from '../database/mysqldb.js';

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            name: 'unique_email',
            msg: 'Email already exists.'
        },
        validate: {
            notNull: { msg: 'Email is required.' },
            notEmpty: { msg: 'Email cannot be empty.' },
            isEmail: { msg: 'Must provide a valid email address.' },
            len: {
                args: [5, 254],
                msg: 'Email address must be between 5 and 254 characters.'
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Password is required.' },
            notEmpty: { msg: 'Password cannot be empty.' },
            len: {
                args: [8, 100],
                msg: 'Password must be between 8 and 100 characters.'
            }
        }
    },
    fullname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Full name is required.' },
            notEmpty: { msg: 'Full name cannot be empty.' },
            len: {
                args: [3, 150],
                msg: 'Full name must be between 3 and 150 characters.'
            },
            // Custom validator to ensure only valid chars (letters, spaces, dots, hyphens)
            is: {
                args: [/^[A-Za-zÀ-ÿ .'-]+$/],
                msg: "Full name contains invalid characters."
            }
        }
    },
    bio: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        validate: {
            len: {
                args: [0, 150],
                msg: 'Bio must be between 0 and 150 characters.'
            },
        }
    },
    assetImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    networkImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    grade_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: {
            isInt: {
                msg: 'Grade ID must be an integer.'
            },
            min: {
                args: [1],
                msg: 'Grade ID must be greater than 0.'
            },
        }
    },
    device_info: {
        // DataTypes.JSONB is only supported by Postgres, fallback to JSON for MySQL
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        validate: {
            isObjectOrEmpty(val) {
                if (val !== null && typeof val !== 'object') {
                    throw new Error('Device info must be a JSON object.');
                }
            }
        }
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
            notNull: { msg: "is_verified flag cannot be null." },
            isIn: {
                args: [[true, false]],
                msg: 'is_verified must be true or false.'
            }
        }
    },
    verification_code : {
        type : DataTypes.STRING,
        allowNull : true,
        defaultValue : null,
        validate: {
            isNumeric: {
                args: true,
                msg: 'Verification code must be a number string.'
            },
            len: {
                args: [6, 6],
                msg: 'Verification code must be exactly 6 digits.'
            }
        }
    },
    is_admin: {
        //this is a boolean field to check if the user is an admin(1 or 0)
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'is_admin must be 0 or 1.'
            }
        }
    },
    is_manager: {
        //this is a boolean field to check if the user is a manager(1 or 0)
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: 'is_manager must be 0 or 1.'
            }
        }
    },
}, {
    tableName: 'users',
    timestamps: false,
    indexes: [
        { fields: ['email'], unique: true },
        { fields: ['grade_id'] },
        { fields: ['is_verified'] },
        { fields: ['is_admin', 'is_manager'] },
    ],
});

export default User;


// SQL command to create the table
/* CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    bio TEXT,
    assetImage VARCHAR(255),
    networkImage VARCHAR(255),
    grade_id INT,
    device_info JSON,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_code VARCHAR(6),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_manager BOOLEAN NOT NULL DEFAULT FALSE,
); */