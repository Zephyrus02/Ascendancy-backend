import { Request, Response } from 'express';
import { Match } from '../models/Match';

export const createMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const match = new Match(req.body);
    await match.save();
    res.status(201).json(match);
  } catch (err) {
    res.status(500).json({ message: 'Error creating match' });
  }
};

export const getMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const matches = await Match.find()
      .sort({ date: 1, time: 1 }) // Sort by date and time
      .select('-__v');
    
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching matches' });
  }
};