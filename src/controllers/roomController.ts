import { Request, Response } from 'express';
import { Room } from '../models/Room';
import { User } from '../models/User';
import { Match } from '../models/Match';
import crypto from 'crypto';
import { valorantMaps } from '../data/maps';

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
      matchId, // Add this line
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

export const startPickBan = async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.params;
    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Initialize pick/ban state with all maps
    room.pickBanState = {
      isStarted: true,
      currentTurn: room.team1.teamId, // Random or predetermined first turn
      remainingMaps: valorantMaps.map(map => map.id),
      selectedMap: undefined
    };

    await room.save();
    res.json(room.pickBanState);
  } catch (error) {
    res.status(500).json({ message: 'Error starting pick/ban phase' });
  }
};

export const banMap = async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.params;
    const { mapId } = req.body;
    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
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
    res.status(500).json({ message: 'Error banning map' });
  }
};