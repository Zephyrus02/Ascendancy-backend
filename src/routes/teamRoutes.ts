import express from 'express';
import { createTeam, getAllTeams, getTeamByUserId, updateTeam, deleteTeam, getVerifiedTeams } from '../controllers/teamController';

const router = express.Router();

router.post('/', createTeam);
router.get('/', getAllTeams);
router.get('/user/:userId', getTeamByUserId);
router.get('/verified', getVerifiedTeams);
router.put('/:id', updateTeam);
router.post('/:id/verify', updateTeam); // Add verify route
router.delete('/:id', deleteTeam);

export default router;