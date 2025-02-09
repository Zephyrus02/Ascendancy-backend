import mongoose, { Document } from 'mongoose';
import { ValorantMap } from '../data/maps';  // Updated import

interface MapStatus {
  [key: string]: 'available' | 'picked' | 'banned';
}

export interface IRoom extends Document {
  roomCode: string;
  roomPasskey: string;
  adminId: string;
  adminUsername: string;
  adminJoined: boolean;
  matchId: string;
  team1: {
    teamId: string;
    teamName: string;
    captainId: string;
    captainUsername: string;
    joined: boolean;
  };
  team2: {
    teamId: string;
    teamName: string;
    captainId: string;
    captainUsername: string;
    joined: boolean;
  };
  createdAt: Date;
  pickBanState: {
    isStarted: boolean;
    currentTurn: string;
    remainingMaps: ValorantMap[]; // Changed from Map[] to ValorantMap[]
    selectedMap?: ValorantMap;    // Changed from Map to ValorantMap
    mapVetoStarted: boolean;
    mapStatuses: MapStatus;  // Add this field
  };
}

const roomSchema = new mongoose.Schema<IRoom>({
  roomCode: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true
  },
  roomPasskey: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  adminId: {
    type: String,
    required: true
  },
  adminUsername: {
    type: String,
    required: true
  },
  adminJoined: {
    type: Boolean,
    default: false
  },
  matchId: {
    type: String,
    required: true
  },
  team1: {
    teamId: { type: String, required: true },
    teamName: { type: String, required: true },
    captainId: { type: String, required: true },
    captainUsername: { type: String, required: true },
    joined: { type: Boolean, default: false }
  },
  team2: {
    teamId: { type: String, required: true },
    teamName: { type: String, required: true },
    captainId: { type: String, required: true },
    captainUsername: { type: String, required: true },
    joined: { type: Boolean, default: false }
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 86400 // 24 hours in seconds
  },
  pickBanState: {
    isStarted: { type: Boolean, default: false },
    currentTurn: String,
    remainingMaps: [Object],
    selectedMap: Object,
    mapVetoStarted: { type: Boolean, default: false },
    mapStatuses: { type: Map, of: String, default: {} }  // Add this field
  }
});

// Add pre-save middleware to ensure uppercase
roomSchema.pre('save', function(next) {
  if (this.roomCode) {
    this.roomCode = this.roomCode.toUpperCase();
  }
  if (this.roomPasskey) {
    this.roomPasskey = this.roomPasskey.toUpperCase();
  }
  next();
});

// Drop the old index if it exists
const dropIndex = async () => {
  try {
    await mongoose.connection.collection('rooms').dropIndex('roomKey_1');
  } catch (err) {
    // Index might not exist, ignore error
  }
};

dropIndex();

export const Room = mongoose.model<IRoom>('Room', roomSchema);