import express from 'express';
import { order, verifyPayment } from '../controllers/orderController';

const router = express.Router();

router.post('/', order);
router.post('/verify', verifyPayment);

export default router;