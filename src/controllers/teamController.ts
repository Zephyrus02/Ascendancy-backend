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

export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    
    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getVerifiedTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await Team.find({ verified: true })
      .select('_id teamName teamLogo members')
      .populate('members', 'name role userId _id');
    
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teams' });
  }
};

export const getVerifiedTeamById = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findOne({ 
      _id: req.params.id,
      verified: true 
    })
    .select('_id teamName teamLogo members userId username')
    .populate('members', 'name role userId _id');
    
    if (!team) {
      res.status(404).json({ message: 'Verified team not found' });
      return;
    }
    
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching team' });
  }
};