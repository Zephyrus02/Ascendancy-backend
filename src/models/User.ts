import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  username: {
    type: String,
    required: true
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  }
});

export const User = mongoose.model('User', userSchema);