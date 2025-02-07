import { Request, Response } from 'express';
import { Match } from '../models/Match';
import { User } from '../models/User';

export const createMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { team1, team2, ...matchData } = req.body;

    const match = new Match({
      team1: {
        id: team1.id,
        name: team1.name,
        logo: team1.logo,
        captain: {
          userId: team1.captain.userId,
          username: team1.captain.username
        }
      },
      team2: {
        id: team2.id,
        name: team2.name,
        logo: team2.logo,
        captain: {
          userId: team2.captain.userId,
          username: team2.captain.username
        }
      },
      ...matchData
    });

    await match.save();
    res.status(201).json(match);
  } catch (err) {
    console.error('Error creating match:', err);
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

export const getPendingMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const matches = await Match.find({
      status: { $ne: 'completed' } // Get matches that aren't completed
    }).sort({ date: 1, time: 1 }); // Sort by date and time
    
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching matches' });
  }
};