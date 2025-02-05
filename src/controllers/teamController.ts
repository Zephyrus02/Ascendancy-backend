import { Request, Response } from 'express';
import { Team } from '../models/Team';

export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received request body:', req.body);

    if (!req.body.userId || !req.body.username) {
      res.status(400).json({ message: 'User ID and username are required' });
      return;
    }

    const team = new Team(req.body);
    const savedTeam = await team.save();
    res.status(200).json({ 
      message: 'Team created successfully'
    });
  } catch (err: any) {
    console.error('Error creating team:', err);
    if (err.code === 11000) {
      res.status(400).json({ message: 'Team name already exists' });
      return;
    }
    res.status(400).json({ message: err.message || 'Error creating team' });
  }
};

export const getAllTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching teams' });
  }
};

export const getTeamById = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }
    res.json(team);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching team' });
  }
};

export const getTeamDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findOne({ 
      _id: req.params.teamId,
      userId: req.query.userId 
    });
    
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }
    
    res.json(team);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching team details' });
  }
};

export const getTeamByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findOne({ userId: req.params.userId });
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }
    res.json(team);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log('Updating team with ID:', id);
    console.log('Update payload:', req.body);

    const team = await Team.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    console.log('Updated team:', team);
    res.json(team);
  } catch (err: any) {
    console.error('Update error:', err);
    res.status(500).json({ message: err.message });
  }
};