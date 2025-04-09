"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routeController_1 = require("../controllers/routeController");
const authMiddleware_1 = __importDefault(require("../utils/authMiddleware"));
const router = express_1.default.Router();
// Public routes
router.post('/options', routeController_1.getRouteOptions);
// Protected routes - require authentication
router.post('/save', authMiddleware_1.default, routeController_1.saveRoute);
router.get('/user/:userId', authMiddleware_1.default, routeController_1.getUserRoutes);
router.delete('/:routeId', authMiddleware_1.default, routeController_1.deleteRoute);
exports.default = router;
