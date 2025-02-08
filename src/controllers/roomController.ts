import { Request, Response } from 'express';
import { Room } from '../models/Room';
import { User } from '../models/User';
import { Match } from '../models/Match';
import crypto from 'crypto';
import { valorantMaps } from '../data/maps';
import { sendRoomNotification } from '../services/emailService';

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchId, adminId, adminUsername, team1, team2 } = req.body;

    // Check if captains exist and have email addresses
    const [team1Captain, team2Captain] = await Promise.all([
      User.findOne({ userId: team1.captainId }),
      User.findOne({ userId: team2.captainId })
    ]);

    if (!team1Captain?.email || !team2Captain?.email) {
      res.status(400).json({ message: 'Captain email addresses not found' });
      return;
    }

    // Generate room codes
    const roomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const roomPasskey = crypto.randomBytes(3).toString('hex').toUpperCase();

    const room = new Room({
      roomCode,
      roomPasskey,
      adminId,
      adminUsername,
      matchId,
      team1: {
        teamId: team1.id,
        teamName: team1.name,
        captainId: team1.captainId,
        captainUsername: team1.captainUsername,
        joined: false
      },
      team2: {
        teamId: team2.id,
        teamName: team2.name,
        captainId: team2.captainId,
        captainUsername: team2.captainUsername,
        joined: false
      }
    });

    await room.save();

    // Try to send emails
    try {
      await sendRoomNotification({
        roomCode,
        roomPasskey,
        team1: {
          captainEmail: team1Captain.email,
          teamName: team1.name
        },
        team2: {
          captainEmail: team2Captain.email,
          teamName: team2.name
        }
      });
      console.log('Email notifications sent successfully');
    } catch (emailError) {
      console.error('Failed to send email notifications:', emailError);
      // Continue with room creation even if email fails
    }

    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
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
    const { roomCode } = req.params;
    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    res.json({
      roomCode: room.roomCode,
      roomPasskey: room.roomPasskey,
      adminId: room.adminId,
      adminUsername: room.adminUsername,
      adminJoined: room.adminJoined,
      team1: {
        teamId: room.team1.teamId,
        teamName: room.team1.teamName,
        captainId: room.team1.captainId,
        captainUsername: room.team1.captainUsername,
        joined: room.team1.joined
      },
      team2: {
        teamId: room.team2.teamId,
        teamName: room.team2.teamName,
        captainId: room.team2.captainId,
        captainUsername: room.team2.captainUsername,
        joined: room.team2.joined
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching room status' });
  }
};

export const startPickBan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomCode } = req.params;
    const room = await Room.findOne({ roomCode });

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    // Initialize pick/ban state with all maps
    room.pickBanState = {
      isStarted: true,
      currentTurn: room.team1.teamId,
      remainingMaps: valorantMaps.map(map => map.id),
      selectedMap: undefined
    };

    await room.save();
    res.json(room.pickBanState);
  } catch (error) {
    console.error('Error starting pick/ban:', error);
    res.status(500).json({ message: 'Error starting pick/ban' });
  }
};

export const banMap = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomCode } = req.params;
    const { mapId } = req.body;
    const room = await Room.findOne({ roomCode });

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    // Remove the banned map
    const mapIndex = room.pickBanState.remainingMaps.indexOf(mapId);
    if (mapIndex > -1) {
      room.pickBanState.remainingMaps.splice(mapIndex, 1);
    }

    // If only one map remains, it's the selected map
    if (room.pickBanState.remainingMaps.length === 1) {
      room.pickBanState.selectedMap = room.pickBanState.remainingMaps[0];
      
      // Update match with selected map
      await Match.findByIdAndUpdate(room.matchId, {
        selectedMap: room.pickBanState.selectedMap
      });
    }

    // Switch turns
    room.pickBanState.currentTurn = 
      room.pickBanState.currentTurn === room.team1.teamId 
        ? room.team2.teamId 
        : room.team1.teamId;

    await room.save();
    res.json(room.pickBanState);
  } catch (error) {
    console.error('Error banning map:', error);
    res.status(500).json({ message: 'Error banning map' });
  }
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomCode } = req.params;
    const room = await Room.findOneAndDelete({ roomCode: roomCode.toUpperCase() });

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ message: 'Error deleting room' });
  }
};