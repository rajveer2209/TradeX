import express from 'express';
import {
  getStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  simulatePriceUpdates
} from '../controllers/stockController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

// Specific routes before parameterized :id routes
router.post('/simulate-update', protect, authorize('admin'), simulatePriceUpdates);

router.route('/')
  .get(getStocks)
  .post(protect, authorize('admin'), createStock);

router.route('/:id')
  .get(getStockById)
  .put(protect, authorize('admin'), updateStock)
  .delete(protect, authorize('admin'), deleteStock);

export default router;
