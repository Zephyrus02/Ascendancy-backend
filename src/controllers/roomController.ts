import { Request, Response } from 'express';
import { Room } from '../models/Room';
import { User } from '../models/User';
import { Match } from '../models/Match';
import crypto from 'crypto';
import { ValorantMap, valorantMaps } from '../data/maps';  // Updated import
import { sendRoomNotification } from '../services/emailService';

// Add the MapStatus interface
interface MapStatus {
  [key: string]: 'available' | 'picked' | 'banned';
}

export interface PickBanState {
  isStarted: boolean;
  currentTurn: string;
  firstPickTeam: string;
  remainingMaps: ValorantMap[];
  selectedMap?: ValorantMap;
  mapVetoStarted: boolean;
  mapStatuses: MapStatus;
  selectedSide?: {
    teamId: string;
    side: 'attack' | 'defend';
  };
  sideSelect?: {
    isStarted: boolean;
    currentTurn: string;
    selectedSide?: {
      teamId: string;
      side: 'attack' | 'defend';
    };
  };
}

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchId, adminId, adminUsername, team1, team2 } = req.body;

    // Check if match exists and update its status
    const match = await Match.findById(matchId);
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    await match.save();

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
      },
      pickBanState: {
        isStarted: false,
        mapVetoStarted: false,
        currentTurn: team1.id,
        remainingMaps: valorantMaps,
        selectedMap: undefined
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
      },
      pickBanState: room.pickBanState // Add this line
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

    // Randomly select first team
    const firstTeam = Math.random() < 0.5 ? room.team1 : room.team2;

    // Initialize map statuses
    const initialMapStatuses: MapStatus = {};
    valorantMaps.forEach(map => {
      initialMapStatuses[map.id] = 'available';
    });

    room.pickBanState = {
      isStarted: true,
      mapVetoStarted: true,
      currentTurn: firstTeam.teamId,
      firstPickTeam: firstTeam.teamId, // Store who got first pick
      remainingMaps: valorantMaps,
      selectedMap: undefined,
      mapStatuses: initialMapStatuses
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
    const { mapId, teamId } = req.body;
    const room = await Room.findOne({ roomCode });

    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    // Verify it's the team's turn
    if (room.pickBanState.currentTurn !== teamId) {
      res.status(403).json({ message: "Not your turn" });
      return;
    }

    // Remove the banned map
    room.pickBanState.remainingMaps = room.pickBanState.remainingMaps
      .filter(map => map.id !== mapId);

    // Update map status
    room.pickBanState.mapStatuses = {
      ...(room.pickBanState.mapStatuses || {}),
      [mapId]: 'banned'
    };

    // If only one map remains, it's the selected map
    if (room.pickBanState.remainingMaps.length === 1) {
      const finalMap = room.pickBanState.remainingMaps[0];
      room.pickBanState.selectedMap = finalMap;
      room.pickBanState.mapStatuses[finalMap.id] = 'picked';
      
      await Match.findByIdAndUpdate(room.matchId, {
        selectedMap: finalMap.id,
        status: 'ongoing'
      });
    } else {
      // Switch turns only if map veto continues
      room.pickBanState.currentTurn = 
        room.pickBanState.currentTurn === room.team1.teamId 
          ? room.team2.teamId 
          : room.team1.teamId;
    }

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