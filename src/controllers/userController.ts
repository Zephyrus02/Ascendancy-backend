import { Request, Response } from 'express';
import { User } from '../models/User';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received create user request:', req.body);
    const { userId, username } = req.body;

    if (!userId || !username) {
      res.status(400).json({ message: 'userId and username are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      console.log('User already exists:', existingUser);
      res.status(200).json(existingUser);
      return;
    }

    // Create new user
    const user = new User({ userId, username });
    const savedUser = await user.save();
    console.log('Created new user:', savedUser);
    res.status(201).json(savedUser);
  } catch (err: any) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: err.message || 'Error creating user' });
  }
};