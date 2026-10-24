import React, { useState } from 'react';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiBookmark,
  FiActivity,
  FiCheck,
} from 'react-icons/fi';
import {
  formatCurrency,
  formatPercent,
  formatCompactNumber,
} from '../../utils/formatters';
import TradeModal from './TradeModal';

const StockDetail = ({
  stock,
  isWatchlisted = false,
  onWatchlistToggle,
}) => {
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [initialTradeType, setInitialTradeType] = useState('BUY');

  if (!stock) return null;

  const stockId = stock._id || stock.id;
  const isPositive = (stock.change ?? 0) >= 0;
  const changePercent = stock.changePercent ?? (stock.percentChange ?? 0);

  const openTrade = (type) => {
    setInitialTradeType(type);
    setTradeModalOpen(true);
  };

  // Metrics
  const stats = [
    { label: 'Market Cap', value: formatCompactNumber(stock.marketCap || stock.price * 1500000000) },
    { label: 'Volume (24h)', value: formatCompactNumber(stock.volume || 18450200) },
    { label: 'Day High', value: formatCurrency(stock.dayHigh || stock.high || stock.price * 1.025) },
    { label: 'Day Low', value: formatCurrency(stock.dayLow || stock.low || stock.price * 0.982) },
    { label: '52-Week High', value: formatCurrency(stock.fiftyTwoWeekHigh || stock.price * 1.35) },
    { label: '52-Week Low', value: formatCurrency(stock.fiftyTwoWeekLow || stock.price * 0.72) },
    { label: 'Open Price', value: formatCurrency(stock.open || stock.price - (stock.change || 0)) },
    { label: 'P/E Ratio', value: stock.peRatio ? Number(stock.peRatio).toFixed(2) : '24.8' },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* Stock Header & Actions */}
      <div className="tradex-card p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h2 className="text-white fw-bold mb-0 font-mono">{stock.symbol}</h2>
              <span className="badge-sector">{stock.sector || 'Equities'}</span>
            </div>
            <p className="text-secondary fs-6 mb-0">{stock.name}</p>
          </div>

          {/* Action Buttons: Buy, Sell, Watchlist */}
          <div className="d-flex align-items-center gap-2 w-100 w-md-auto">
            <button
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-1 ${
                isWatchlisted ? 'btn-outline-warning' : 'btn-outline-secondary'
              }`}
              onClick={() => onWatchlistToggle(stockId)}
            >
              {isWatchlisted ? <FiCheck size={16} /> : <FiBookmark size={16} />}
              <span>{isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>

            <button
              type="button"
              className="btn btn-order-buy btn-sm px-3 fw-bold flex-fill flex-md-grow-0"
              onClick={() => openTrade('BUY')}
            >
              Buy {stock.symbol}
            </button>

            <button
              type="button"
              className="btn btn-order-sell btn-sm px-3 fw-bold flex-fill flex-md-grow-0"
              onClick={() => openTrade('SELL')}
            >
              Sell {stock.symbol}
            </button>
          </div>
        </div>

        {/* Live Price Row */}
        <div className="d-flex align-items-baseline gap-3 mt-4 pt-3 border-top border-dark-subtle">
          <h1 className="font-mono text-white fw-bold mb-0">
            {formatCurrency(stock.price)}
          </h1>
          <div
            className={`d-flex align-items-center gap-1 font-mono fs-5 fw-semibold ${
              isPositive ? 'text-success' : 'text-danger'
            }`}
          >
            {isPositive ? <FiTrendingUp size={20} /> : <FiTrendingDown size={20} />}
            <span>
              {isPositive ? '+' : ''}
              {formatCurrency(stock.change || 0)} ({formatPercent(changePercent)})
            </span>
          </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="tradex-card p-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <FiActivity className="text-primary-accent" size={18} />
          <h5 className="fs-6 fw-bold text-white mb-0">Key Market Statistics</h5>
        </div>

        <div className="row g-3">
          {stats.map((stat, idx) => (
            <div className="col-6 col-md-3" key={idx}>
              <div className="stat-metric-tile p-2 rounded-2">
                <span className="text-secondary fs-8 text-uppercase tracking-wider d-block mb-1">
                  {stat.label}
                </span>
                <span className="font-mono text-white fw-bold fs-6">
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description / Overview if present */}
      {stock.description && (
        <div className="tradex-card p-4">
          <h5 className="fs-6 fw-bold text-white mb-2">About {stock.name}</h5>
          <p className="text-secondary fs-7 leading-relaxed mb-0">
            {stock.description}
          </p>
        </div>
      )}

      {/* Trade Modal instance */}
      <TradeModal
        show={tradeModalOpen}
        onHide={() => setTradeModalOpen(false)}
        stock={stock}
        initialType={initialTradeType}
      />
    </div>
  );
};

export default StockDetail;
