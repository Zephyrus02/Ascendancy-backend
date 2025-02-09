import mongoose, { Document } from 'mongoose';
import { User } from './User';

export interface IMatch extends Document {
  team1: {
    id: string;
    name: string;
    logo: string;
    captain: {
      userId: string;
      username: string;
    };
  };
  team2: {
    id: string;
    name: string;
    logo: string;
    captain: {
      userId: string;
      username: string;
    };
  };
  date: string;
  time: string;
  round: number;
  status: 'yet to start' | 'ongoing' | 'completed';
  scores?: {
    team1Score: number;
    team2Score: number;
  };
}

const matchSchema = new mongoose.Schema<IMatch>({
  team1: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    logo: { type: String, required: true },
    captain: {
      userId: { type: String, required: true }, 
      username: { type: String, required: true }
    }
  },
  team2: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    logo: { type: String, required: true },
    captain: {
      userId: { type: String, required: true },  // Changed from id to userId
      username: { type: String, required: true }
    }
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  round: { type: Number, required: true },
  status: {
    type: String,
    enum: ['yet to start', 'ongoing', 'completed'],
    default: 'yet to start'
  },
  scores: {
    team1Score: { type: Number, default: 0 },
    team2Score: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

export const Match = mongoose.model<IMatch>('Match', matchSchema);