import User from '../models/user.model.js';
import Grade from '../models/grade.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import sequelize from '../database/mysqldb.js';

const signup = async (req, res, next) => {
    // Start a transaction
    const transaction = await sequelize.transaction();
    
    try {
        const { email, password, fullname, bio, assetImage, networkImage, grade_id, device_info, is_admin, is_manager, is_verified } = req.body;

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a random 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Create new user using Sequelize within the transaction
        const newUser = await User.create({
            email,
            password: hashedPassword,
            fullname,
            bio,
            assetImage,
            networkImage,
            grade_id,
            device_info,
            verification_code: verificationCode,
            is_verified,
            is_admin,
            is_manager
        }, { transaction });

        // Generate a JWT token with the user's id and email as payload
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Commit the transaction if everything succeeds
        await transaction.commit();

        // TODO: Send verification email
        // sendVerificationEmail(email, verificationCode);

        return res.status(201).json({
            status: 'success',
            message: 'Account created successfully.',
            data: {
                user:newUser.toJSON(),
                token:token
            }
        });
    } catch (error) {
        // Rollback the transaction on any error
        await transaction.rollback();

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                status: 'error',
                message: error.errors[0].message
            });
        }
        
        // Handle unique constraint violation
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                status: 'error',
                message: 'Email already exists.'
            });
        }

        // Handle other errors
        console.error('Signup error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create account. Error: '+error.message,
            /* error:{
                name: error.name,
                message: error.message,
                stack: error.stack
            } */
        });
    }
};

const login = async (req, res, next) => {
    // Start a transaction
    const transaction = await sequelize.transaction();
    
    try {
        const { email, password, device_info } = req.body;

        // Validate required fields
        if (!email || !password) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required.'
            });
        }

        // Find user by email
        const user = await User.findOne({ where: { email } }, { transaction });

        // Check if user exists and password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            await transaction.rollback();
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password.'
            });
        }

        // Check if user is verified
        if (!user.is_verified) {
            await transaction.rollback();
            return res.status(403).json({
                status: 'error',
                message: 'Please verify your email before logging in.'
            });
        }

        // Update device_info by appending new device info to existing array
        if (device_info) {
            const existingDeviceInfo = Array.isArray(user.device_info) 
                ? user.device_info 
                : (user.device_info ? [user.device_info] : []);
            
            existingDeviceInfo.push(device_info);
            
            await user.update(
                { device_info: existingDeviceInfo },
                { transaction }
            );
        }

        // Fetch chat_group_id from grades table if grade_id exists
        let chatGroupId = null;
        if (user.grade_id) {
            const results = await sequelize.query(
                'SELECT chat_group_id FROM grades WHERE id = :gradeId',
                {
                    replacements: { gradeId: user.grade_id },
                    type: sequelize.QueryTypes.SELECT,
                    transaction
                }
            );
            chatGroupId = results[0]?.chat_group_id || null;
        }

        // Generate a JWT token with the user's id and email as payload
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Commit the transaction if everything succeeds
        await transaction.commit();

        // Refresh user data to get updated device_info
        await user.reload();

        return res.status(200).json({
            status: 'success',
            message: 'Login successful.',
            data: {
                fullname: user.fullname,
                user: user.toJSON(),
                token: token,
                chat_group_id: chatGroupId
            }
        });
    } catch (error) {
        // Rollback the transaction on any error
        await transaction.rollback();

        // Handle other errors
        console.error('Login error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to login. Error: ' + error.message
        });
    }
};

// Check if email exists (used during signup)
const checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Email is required.'
            });
        }

        const user = await User.findOne({ where: { email } });

        if (user) {
            return res.status(200).json({
                status: 'exists',
                message: 'Email already exists.'
            });
        }

        return res.status(200).json({
            status: 'not_exists',
            message: 'Email is available.'
        });
    } catch (error) {
        console.error('checkEmail error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to check email. Error: ' + error.message
        });
    }
};

// Fetch grades list (id, grade_name, description)
const fetchGrades = async (req, res) => {
    try {
        const grades = await Grade.findAll({
            attributes: ['id', 'grade_name', 'description']
        });

        return res.status(200).json({
            status: 'success',
            grades
        });
    } catch (error) {
        console.error('fetchGrades error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch grades. Error: ' + error.message
        });
    }
};

// Forgot password: generate and store verification_code
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Email is required.'
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Email not found.'
            });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await user.update({ verification_code: code });

        // TODO: send reset password email
        // sendResetPasswordEmail(email, code);

        return res.status(200).json({
            status: 'success',
            message: 'Verification code set. (Email sending not yet implemented)'
        });
    } catch (error) {
        console.error('forgotPassword error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to set verification code. Error: ' + error.message
        });
    }
};

// Change password using verification_code
const changePassword = async (req, res) => {
    try {
        const { email, new_password, verification_code } = req.body;

        if (!email || !new_password || !verification_code) {
            return res.status(400).json({
                status: 'error',
                message: 'Email, new_password, and verification_code are required.'
            });
        }

        const user = await User.findOne({
            where: { email, verification_code }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired code.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        await user.update({
            password: hashedPassword,
            verification_code: null
        });

        return res.status(200).json({
            status: 'success',
            message: 'Password changed successfully.'
        });
    } catch (error) {
        console.error('changePassword error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Password update failed. Error: ' + error.message
        });
    }
};

// Verify email using verification code (for signup flow)
const verifyEmail = async (req, res) => {
    try {
        const { email, verification_code } = req.body;

        if (!email || !verification_code) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and verification_code are required.'
            });
        }

        const user = await User.findOne({
            where: { email, verification_code }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid verification code.'
            });
        }

        await user.update({
            is_verified: true,
            verification_code: null
        });

        return res.status(200).json({
            status: 'success',
            message: 'Email verified successfully.'
        });
    } catch (error) {
        console.error('verifyEmail error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to verify email. Error: ' + error.message
        });
    }
};

// Verify code only (e.g., before changing password)
const verifyCode = async (req, res) => {
    try {
        const { email, verification_code } = req.body;

        if (!email || !verification_code) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and verification_code are required.'
            });
        }

        const user = await User.findOne({
            where: { email, verification_code }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid code.'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Code verified.'
        });
    } catch (error) {
        console.error('verifyCode error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to verify code. Error: ' + error.message
        });
    }
};

export {
    signup,
    login,
    checkEmail,
    fetchGrades,
    forgotPassword,
    changePassword,
    verifyEmail,
    verifyCode,
};

export default signup;