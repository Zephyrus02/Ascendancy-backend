import express from 'express';
import { createTeam, getAllTeams, getTeamByUserId, updateTeam } from '../controllers/teamController';

const router = express.Router();

router.post('/', createTeam);
router.get('/', getAllTeams);
router.get('/user/:userId', getTeamByUserId);
router.put('/:id', updateTeam);
router.post('/:id/verify', updateTeam); // Add verify route

export default router;