import { Router } from 'express';
import { getMessages } from '../controllers/messages.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getMessages);

export default router;


