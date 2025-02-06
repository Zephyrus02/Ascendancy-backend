import express from 'express';
import { createMatch, getMatches } from '../controllers/matchController';

const router = express.Router();

router.post('/', createMatch);
router.get('/', getMatches);

export default router;