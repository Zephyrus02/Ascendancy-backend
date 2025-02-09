import express from 'express';
import { createMatch, getMatches, getPendingMatches, updateMatchScore } from '../controllers/matchController';

const router = express.Router();

router.post('/', createMatch);
router.get('/', getMatches);
router.get('/pending', getPendingMatches);
router.put('/:matchId/score', updateMatchScore);

export default router;