import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import Grade from '../models/grade.model.js';

// Get current user with chat_group_id (replacement for users.php getUser)
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
    }

    let chat_group_id = null;
    if (user.grade_id) {
      const grade = await Grade.findByPk(user.grade_id);
      chat_group_id = grade?.chat_group_id || null;
    }

    return res.status(200).json({
      status: 'success',
      fullname: user.fullname,
      message: 'data gathered successful.',
      user: user.toJSON(),
      chat_group_id,
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user. Error: ' + error.message,
    });
  }
};

// Update current user (replacement for update_user.php for self)
export const updateMe = async (req, res) => {
  try {
    const allowedFields = [
      'fullname',
      'bio',
      'assetImage',
      'networkImage',
      'email',
      'password',
      'grade_id',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'password') {
          const salt = await bcrypt.genSalt(10);
          updates.password = await bcrypt.hash(req.body.password, salt);
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields provided for update.',
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
    }

    await user.update(updates);

    return res.status(200).json({
      status: 'success',
      message: 'User data updated successfully.',
    });
  } catch (error) {
    console.error('updateMe error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update user. Error: ' + error.message,
    });
  }
};

// Admin list users (replacement for manager_users.php get_users)
export const adminGetUsers = async (_req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (error) {
    console.error('adminGetUsers error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users. Error: ' + error.message,
    });
  }
};

// Admin create or update user (manager_users.php)
export const adminCreateOrUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, fullname, bio, grade_id, is_admin, is_manager, password } =
      req.body;

    if (!email || !fullname || grade_id == null) {
      return res.status(400).json({
        status: 'error',
        message: 'email, fullname and grade_id are required.',
      });
    }

    const data = {
      email,
      fullname,
      bio,
      grade_id,
      is_admin: is_admin ? 1 : 0,
      is_manager: is_manager ? 1 : 0,
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(password, salt);
    }

    if (id) {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found.',
        });
      }
      await user.update(data);
      return res.status(200).json({
        status: 'success',
        message: 'User updated.',
        data: user.toJSON(),
      });
    }

    const user = await User.create(data);

    return res.status(201).json({
      status: 'success',
      message: 'User created.',
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('adminCreateOrUpdateUser error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save user. Error: ' + error.message,
    });
  }
};

export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'User deleted.',
    });
  } catch (error) {
    console.error('adminDeleteUser error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete user. Error: ' + error.message,
    });
  }
};


