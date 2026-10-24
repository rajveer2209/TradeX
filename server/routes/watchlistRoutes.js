import express from 'express';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
} from '../controllers/watchlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getWatchlist);
router.post('/add', protect, addToWatchlist);
router.delete('/remove/:stockId', protect, removeFromWatchlist);

export default router;
