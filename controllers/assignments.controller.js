import Assignment from '../models/assignment.model.js';
import User from '../models/user.model.js';

// Create assignment (students and admins) – auto-verify if admin
export const createAssignment = async (req, res) => {
  try {
    const { title, description, start_date, avatar, grade_id } = req.body;

    if (!title || !description || !start_date || !grade_id) {
      return res.status(400).json({
        status: 'error',
        message: 'title, description, start_date and grade_id are required.',
      });
    }

    const creatorId = req.user.id;

    const creator = await User.findByPk(creatorId);
    if (!creator) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid creator user.',
      });
    }

    const isAdmin = creator.is_admin === 1;
    const is_verified = isAdmin ? 1 : 0;

    const assignment = await Assignment.create({
      title,
      description,
      start_date,
      created_by: creatorId,
      avatar,
      grade_id,
      is_verified,
    });

    return res.status(201).json({
      status: 'success',
      message: isAdmin
        ? 'Assignment created and verified.'
        : 'Assignment created and pending verification.',
      data: assignment.toJSON(),
    });
  } catch (error) {
    console.error('createAssignment error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create assignment. Error: ' + error.message,
    });
  }
};

// Get assignments for a grade
export const getAssignments = async (req, res) => {
  try {
    const { grade_id } = req.query;

    if (!grade_id) {
      return res.status(400).json({
        status: 'error',
        message: 'grade_id is required.',
      });
    }

    const assignments = await Assignment.findAll({
      where: { grade_id },
      order: [['start_date', 'ASC']],
    });

    return res.status(200).json(assignments);
  } catch (error) {
    console.error('getAssignments error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch assignments. Error: ' + error.message,
    });
  }
};

// Verify assignment (admin only)
export const verifyAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assignment not found.',
      });
    }

    if (assignment.is_verified) {
      return res.status(400).json({
        status: 'error',
        message: 'Assignment already verified.',
      });
    }

    await assignment.update({ is_verified: 1 });

    return res.status(200).json({
      status: 'success',
      message: 'Assignment verified successfully.',
    });
  } catch (error) {
    console.error('verifyAssignment error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to verify assignment. Error: ' + error.message,
    });
  }
};

// Bulk delete assignments (admin only)
export const deleteAssignments = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ids (non-empty array) is required.',
      });
    }

    const deletedCount = await Assignment.destroy({
      where: { id: ids },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Deleted successfully.',
      deleted_count: deletedCount,
    });
  } catch (error) {
    console.error('deleteAssignments error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete assignments. Error: ' + error.message,
    });
  }
};

// Admin list & CRUD (replacement for manager_assignments.php)
export const adminGetAllAssignments = async (_req, res) => {
  try {
    const assignments = await Assignment.findAll({
      order: [['id', 'DESC']],
    });
    return res.status(200).json(assignments);
  } catch (error) {
    console.error('adminGetAllAssignments error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch assignments. Error: ' + error.message,
    });
  }
};

export const adminCreateOrUpdateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, created_by, is_verified } = req.body;

    if (!title || !description || !start_date || created_by == null) {
      return res.status(400).json({
        status: 'error',
        message: 'title, description, start_date and created_by are required.',
      });
    }

    if (id) {
      const assignment = await Assignment.findByPk(id);
      if (!assignment) {
        return res.status(404).json({
          status: 'error',
          message: 'Assignment not found.',
        });
      }
      await assignment.update({
        title,
        description,
        start_date,
        created_by,
        is_verified: is_verified ? 1 : 0,
      });
      return res.status(200).json({
        status: 'success',
        message: 'Assignment updated.',
        data: assignment.toJSON(),
      });
    }

    const assignment = await Assignment.create({
      title,
      description,
      start_date,
      created_by,
      is_verified: is_verified ? 1 : 0,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Assignment created.',
      data: assignment.toJSON(),
    });
  } catch (error) {
    console.error('adminCreateOrUpdateAssignment error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save assignment. Error: ' + error.message,
    });
  }
};

export const adminDeleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Assignment.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Assignment not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Assignment deleted.',
    });
  } catch (error) {
    console.error('adminDeleteAssignment error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete assignment. Error: ' + error.message,
    });
  }
};


