import express from 'express';
import { createMatch, getMatches, getPendingMatches } from '../controllers/matchController';

const router = express.Router();

router.post('/', createMatch);
router.get('/', getMatches);
router.get('/pending', getPendingMatches);

export default router;