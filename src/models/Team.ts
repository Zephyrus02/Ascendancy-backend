import mongoose from 'mongoose';
   
const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  valorantId: { type: String, required: true },
  rank: { type: String, required: true },
  role: { type: String, enum: ['Captain', 'Main', 'Substitute'], required: true },
  discordId: { type: String, required: true }
});

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  teamLogo: { type: String },
  members: [teamMemberSchema],
  userId: { type: String, required: true },
  username: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Team = mongoose.model('Team', teamSchema);