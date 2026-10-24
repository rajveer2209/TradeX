import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiExternalLink, FiTrendingUp, FiTrendingDown, FiX } from 'react-icons/fi';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const WatchlistWidget = ({ watchlist = [], onRemove }) => {
  const navigate = useNavigate();

  return (
    <div className="tradex-card p-3 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fs-6 fw-bold text-white mb-0">Watchlist</h5>
          <span className="text-secondary fs-8">Monitored assets</span>
        </div>
        <Link
          to="/watchlist"
          className="btn btn-sm btn-link text-primary text-decoration-none d-flex align-items-center gap-1 p-0 fs-8 fw-semibold hover-underline"
        >
          View All ({watchlist.length}) <FiExternalLink size={12} />
        </Link>
      </div>

      {watchlist.length === 0 ? (
        <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-4 text-center">
          <p className="text-secondary fs-7 mb-2">No stocks in your watchlist.</p>
          <Link to="/stocks" className="btn btn-sm btn-outline-primary">
            Discover Stocks
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2 flex-grow-1 overflow-auto" style={{ maxHeight: '320px' }}>
          {watchlist.slice(0, 6).map((item) => {
            const stock = item.stock || item;
            const stockId = stock._id || stock.id;
            const isPositive = (stock.change ?? 0) >= 0;
            const changePercent = stock.changePercent ?? (stock.percentChange ?? 0);

            return (
              <div
                key={stockId}
                className="d-flex align-items-center justify-content-between p-2 rounded-2 watchlist-item-hover cursor-pointer"
                onClick={() => navigate(`/stocks/${stockId}`)}
              >
                <div>
                  <div className="fw-bold text-white fs-7">{stock.symbol}</div>
                  <div className="text-secondary fs-8 text-truncate" style={{ maxWidth: '110px' }}>
                    {stock.name}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="text-end">
                    <div className="font-mono text-white fw-bold fs-7">
                      {formatCurrency(stock.price)}
                    </div>
                    <div
                      className={`d-flex align-items-center justify-content-end gap-1 font-mono fs-8 ${
                        isPositive ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {isPositive ? <FiTrendingUp size={11} /> : <FiTrendingDown size={11} />}
                      {formatPercent(changePercent)}
                    </div>
                  </div>

                  {onRemove && (
                    <button
                      className="btn btn-icon btn-sm text-secondary hover-danger p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(stockId);
                      }}
                      title="Remove from watchlist"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WatchlistWidget;
