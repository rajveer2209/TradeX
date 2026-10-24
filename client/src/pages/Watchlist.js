import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiEye,
  FiTrash2,
  FiTrendingUp,
  FiTrendingDown,
  FiExternalLink,
  FiPlus,
} from 'react-icons/fi';
import Loader from '../components/common/Loader';
import TradeModal from '../components/stocks/TradeModal';
import {
  getWatchlist,
  removeFromWatchlist,
} from '../redux/slices/watchlistSlice';
import {
  formatCurrency,
  formatPercent,
  formatCompactNumber,
} from '../utils/formatters';

const Watchlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { watchlist, loading } = useSelector((state) => state.watchlist);

  const [activeStock, setActiveStock] = useState(null);
  const [tradeType, setTradeType] = useState('BUY');

  useEffect(() => {
    dispatch(getWatchlist());
  }, [dispatch]);

  const handleRemove = async (stockId) => {
    const res = await dispatch(removeFromWatchlist(stockId));
    if (removeFromWatchlist.fulfilled.match(res)) {
      toast.info('Stock removed from watchlist');
    }
  };

  const handleOpenTrade = (stock, type) => {
    setActiveStock(stock);
    setTradeType(type);
  };

  return (
    <div className="d-flex flex-column gap-4 pb-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="text-white fw-bold mb-0">Monitored Watchlist</h2>
            <span className="badge-sector">{watchlist.length} Stocks</span>
          </div>
          <p className="text-secondary fs-7 mb-0 mt-1">
            Real-time price tracker for your favored market positions
          </p>
        </div>

        <Link to="/stocks" className="btn btn-sm btn-primary d-flex align-items-center gap-1">
          <FiPlus size={16} /> Add More Stocks
        </Link>
      </div>

      {loading ? (
        <Loader message="Loading watchlist..." />
      ) : watchlist.length === 0 ? (
        <div className="tradex-card p-5 text-center my-4">
          <div className="brand-logo-icon mx-auto mb-3" style={{ width: '48px', height: '48px' }}>
            <FiEye className="text-primary-accent" size={24} />
          </div>
          <h4 className="text-white fw-bold mb-2">Your Watchlist is Empty</h4>
          <p className="text-secondary fs-7 mb-4">
            Track stocks you are interested in without owning them. Get live price updates anytime.
          </p>
          <Link to="/stocks" className="btn btn-primary px-4">
            Explore All Equities
          </Link>
        </div>
      ) : (
        <div className="row g-3">
          {watchlist.map((item) => {
            const stock = item.stock || item;
            const stockId = stock._id || stock.id || item.stockId;
            const isPositive = (stock.change ?? 0) >= 0;
            const changePercent = stock.changePercent ?? (stock.percentChange ?? 0);

            return (
              <div className="col-12 col-md-6 col-xl-4" key={stockId}>
                <div className="tradex-card p-3 h-100 d-flex flex-column justify-content-between">
                  <div>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div
                        className="cursor-pointer"
                        onClick={() => navigate(`/stocks/${stockId}`)}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <h4 className="text-white font-mono fw-bold mb-0 hover-primary">
                            {stock.symbol}
                          </h4>
                          <span className="badge-sector">{stock.sector || 'Equities'}</span>
                        </div>
                        <p className="text-secondary fs-8 mb-0 text-truncate" style={{ maxWidth: '200px' }}>
                          {stock.name}
                        </p>
                      </div>

                      <button
                        className="btn btn-icon btn-sm text-secondary hover-danger"
                        onClick={() => handleRemove(stockId)}
                        title="Remove from watchlist"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>

                    {/* Price and Trend */}
                    <div className="d-flex justify-content-between align-items-baseline my-3">
                      <div>
                        <span className="text-secondary fs-8 d-block">Current Price</span>
                        <h3 className="font-mono text-white fw-bold mb-0 fs-4">
                          {formatCurrency(stock.price)}
                        </h3>
                      </div>

                      <div
                        className={`d-flex align-items-center gap-1 font-mono fs-7 fw-semibold px-2 py-1 rounded ${
                          isPositive ? 'trend-positive' : 'trend-negative'
                        }`}
                      >
                        {isPositive ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
                        <span>{formatPercent(changePercent)}</span>
                      </div>
                    </div>

                    {/* Quick Metrics */}
                    <div className="row g-2 pt-2 border-top border-dark-subtle">
                      <div className="col-6">
                        <span className="text-secondary fs-8 d-block">Volume</span>
                        <span className="text-white font-mono fs-8">
                          {formatCompactNumber(stock.volume || 12500000)}
                        </span>
                      </div>
                      <div className="col-6 text-end">
                        <span className="text-secondary fs-8 d-block">Day High</span>
                        <span className="text-white font-mono fs-8">
                          {formatCurrency(stock.dayHigh || stock.high || stock.price * 1.02)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2 mt-3 pt-2 border-top border-dark-subtle">
                    <button
                      className="btn btn-sm btn-outline-primary w-100 fw-semibold"
                      onClick={() => handleOpenTrade(stock, 'BUY')}
                    >
                      Buy
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger w-100 fw-semibold"
                      onClick={() => handleOpenTrade(stock, 'SELL')}
                    >
                      Sell
                    </button>
                    <Link
                      to={`/stocks/${stockId}`}
                      className="btn btn-sm btn-dark-outline px-2"
                      title="View chart & details"
                    >
                      <FiExternalLink size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trade Modal */}
      {activeStock && (
        <TradeModal
          show={!!activeStock}
          onHide={() => setActiveStock(null)}
          stock={activeStock}
          initialType={tradeType}
        />
      )}
    </div>
  );
};

export default Watchlist;
