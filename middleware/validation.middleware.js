import Joi from 'joi';

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
    }

    req.body = value;
    next();
  };
};

// Common validation schemas
export const schemas = {
  signup: Joi.object({
    email: Joi.string().email().required().max(254),
    password: Joi.string().min(8).max(100).required(),
    fullname: Joi.string().min(3).max(150).required(),
    bio: Joi.string().max(150).allow(null, ''),
    assetImage: Joi.string().allow(null, ''),
    networkImage: Joi.string().allow(null, ''),
    grade_id: Joi.number().integer().positive().allow(null),
    device_info: Joi.object().allow(null, {}),
    is_admin: Joi.number().integer().valid(0, 1).default(0),
    is_manager: Joi.number().integer().valid(0, 1).default(0),
    is_verified: Joi.boolean().default(false),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    device_info: Joi.object().allow(null, {}),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  changePassword: Joi.object({
    email: Joi.string().email().required(),
    new_password: Joi.string().min(8).max(100).required(),
    verification_code: Joi.string().length(6).required(),
  }),

  verifyEmail: Joi.object({
    email: Joi.string().email().required(),
    verification_code: Joi.string().length(6).required(),
  }),

  verifyCode: Joi.object({
    email: Joi.string().email().required(),
    verification_code: Joi.string().length(6).required(),
  }),

  checkEmail: Joi.object({
    email: Joi.string().email().required(),
  }),

  createAssignment: Joi.object({
    title: Joi.string().required().max(255),
    description: Joi.string().required(),
    start_date: Joi.date().iso().required(),
    avatar: Joi.string().allow(null, ''),
    grade_id: Joi.number().integer().positive().required(),
  }),

  updateAssignment: Joi.object({
    title: Joi.string().max(255),
    description: Joi.string(),
    start_date: Joi.date().iso(),
    avatar: Joi.string().allow(null, ''),
    grade_id: Joi.number().integer().positive(),
    is_verified: Joi.boolean(),
  }),

  updateUser: Joi.object({
    fullname: Joi.string().min(3).max(150),
    bio: Joi.string().max(150).allow(null, ''),
    assetImage: Joi.string().allow(null, ''),
    networkImage: Joi.string().allow(null, ''),
    email: Joi.string().email().max(254),
    password: Joi.string().min(8).max(100),
    grade_id: Joi.number().integer().positive().allow(null),
  }),

  createGrade: Joi.object({
    grade_name: Joi.string().required().max(255),
    description: Joi.string().allow(null, ''),
    chat_group_id: Joi.string().allow(null, ''),
  }),

  updateGrade: Joi.object({
    grade_name: Joi.string().max(255),
    description: Joi.string().allow(null, ''),
    chat_group_id: Joi.string().allow(null, ''),
  }),

  getMessages: Joi.object({
    chat_group_id: Joi.string().required(),
    limit: Joi.number().integer().min(1).max(100).default(50),
    before: Joi.date().iso(),
  }),

  sendMessage: Joi.object({
    chat_group_id: Joi.string().required(),
    msg: Joi.string().required().max(5000),
    senderName: Joi.string().max(150),
    hidefrom: Joi.array().items(Joi.number().integer()).default([]),
    readList: Joi.array().items(Joi.number().integer()).default([]),
  }),

  editMessage: Joi.object({
    id: Joi.number().integer().positive().required(),
    msg: Joi.string().required().max(5000),
  }),

  deleteMessage: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  markRead: Joi.object({
    ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
    chat_group_id: Joi.string().required(),
  }),

  hideMessage: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

