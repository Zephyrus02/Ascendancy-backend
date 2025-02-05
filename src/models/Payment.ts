import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String, 
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  receiptId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'completed', 'failed'],
    default: 'created'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Payment = mongoose.model('Payment', paymentSchema);