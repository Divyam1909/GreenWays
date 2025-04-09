import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'greenways-secret-key';

// Register a new user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Register request received:', req.body);
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      res.status(400).json({ message: 'Name, email and password are required' });
      return;
    }

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      console.log('Existing user check result:', existingUser ? 'Found' : 'Not found');
      
      if (existingUser) {
        res.status(400).json({ message: 'User with this email already exists' });
        return;
      }
      
      // Create new user
      const newUser = new User({
        name,
        email,
        // In a real application, you'd hash the password here
        password, 
      });
      
      console.log('Attempting to save new user');
      await newUser.save();
      console.log('User saved successfully, ID:', newUser._id);
      
      // Don't send the password back to client
      const userResponse = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email
      };

      // Generate JWT token
      const token = jwt.sign(
        { id: newUser._id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({ 
        message: 'User registered successfully', 
        user: userResponse,
        token
      });
    } catch (dbError: any) {
      console.error('Database error during registration:', dbError);
      
      // Handle validation errors
      if (dbError.name === 'ValidationError') {
        const validationErrors = Object.keys(dbError.errors).map(field => ({
          field,
          message: dbError.errors[field].message
        }));
        
        res.status(400).json({ 
          message: 'Validation error', 
          errors: validationErrors 
        });
        return;
      }
      
      // Handle duplicate key errors (usually email)
      if (dbError.code === 11000) {
        res.status(400).json({ 
          message: 'User with this email already exists',
          field: 'email'
        });
        return;
      }
      
      // Other database errors
      res.status(500).json({ 
        message: 'Database error during registration', 
        error: dbError.message
      });
    }
  } catch (error: any) {
    console.error('Unexpected error registering user:', error);
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message 
    });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Login request received:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing required fields:', { email: !!email, password: !!password });
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    try {
      // Find user by email
      const user = await User.findOne({ email });
      console.log('User lookup result:', user ? 'Found' : 'Not found');
      
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Check password (in a real app, you'd compare hashed passwords)
      if (user.password !== password) {
        console.log('Password mismatch');
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      console.log('User authenticated successfully');
      
      // Don't send the password back to client
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email
      };

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({ 
        message: 'Login successful', 
        user: userResponse,
        token
      });
    } catch (dbError: any) {
      console.error('Database error during login:', dbError);
      res.status(500).json({ 
        message: 'Database error during login', 
        error: dbError.message 
      });
    }
  } catch (error: any) {
    console.error('Unexpected error logging in user:', error);
    res.status(500).json({ 
      message: 'Error logging in user', 
      error: error.message 
    });
  }
}; 