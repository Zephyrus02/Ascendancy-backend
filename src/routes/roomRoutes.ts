import express from 'express';
import { createRoom, getAllRooms, joinRoom, getRoomStatus } from '../controllers/roomController';

const router = express.Router();

router.post('/create', createRoom);
router.get('/', getAllRooms);
router.post('/join', joinRoom);
router.get('/:roomCode/status', getRoomStatus);

export default router;