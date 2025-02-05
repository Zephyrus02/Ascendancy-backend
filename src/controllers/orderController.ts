import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import { Payment } from '../models/Payment';
import { Team } from '../models/Team';
require('dotenv').config();

export const order = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, username } = req.body;

    if (!userId || !username) {
      res.status(400).json({ message: 'User ID and username are required' });
      return;
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_TEST_KEY_ID!,
      key_secret: process.env.RAZORPAY_TEST_KEY_SECRET!
    });

    const receiptId = `receipt:asc_${Date.now()}`;
    
    const options = {
      amount: 100, // Amount in paise (₹250)
      currency: "INR",
      receipt: receiptId
    };

    const order = await instance.orders.create(options);
    
    if (!order) {
      res.status(500).json({ message: 'Failed to create order' });
      return;
    }

    // Create payment record
    const payment = new Payment({
      userId,
      username,
      orderId: order.id,
      receiptId,
      status: 'created'
    });

    await payment.save();

    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, paymentId } = req.body;

    // Find and update payment status
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      { status: 'completed' },
      { new: true }
    );

    if (!payment) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }

    // Update team verification status
    const team = await Team.findOneAndUpdate(
      { userId: payment.userId },
      { verified: true },
      { new: true }
    );

    if (!team) {
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    res.json({
      payment,
      team
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};