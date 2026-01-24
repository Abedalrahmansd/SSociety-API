import crypto from 'node:crypto';
import Grade from '../models/grade.model.js';

export const adminGetGrades = async (_req, res) => {
  try {
    const grades = await Grade.findAll({ order: [['id', 'DESC']] });
    return res.status(200).json(grades);
  } catch (error) {
    console.error('adminGetGrades error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch grades. Error: ' + error.message,
    });
  }
};

export const adminCreateGrade = async (req, res) => {
  try {
    const { grade_name, description, chat_group_id } = req.body;

    if (!grade_name) {
      return res.status(400).json({
        status: 'error',
        message: 'grade_name is required.',
      });
    }

    const roomId =
      chat_group_id || crypto.randomBytes(10).toString('hex');

    const grade = await Grade.create({
      grade_name,
      description,
      chat_group_id: roomId,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Grade created.',
      data: grade.toJSON(),
    });
  } catch (error) {
    console.error('adminCreateGrade error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create grade. Error: ' + error.message,
    });
  }
};

export const adminUpdateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade_name, description, chat_group_id } = req.body;

    const grade = await Grade.findByPk(id);
    if (!grade) {
      return res.status(404).json({
        status: 'error',
        message: 'Grade not found.',
      });
    }

    await grade.update({
      grade_name: grade_name ?? grade.grade_name,
      description: description ?? grade.description,
      chat_group_id: chat_group_id ?? grade.chat_group_id,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Grade updated.',
      data: grade.toJSON(),
    });
  } catch (error) {
    console.error('adminUpdateGrade error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update grade. Error: ' + error.message,
    });
  }
};

export const adminDeleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Grade.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Grade not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Grade deleted.',
    });
  } catch (error) {
    console.error('adminDeleteGrade error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete grade. Error: ' + error.message,
    });
  }
};

export const getChatGroupId = async (req, res) => {
  try {
    const { id } = req.params;
    const grade = await Grade.findByPk(id);
    if (!grade) {
      return res.status(404).json({
        status: 'error',
        message: 'Grade not found.',
      });
    }

    return res.status(200).json({
      chat_group_id: grade.chat_group_id,
    });
  } catch (error) {
    console.error('getChatGroupId error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get chat group id. Error: ' + error.message,
    });
  }
};


