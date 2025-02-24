import express, { Router, RequestHandler } from 'express';
import { 
  createRoom, 
  getAllRooms, 
  joinRoom, 
  getRoomStatus, 
  deleteRoom,
  startPickBan,
  banMap,
  selectSide
} from '../controllers/roomController';

const router: Router = express.Router();

// Update routes to properly handle side selection
router.post('/:roomCode/select-side', selectSide as RequestHandler);

// Game room routes
router.post('/create', createRoom as RequestHandler);
router.get('/', getAllRooms as RequestHandler);
router.post('/join', joinRoom as RequestHandler);
router.get('/:roomCode/status', getRoomStatus as RequestHandler);
router.delete('/:roomCode', deleteRoom as RequestHandler);

// Pick/Ban routes
router.post('/:roomCode/start-pickban', startPickBan as RequestHandler);
router.post('/:roomCode/ban-map', banMap as RequestHandler);

export default router;