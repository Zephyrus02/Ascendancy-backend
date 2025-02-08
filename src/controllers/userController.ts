import { Request, Response } from 'express';
import { User } from '../models/User';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, username, email } = req.body;

    if (!userId || !username || !email) {
      res.status(400).json({ message: 'userId, username and email are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      res.status(200).json(existingUser);
      return;
    }

    // Create new user
    const user = new User({ userId, username, email });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err: any) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: err.message || 'Error creating user' });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ userId: req.params.id });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};