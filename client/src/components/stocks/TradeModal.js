import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiPlus, FiMinus, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { buyStock, sellStock } from '../../redux/slices/transactionSlice';
import { loadUser } from '../../redux/slices/authSlice';
import { getPortfolioSummary } from '../../redux/slices/portfolioSlice';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const TradeModal = ({ show, onHide, stock, initialType = 'BUY' }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { summary } = useSelector((state) => state.portfolio);
  const { tradingLoading } = useSelector((state) => state.transactions);

  const [tradeType, setTradeType] = useState(initialType);
  const [quantity, setQuantity] = useState(1);

  // Sync initial type when opened
  useEffect(() => {
    if (initialType) {
      setTradeType(initialType);
    }
    setQuantity(1);
  }, [initialType, show]);

  if (!stock) return null;

  const stockId = stock._id || stock.id;
  const currentPrice = Number(stock.price) || 0;
  const cashBalance = Number(user?.balance) || 0;

  // Find user's holdings for this stock
  const currentHolding = summary?.holdings?.find(
    (h) => (h.stock?._id || h.stock?.id || h.stockId || h._id) === stockId
  );
  const sharesOwned = currentHolding ? Number(currentHolding.quantity || currentHolding.shares) || 0 : 0;

  const totalCost = Number((currentPrice * quantity).toFixed(2));
  const maxBuyShares = currentPrice > 0 ? Math.floor(cashBalance / currentPrice) : 0;
  const maxSellShares = sharesOwned;

  const canAfford = tradeType === 'BUY' ? cashBalance >= totalCost : true;
  const hasEnoughShares = tradeType === 'SELL' ? sharesOwned >= quantity : true;
  const isValidOrder = quantity > 0 && (tradeType === 'BUY' ? canAfford : hasEnoughShares);

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleSetMax = () => {
    if (tradeType === 'BUY') {
      setQuantity(Math.max(1, maxBuyShares));
    } else {
      setQuantity(Math.max(1, maxSellShares));
    }
  };

  const handlePresetPercent = (pct) => {
    if (tradeType === 'BUY') {
      const targetSpend = cashBalance * (pct / 100);
      const targetShares = Math.floor(targetSpend / currentPrice);
      setQuantity(Math.max(1, targetShares));
    } else {
      const targetShares = Math.floor(sharesOwned * (pct / 100));
      setQuantity(Math.max(1, targetShares));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidOrder) return;

    try {
      if (tradeType === 'BUY') {
        const resultAction = await dispatch(
          buyStock({ stockId, quantity })
        );
        if (buyStock.fulfilled.match(resultAction)) {
          toast.success(
            `Successfully bought ${quantity} share(s) of ${stock.symbol} for ${formatCurrency(totalCost)}!`
          );
          dispatch(loadUser());
          dispatch(getPortfolioSummary());
          onHide();
        } else {
          toast.error(resultAction.payload || 'Failed to execute buy order');
        }
      } else {
        const resultAction = await dispatch(
          sellStock({ stockId, quantity })
        );
        if (sellStock.fulfilled.match(resultAction)) {
          toast.success(
            `Successfully sold ${quantity} share(s) of ${stock.symbol} for ${formatCurrency(totalCost)}!`
          );
          dispatch(loadUser());
          dispatch(getPortfolioSummary());
          onHide();
        } else {
          toast.error(resultAction.payload || 'Failed to execute sell order');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred during trade execution.');
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="tradex-modal-content"
      backdropClassName="tradex-modal-backdrop"
    >
      <Modal.Header closeButton className="border-bottom border-dark-subtle pb-3">
        <div className="d-flex align-items-center gap-2">
          <div className="stock-avatar-badge">{stock.symbol.slice(0, 2)}</div>
          <div>
            <Modal.Title className="fs-5 fw-bold text-white mb-0">
              Trade {stock.symbol}
            </Modal.Title>
            <span className="text-secondary fs-8">{stock.name}</span>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="py-4">
        {/* Buy / Sell Tab Switcher */}
        <div className="trade-tab-pill-container d-flex p-1 rounded-3 mb-4">
          <button
            type="button"
            className={`trade-tab-btn flex-fill py-2 rounded-2 fw-bold fs-7 transition-all ${
              tradeType === 'BUY' ? 'active-buy' : 'text-secondary'
            }`}
            onClick={() => setTradeType('BUY')}
          >
            BUY
          </button>
          <button
            type="button"
            className={`trade-tab-btn flex-fill py-2 rounded-2 fw-bold fs-7 transition-all ${
              tradeType === 'SELL' ? 'active-sell' : 'text-secondary'
            }`}
            onClick={() => setTradeType('SELL')}
          >
            SELL
          </button>
        </div>

        {/* Price & Balance Quick Info */}
        <div className="row g-2 mb-3">
          <div className="col-6">
            <div className="p-2 rounded-2 bg-dark-surface border border-dark-subtle">
              <span className="text-secondary fs-8 d-block">Market Price</span>
              <span className="font-mono fw-bold text-white fs-6">
                {formatCurrency(currentPrice)}
              </span>
            </div>
          </div>
          <div className="col-6">
            <div className="p-2 rounded-2 bg-dark-surface border border-dark-subtle">
              <span className="text-secondary fs-8 d-block">
                {tradeType === 'BUY' ? 'Available Cash' : 'Shares Owned'}
              </span>
              <span className="font-mono fw-bold text-white fs-6">
                {tradeType === 'BUY' ? formatCurrency(cashBalance) : formatNumber(sharesOwned)}
              </span>
            </div>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="mb-3">
          <label className="text-secondary fs-8 fw-semibold text-uppercase tracking-wider mb-2 d-block">
            Number of Shares
          </label>
          <div className="input-group">
            <button
              className="btn btn-dark-outline px-3"
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1}
            >
              <FiMinus />
            </button>
            <input
              type="number"
              min="1"
              max={tradeType === 'BUY' ? (maxBuyShares > 0 ? maxBuyShares : 1) : sharesOwned}
              className="form-control text-center font-mono fw-bold fs-5 tradex-input"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setQuantity(isNaN(val) || val < 1 ? 1 : val);
              }}
            />
            <button
              className="btn btn-dark-outline px-3"
              type="button"
              onClick={handleIncrement}
            >
              <FiPlus />
            </button>
          </div>

          {/* Quick presets (25%, 50%, 75%, Max) */}
          <div className="d-flex gap-2 mt-2">
            {[25, 50, 75].map((pct) => (
              <button
                key={pct}
                type="button"
                className="btn btn-xs btn-preset flex-fill"
                onClick={() => handlePresetPercent(pct)}
              >
                {pct}%
              </button>
            ))}
            <button
              type="button"
              className="btn btn-xs btn-preset flex-fill"
              onClick={handleSetMax}
            >
              Max
            </button>
          </div>
        </div>

        {/* Cost Summary Breakdown */}
        <div className="border border-dark-subtle rounded-3 p-3 bg-dark-surface mb-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-secondary fs-7">Estimated {tradeType === 'BUY' ? 'Cost' : 'Proceeds'}:</span>
            <span className="font-mono fw-bold text-white fs-6">
              {formatCurrency(totalCost)}
            </span>
          </div>
          <div className="d-flex justify-content-between text-secondary fs-8">
            <span>Trading Fee (Simulation):</span>
            <span className="text-success fw-medium font-mono">$0.00 FREE</span>
          </div>
        </div>

        {/* Warning messages */}
        {tradeType === 'BUY' && !canAfford && (
          <div className="alert alert-danger py-2 px-3 fs-8 d-flex align-items-center gap-2 mb-3">
            <FiInfo size={16} />
            <span>Insufficient cash balance for this order. Max shares: {maxBuyShares}</span>
          </div>
        )}

        {tradeType === 'SELL' && !hasEnoughShares && (
          <div className="alert alert-danger py-2 px-3 fs-8 d-flex align-items-center gap-2 mb-3">
            <FiInfo size={16} />
            <span>You do not own enough shares to sell. Owned: {sharesOwned}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          disabled={!isValidOrder || tradingLoading}
          onClick={handleSubmit}
          className={`btn w-100 py-2 fw-bold text-uppercase tracking-wider fs-7 d-flex align-items-center justify-content-center gap-2 ${
            tradeType === 'BUY' ? 'btn-order-buy' : 'btn-order-sell'
          }`}
        >
          {tradingLoading ? (
            <div className="spinner-border spinner-border-sm" role="status"></div>
          ) : (
            <>
              <FiCheckCircle size={18} />
              Confirm {tradeType} Order
            </>
          )}
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default TradeModal;
