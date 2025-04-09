import express, { Router } from 'express';
import { registerUser, loginUser } from '../controllers/userController';
import authenticate from '../utils/authMiddleware';

const router: Router = express.Router();

// Public routes - Authentication
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes can be added here
// Example: router.get('/profile', authenticate, getUserProfile);

export default router; 