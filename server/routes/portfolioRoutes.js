import express from 'express';
import {
  getPortfolio,
  getPortfolioSummary
} from '../controllers/portfolioController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', protect, getPortfolioSummary);
router.get('/', protect, getPortfolio);

export default router;
