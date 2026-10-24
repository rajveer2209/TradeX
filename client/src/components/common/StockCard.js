import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiTrendingDown, FiBookmark } from 'react-icons/fi';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const StockCard = ({
  stock,
  onTradeClick,
  isWatchlisted = false,
  onWatchlistToggle,
}) => {
  const navigate = useNavigate();
  if (!stock) return null;

  const stockId = stock._id || stock.id;
  const isPositive = (stock.change ?? 0) >= 0;
  const changePercent = stock.changePercent ?? (stock.percentChange ?? 0);

  const handleCardClick = (e) => {
    // Prevent navigation if clicking on action buttons
    if (e.target.closest('button')) return;
    navigate(`/stocks/${stockId}`);
  };

  return (
    <div
      className="tradex-card stock-card h-100 cursor-pointer p-3"
      onClick={handleCardClick}
    >
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h5 className="stock-symbol mb-0 text-white fw-bold">{stock.symbol}</h5>
            <span className="badge-sector">{stock.sector || 'General'}</span>
          </div>
          <p className="stock-name text-secondary mb-0 text-truncate" style={{ maxWidth: '180px' }}>
            {stock.name}
          </p>
        </div>

        {onWatchlistToggle && (
          <button
            className={`btn btn-sm btn-icon ${
              isWatchlisted ? 'text-warning' : 'text-secondary hover-white'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onWatchlistToggle(stockId);
            }}
            title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <FiBookmark className={isWatchlisted ? 'fill-warning' : ''} />
          </button>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-end mt-3">
        <div>
          <div className="text-secondary fs-8 text-uppercase fw-semibold mb-1">Price</div>
          <div className="fs-5 fw-bold text-white font-mono">
            {formatCurrency(stock.price)}
          </div>
        </div>

        <div className="text-end">
          <div className="text-secondary fs-8 text-uppercase fw-semibold mb-1">24h Change</div>
          <div
            className={`d-inline-flex align-items-center gap-1 font-mono fw-semibold px-2 py-1 rounded ${
              isPositive ? 'trend-positive' : 'trend-negative'
            }`}
          >
            {isPositive ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
            <span>{formatPercent(changePercent)}</span>
          </div>
        </div>
      </div>

      {onTradeClick && (
        <div className="mt-3 pt-2 border-top border-dark-subtle d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary w-100 fw-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onTradeClick(stock, 'BUY');
            }}
          >
            Buy
          </button>
          <button
            className="btn btn-sm btn-outline-danger w-100 fw-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onTradeClick(stock, 'SELL');
            }}
          >
            Sell
          </button>
        </div>
      )}
    </div>
  );
};

export default StockCard;
