import express from 'express';
import { createMatch } from '../controllers/matchController';

const router = express.Router();

router.post('/', createMatch);

export default router;