import { Request, Response } from 'express';
import { Room } from '../models/Room';
import crypto from 'crypto';

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchId, team1Captain, team2Captain } = req.body;
    
    // Generate random room key
    const roomKey = crypto.randomBytes(4).toString('hex').toUpperCase();

    const room = new Room({
      roomKey,
      matchId,
      team1Captain,
      team2Captain
    });

    await room.save();
    res.status(201).json(room);
  } catch (err) {
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
    if (room.team1Captain.userId !== userId && room.team2Captain.userId !== userId) {
      res.status(403).json({ message: 'Unauthorized access' });
      return;
    }

    // Update joined status
    if (room.team1Captain.userId === userId) {
      room.team1Captain.joined = true;
    } else {
      room.team2Captain.joined = true;
    }

    await room.save();
    res.json(room);
  } catch (err) {
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