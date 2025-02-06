import mongoose, { Document } from 'mongoose';

interface ICaptain {
  userId: string;
  teamName: string;
  joined: boolean;
}

export interface IRoom extends Document {
  roomKey: string;
  matchId: string;
  team1Captain: ICaptain;
  team2Captain: ICaptain;
  createdAt: Date;
}

const roomSchema = new mongoose.Schema<IRoom>({
  roomKey: { 
    type: String, 
    required: true, 
    unique: true 
  },
  matchId: {
    type: String,
    required: true
  },
  team1Captain: {
    userId: { type: String, required: true },
    teamName: { type: String, required: true },
    joined: { type: Boolean, default: false }
  },
  team2Captain: {
    userId: { type: String, required: true },
    teamName: { type: String, required: true },
    joined: { type: Boolean, default: false }
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 3600
  }
});

export const Room = mongoose.model<IRoom>('Room', roomSchema);