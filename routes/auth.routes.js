import { Router } from 'express';
import {
  signup,
  login,
  checkEmail,
  fetchGrades,
  forgotPassword,
  changePassword,
  verifyEmail,
  verifyCode,
} from '../controllers/auth.controller.js';

const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/check_email', checkEmail);
authRouter.get('/fetch_grades', fetchGrades);
authRouter.post('/forgot_password', forgotPassword);
authRouter.post('/change_password', changePassword);
authRouter.post('/verify_email', verifyEmail);
authRouter.post('/verify_code', verifyCode);

export default authRouter;

/* 
POST /auth/signup 
POST /auth/login
POST /auth/forgot_password
POST /auth/change_password
POST /auth/verify_email
POST /auth/check_email
POST /auth/verify_code
GET  /auth/fetch_grades
 */