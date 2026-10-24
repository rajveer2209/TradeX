import express from 'express';
import {
  buyStock,
  sellStock,
  getTransactions,
  getTransactionStats
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);
router.get('/stats', protect, getTransactionStats);
router.get('/', protect, getTransactions);

export default router;
