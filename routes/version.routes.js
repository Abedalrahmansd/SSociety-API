import { Router } from 'express';
import {
  getVersionInfo,
  adminGetAllVersions,
  adminUpsertVersion,
} from '../controllers/version.controller.js';
import {
  authenticate,
  requireAdmin,
} from '../middleware/auth.middleware.js';

const router = Router();

// Mobile app
router.get('/', getVersionInfo);

// Admin
router.get('/admin/all', authenticate, requireAdmin, adminGetAllVersions);
router.post('/admin', authenticate, requireAdmin, adminUpsertVersion);

export default router;


