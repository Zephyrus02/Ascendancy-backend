import mongoose, { Document } from 'mongoose';

export interface IRoom extends Document {
  roomCode: string;
  roomPasskey: string;
  adminId: string;
  adminUsername: string;
  adminJoined: boolean;
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
    expires: 3600 
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

export const Room = mongoose.model<IRoom>('Room', roomSchema);