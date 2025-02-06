import mongoose, { Document } from 'mongoose';

export interface IMatch extends Document {
  team1: {
    id: string;
    name: string;
    logo: string;  // Add logo field
    captain: {
      id: string;
      username: string;
    };
  };
  team2: {
    id: string;
    name: string;
    logo: string;  // Add logo field
    captain: {
      id: string;
      username: string;
    };
  };
  date: string;
  time: string;
  round: number;
  status: 'yet to start' | 'ongoing' | 'completed';
}

const matchSchema = new mongoose.Schema<IMatch>({
  team1: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    logo: { type: String, required: true },  // Add logo field
    captain: {
      id: { type: String, required: true },  // This will now store member _id
      username: { type: String, required: true }
    }
  },
  team2: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    logo: { type: String, required: true },  // Add logo field
    captain: {
      id: { type: String, required: true },  // This will now store member _id
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
  }
}, {
  timestamps: true
});

export const Match = mongoose.model<IMatch>('Match', matchSchema);