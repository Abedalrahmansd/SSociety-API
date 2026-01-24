import fs from 'node:fs';
import File from '../models/file.model.js';

// Get files by grade and category
export const getFiles = async (req, res) => {
  try {
    const { grade_id, category } = req.query;

    if (!grade_id || !category) {
      return res.status(400).json({
        status: 'error',
        message: 'grade_id and category are required.',
      });
    }

    const files = await File.findAll({
      where: { grade_id, category },
      order: [['uploaded_at', 'DESC']],
    });

    return res.status(200).json(files);
  } catch (error) {
    console.error('getFiles error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch files. Error: ' + error.message,
    });
  }
};

// Upload new file
export const uploadFile = async (req, res) => {
  try {
    const { title, category, grade_id, description = '' } = req.body;

    if (!req.file || !title || !category || !grade_id) {
      return res.status(400).json({
        status: 'error',
        message: 'file, title, category and grade_id are required.',
      });
    }

    const user_id = req.user.id;

    const filePath = req.file.path.replace(/\\/g, '/');

    await File.create({
      title,
      description,
      file_path: filePath,
      category,
      user_id,
      grade_id,
      uploaded_at: new Date(),
    });

    return res.status(201).json({
      status: 'success',
      message: 'File uploaded successfully.',
    });
  } catch (error) {
    console.error('uploadFile error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to upload file. Error: ' + error.message,
    });
  }
};

// Delete multiple files (owner or admin)
export const deleteFiles = async (req, res) => {
  try {
    const { file_ids } = req.body;

    if (!Array.isArray(file_ids) || file_ids.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'file_ids (non-empty array) is required.',
      });
    }

    const userId = req.user.id;
    const isAdmin = req.user.is_admin === 1;

    const files = await File.findAll({
      where: { id: file_ids },
    });

    if (!files.length) {
      return res.status(404).json({
        status: 'error',
        message: 'No files found for the provided IDs.',
      });
    }

    const deletable = files.filter((f) => isAdmin || f.user_id === userId);

    if (!deletable.length) {
      return res.status(403).json({
        status: 'error',
        message: 'Only admins or file owners can delete files.',
      });
    }

    for (const file of deletable) {
      if (file.file_path && fs.existsSync(file.file_path)) {
        try {
          fs.unlinkSync(file.file_path);
        } catch (e) {
          console.warn('Failed to delete file from disk:', file.file_path, e);
        }
      }
    }

    const deletableIds = deletable.map((f) => f.id);
    const deletedCount = await File.destroy({
      where: { id: deletableIds },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Files deleted successfully.',
      deleted_count: deletedCount,
    });
  } catch (error) {
    console.error('deleteFiles error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete files. Error: ' + error.message,
    });
  }
};

// Edit file metadata (owner only)
export const updateFileMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;

    const file = await File.findByPk(id);
    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found.',
      });
    }

    if (file.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the file owner can edit the file.',
      });
    }

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (category) updates.category = category;

    await file.update(updates);

    return res.status(200).json({
      status: 'success',
      message: 'File updated successfully.',
    });
  } catch (error) {
    console.error('updateFileMetadata error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update file. Error: ' + error.message,
    });
  }
};

// Admin list & CRUD (replacement for manager_files.php)
export const adminGetAllFiles = async (_req, res) => {
  try {
    const files = await File.findAll({
      order: [['id', 'DESC']],
    });
    return res.status(200).json(files);
  } catch (error) {
    console.error('adminGetAllFiles error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch files. Error: ' + error.message,
    });
  }
};

export const adminCreateOrUpdateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, file_path, category, grade_id, uploaded_by } =
      req.body;

    if (!title || !file_path || !category || grade_id == null || !uploaded_by) {
      return res.status(400).json({
        status: 'error',
        message:
          'title, file_path, category, grade_id and uploaded_by are required.',
      });
    }

    if (id) {
      const file = await File.findByPk(id);
      if (!file) {
        return res.status(404).json({
          status: 'error',
          message: 'File not found.',
        });
      }
      await file.update({
        title,
        description,
        file_path,
        category,
        grade_id,
      });
      return res.status(200).json({
        status: 'success',
        message: 'File updated.',
        data: file.toJSON(),
      });
    }

    const file = await File.create({
      title,
      description,
      file_path,
      category,
      grade_id,
      uploaded_by,
    });

    return res.status(201).json({
      status: 'success',
      message: 'File created.',
      data: file.toJSON(),
    });
  } catch (error) {
    console.error('adminCreateOrUpdateFile error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save file. Error: ' + error.message,
    });
  }
};

export const adminDeleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findByPk(id);
    if (!file) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found.',
      });
    }

    if (file.file_path && fs.existsSync(file.file_path)) {
      try {
        fs.unlinkSync(file.file_path);
      } catch (e) {
        console.warn('Failed to delete file from disk:', file.file_path, e);
      }
    }

    await file.destroy();

    return res.status(200).json({
      status: 'success',
      message: 'File deleted.',
    });
  } catch (error) {
    console.error('adminDeleteFile error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete file. Error: ' + error.message,
    });
  }
};


