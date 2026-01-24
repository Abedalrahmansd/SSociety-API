import { Router } from 'express';
import {
  adminGetGrades,
  adminCreateGrade,
  adminUpdateGrade,
  adminDeleteGrade,
  getChatGroupId,
} from '../controllers/grades.controller.js';
import {
  authenticate,
  requireAdmin,
} from '../middleware/auth.middleware.js';

const router = Router();

router.get('/admin/all', authenticate, requireAdmin, adminGetGrades);
router.post('/admin', authenticate, requireAdmin, adminCreateGrade);
router.put('/admin/:id', authenticate, requireAdmin, adminUpdateGrade);
router.delete('/admin/:id', authenticate, requireAdmin, adminDeleteGrade);

router.get('/:id/chat-group-id', authenticate, getChatGroupId);

export default router;


