import { Router } from 'express';
import { registerUser, loginUser } from './auth.controller';
import { validate } from '../../middlewares/zod.middleware';
import { registerDto, loginDto } from './auth.dto';

const router = Router();

/**
 * POST /api/auth/register
 */
router.post('/register', validate(registerDto), registerUser);

/**
 * POST /api/auth/login
 */
router.post('/login', validate(loginDto), loginUser);

export default router;
