import express from 'express';
import { createTeam, getAllTeams, getTeamById, getTeamDetails, getTeamByUserId } from '../controllers/teamController';

const router = express.Router();

router.post('/', createTeam);
router.get('/', getAllTeams);
router.get('/user/:userId', getTeamByUserId);

export default router;