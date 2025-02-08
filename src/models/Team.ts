import mongoose from 'mongoose';
   
const teamMemberSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: function(this: any) {
      return this.role !== 'Substitute';
    }
  },
  valorantId: { 
    type: String, 
    required: function(this: any) {
      return this.role !== 'Substitute';
    }
  },
  rank: { 
    type: String, 
    required: function(this: any) {
      return this.role !== 'Substitute';
    }
  },
  discordId: { 
    type: String, 
    required: function(this: any) {
      return this.role !== 'Substitute';
    }
  },
  role: { 
    type: String, 
    enum: ['Captain', 'Main', 'Substitute'], 
    required: true 
  },
  userId: { type: String }
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

// Update the middleware to use deleteOne instead of remove
teamSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Add any cleanup logic here (e.g., removing related data)
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Team = mongoose.model('Team', teamSchema);