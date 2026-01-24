import { Router } from 'express';
import {
  createAssignment,
  getAssignments,
  verifyAssignment,
  deleteAssignments,
  adminGetAllAssignments,
  adminCreateOrUpdateAssignment,
  adminDeleteAssignment,
} from '../controllers/assignments.controller.js';
import {
  authenticate,
  requireAdmin,
} from '../middleware/auth.middleware.js';

const router = Router();

// Student / teacher side
router.post('/', authenticate, createAssignment);
router.get('/', authenticate, getAssignments);

// Admin-only
router.patch('/:id/verify', authenticate, requireAdmin, verifyAssignment);
router.delete('/', authenticate, requireAdmin, deleteAssignments);

// Admin management routes (replacement for manager_assignments.php)
router.get('/admin/all', authenticate, requireAdmin, adminGetAllAssignments);
router.post(
  '/admin',
  authenticate,
  requireAdmin,
  adminCreateOrUpdateAssignment,
);
router.put(
  '/admin/:id',
  authenticate,
  requireAdmin,
  adminCreateOrUpdateAssignment,
);
router.delete(
  '/admin/:id',
  authenticate,
  requireAdmin,
  adminDeleteAssignment,
);

export default router;


