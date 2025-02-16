import express from 'express';
import { signUp, signIn, logout } from '../controllers/AdminController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/logout',authenticate, logout);

export default router;