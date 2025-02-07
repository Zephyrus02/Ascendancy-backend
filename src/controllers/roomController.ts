import { Request, Response } from 'express';
import { Room } from '../models/Room';
import { User } from '../models/User';
import { Match } from '../models/Match';
import crypto from 'crypto';

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchId, adminId, team1, team2 } = req.body;
    
    // Generate 6 character room code and passkey
    const roomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const roomPasskey = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Get admin username
    const admin = await User.findOne({ userId: adminId });
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    // Get captain usernames
    const team1Captain = await User.findOne({ userId: team1.captainId });
    const team2Captain = await User.findOne({ userId: team2.captainId });

    if (!team1Captain || !team2Captain) {
      res.status(404).json({ message: 'One or both team captains not found' });
      return;
    }

    // Update match status to started
    await Match.findByIdAndUpdate(matchId, { status: 'started' });

    const room = new Room({
      roomCode,
      roomPasskey,
      adminId,
      adminUsername: admin.username,
      team1: {
        teamId: team1.id,
        teamName: team1.name,
        captainId: team1.captainId,
        captainUsername: team1Captain.username,
        joined: false
      },
      team2: {
        teamId: team2.id,
        teamName: team2.name,
        captainId: team2.captainId,
        captainUsername: team2Captain.username,
        joined: false
      }
    });

    await room.save();
    res.status(201).json(room);
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ message: 'Error creating room' });
  }
};

export const getAllRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching rooms' });
  }
};

export const joinRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomKey, userId } = req.body;
    
    const room = await Room.findOne({ roomKey });
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    // Validate user is authorized to join
    if (room.team1.captainId !== userId && room.team2.captainId !== userId) {
      res.status(403).json({ message: 'Unauthorized access' });
      return;
    }

    // Update joined status
    if (room.team1.captainId === userId) {
      room.team1.joined = true;
    } else {
      room.team2.joined = true;
    }

    await room.save();
    res.json(room);
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRoomStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomKey } = req.params;
    const room = await Room.findOne({ roomKey });
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};