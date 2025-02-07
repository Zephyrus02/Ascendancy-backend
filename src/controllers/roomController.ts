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
    const { roomCode, roomPasskey, userId, isAdmin } = req.body;

    const room = await Room.findOne({ 
      roomCode: roomCode.toUpperCase(),
      roomPasskey: roomPasskey.toUpperCase()
    });

    if (!room) {
      res.status(404).json({ message: 'Invalid room code or passkey' });
      return;
    }

    // Check if user is admin
    if (isAdmin) {
      if (room.adminId !== userId) {
        res.status(403).json({ message: 'You are not authorized as admin' });
        return;
      }

      room.adminJoined = true;
      await room.save();

      res.json({
        authorized: true,
        roomCode: room.roomCode,
        isAdmin: true,
        room: {
          team1: {
            teamName: room.team1.teamName,
            joined: room.team1.joined
          },
          team2: {
            teamName: room.team2.teamName,
            joined: room.team2.joined
          },
          adminJoined: room.adminJoined,
          adminId: room.adminId
        }
      });
      return;
    }

    // Existing captain join logic
    const isTeam1Captain = room.team1.captainId === userId;
    const isTeam2Captain = room.team2.captainId === userId;

    if (!isTeam1Captain && !isTeam2Captain) {
      res.status(403).json({ message: 'You are not authorized to join this room' });
      return;
    }

    // Update joined status
    if (isTeam1Captain && !room.team1.joined) {
      room.team1.joined = true;
      await room.save();
    } else if (isTeam2Captain && !room.team2.joined) {
      room.team2.joined = true;
      await room.save();
    }

    res.json({
      authorized: true,
      roomCode: room.roomCode,
      teamNumber: isTeam1Captain ? 1 : 2,
      room: {
        team1: {
          teamName: room.team1.teamName,
          joined: room.team1.joined
        },
        team2: {
          teamName: room.team2.teamName,
          joined: room.team2.joined
        },
        adminJoined: room.adminJoined,
        adminId: room.adminId
      }
    });
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).json({ message: 'Error joining room' });
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