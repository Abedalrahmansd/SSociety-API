import { Router } from 'express';
import {
  getFiles,
  uploadFile,
  deleteFiles,
  updateFileMetadata,
  adminGetAllFiles,
  adminCreateOrUpdateFile,
  adminDeleteFile,
} from '../controllers/files.controller.js';
import {
  authenticate,
  requireAdmin,
} from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// Student / teacher side
router.get('/', authenticate, getFiles);
router.post(
  '/',
  authenticate,
  upload.single('file'),
  uploadFile,
);
router.delete('/', authenticate, deleteFiles);
router.put('/:id', authenticate, updateFileMetadata);

// Admin management routes (replacement for manager_files.php)
router.get('/admin/all', authenticate, requireAdmin, adminGetAllFiles);
router.post(
  '/admin',
  authenticate,
  requireAdmin,
  adminCreateOrUpdateFile,
);
router.put(
  '/admin/:id',
  authenticate,
  requireAdmin,
  adminCreateOrUpdateFile,
);
router.delete(
  '/admin/:id',
  authenticate,
  requireAdmin,
  adminDeleteFile,
);

export default router;


