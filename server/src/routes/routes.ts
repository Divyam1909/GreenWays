import express, { Router } from 'express';
import { getRouteOptions, saveRoute, getUserRoutes, deleteRoute } from '../controllers/routeController';
import authenticate from '../utils/authMiddleware';

const router: Router = express.Router();

// Public routes
router.post('/options', getRouteOptions);

// Protected routes - require authentication
router.post('/save', authenticate, saveRoute);
router.get('/user/:userId', authenticate, getUserRoutes);
router.delete('/:routeId', authenticate, deleteRoute);

export default router; 