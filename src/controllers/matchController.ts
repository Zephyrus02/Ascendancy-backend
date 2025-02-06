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