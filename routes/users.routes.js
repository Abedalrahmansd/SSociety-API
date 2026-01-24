import { Router } from 'express';
import {
  getMe,
  updateMe,
  adminGetUsers,
  adminCreateOrUpdateUser,
  adminDeleteUser,
} from '../controllers/users.controller.js';
import {
  authenticate,
  requireAdmin,
} from '../middleware/auth.middleware.js';

const router = Router();

// Self-service
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);

// Admin management
router.get('/admin/all', authenticate, requireAdmin, adminGetUsers);
router.post(
  '/admin',
  authenticate,
  requireAdmin,
  adminCreateOrUpdateUser,
);
router.put(
  '/admin/:id',
  authenticate,
  requireAdmin,
  adminCreateOrUpdateUser,
);
router.delete(
  '/admin/:id',
  authenticate,
  requireAdmin,
  adminDeleteUser,
);

export default router;


