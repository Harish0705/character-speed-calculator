import { Router } from 'express';
import { register, login } from './authControllers';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Register endpoint
router.post('/register', register);

// Login endpoint
router.post('/login', login);

export default router;