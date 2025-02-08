import express from 'express';
import { createRoom, getAllRooms, joinRoom, getRoomStatus, deleteRoom } from '../controllers/roomController';

const router = express.Router();

router.post('/create', createRoom);
router.get('/', getAllRooms);
router.post('/join', joinRoom);
router.get('/:roomCode/status', getRoomStatus);
router.delete('/:roomCode', deleteRoom);

export default router;