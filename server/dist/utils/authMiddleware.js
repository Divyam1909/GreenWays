"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'greenways-secret-key';
/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticate = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Missing or invalid Authorization header');
            res.status(401).json({ message: 'Access denied. No token provided.' });
            return;
        }
        // Extract token 
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('No token provided');
            res.status(401).json({ message: 'Access denied. No token provided.' });
            return;
        }
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Attach user to request
            req.user = { id: decoded.id };
            // Proceed to the next middleware or route handler
            next();
        }
        catch (error) {
            console.log('Invalid token:', error);
            res.status(401).json({ message: 'Invalid token. Please authenticate again.' });
        }
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Internal server error during authentication.' });
    }
};
exports.authenticate = authenticate;
exports.default = exports.authenticate;
