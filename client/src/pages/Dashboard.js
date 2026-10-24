import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiArrowRight,
  FiRefreshCw,
  FiActivity,
} from 'react-icons/fi';
import StatsCards from '../components/dashboard/StatsCards';
import PortfolioChart from '../components/dashboard/PortfolioChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import WatchlistWidget from '../components/dashboard/WatchlistWidget';
import Loader from '../components/common/Loader';
import { loadUser } from '../redux/slices/authSlice';
import { getStocks } from '../redux/slices/stockSlice';
import { getPortfolioSummary } from '../redux/slices/portfolioSlice';
import { getTransactions, getTransactionStats } from '../redux/slices/transactionSlice';
import { getWatchlist, removeFromWatchlist } from '../redux/slices/watchlistSlice';
import { formatCurrency, formatPercent } from '../utils/formatters';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stocks, loading: stocksLoading } = useSelector((state) => state.stocks);
  const { summary } = useSelector((state) => state.portfolio);
  const { transactions, stats } = useSelector((state) => state.transactions);
  const { watchlist } = useSelector((state) => state.watchlist);

  useEffect(() => {
    dispatch(loadUser());
    dispatch(getStocks());
    dispatch(getPortfolioSummary());
    dispatch(getTransactions({ page: 1, limit: 5 }));
    dispatch(getTransactionStats());
    dispatch(getWatchlist());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(loadUser());
    dispatch(getStocks());
    dispatch(getPortfolioSummary());
    dispatch(getTransactions({ page: 1, limit: 5 }));
    dispatch(getWatchlist());
  };

  const handleRemoveWatchlist = (stockId) => {
    dispatch(removeFromWatchlist(stockId));
  };

  // Calculate Market Movers
  const { topGainers, topLosers, tickerItems } = useMemo(() => {
    const sorted = [...stocks].sort((a, b) => {
      const changeA = a.changePercent ?? a.percentChange ?? 0;
      const changeB = b.changePercent ?? b.percentChange ?? 0;
      return changeB - changeA;
    });

    return {
      topGainers: sorted.slice(0, 4),
      topLosers: [...sorted].reverse().slice(0, 4),
      tickerItems: stocks.slice(0, 12),
    };
  }, [stocks]);

  const isLoading = stocksLoading && stocks.length === 0 && !summary;

  if (isLoading) {
    return <Loader fullScreen message="Loading TradeX dashboard..." />;
  }

  return (
    <div className="d-flex flex-column gap-3 pb-3">
      {/* ── Ticker Tape ── */}
      {tickerItems.length > 0 && (
        <div className="ticker-tape rounded" style={{ marginBottom: '4px' }}>
          <div className="ticker-tape-inner">
            {[...tickerItems, ...tickerItems].map((s, i) => {
              const change = s.changePercent ?? s.percentChange ?? 0;
              const isUp = change >= 0;
              return (
                <div className="ticker-item" key={`${s._id || s.id}-${i}`}>
                  <span className="symbol">{s.symbol}</span>
                  <span className="price">{formatCurrency(s.price)}</span>
                  <span className={isUp ? 'change-up' : 'change-down'}>
                    {isUp ? '+' : ''}{formatPercent(change)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Header Row ── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h5 className="fw-bold mb-0" style={{ color: 'var(--text-strong)' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Trader'}
            </h5>
          </div>
          <p className="fs-8 mb-0 mt-1" style={{ color: 'var(--text-secondary)' }}>
            Market overview and portfolio performance
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={handleRefresh}
            className="btn btn-dark-outline btn-sm d-flex align-items-center gap-1 px-2 py-1"
            title="Refresh feeds"
          >
            <FiRefreshCw size={13} />
            <span className="fs-8">Refresh</span>
          </button>
          <Link to="/stocks" className="btn btn-primary btn-sm d-flex align-items-center gap-1 px-3 py-1">
            <FiActivity size={13} />
            <span className="fs-8">Explore Markets</span>
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <StatsCards
        user={user}
        summary={summary}
        stats={stats}
        totalTradesCount={transactions.length}
      />

      {/* ── Charts & Activity ── */}
      <div className="row g-3">
        <div className="col-12 col-lg-5 col-xl-4">
          <PortfolioChart
            holdings={summary?.holdings || []}
            cashBalance={user?.balance || 100000}
          />
        </div>
        <div className="col-12 col-lg-7 col-xl-8">
          <RecentTransactions transactions={transactions} maxItems={5} />
        </div>
      </div>

      {/* ── Market Movers & Watchlist ── */}
      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <WatchlistWidget
            watchlist={watchlist}
            onRemove={handleRemoveWatchlist}
          />
        </div>

        <div className="col-12 col-lg-7">
          <div className="tradex-card p-3 h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fs-7 fw-bold mb-0" style={{ color: 'var(--text-strong)' }}>Market Movers</h6>
                <span className="fs-9" style={{ color: 'var(--text-muted)' }}>Top gainers and losers</span>
              </div>
              <Link to="/stocks" className="fs-9 fw-semibold text-decoration-none d-flex align-items-center gap-1" style={{ color: 'var(--primary-accent)' }}>
                View All <FiArrowRight size={11} />
              </Link>
            </div>

            <div className="row g-3 flex-grow-1">
              {/* Top Gainers */}
              <div className="col-12 col-md-6">
                <div className="p-2 h-100" style={{ background: 'var(--bg-dark)', borderRadius: '4px', border: '1px solid var(--card-border)' }}>
                  <div className="d-flex align-items-center gap-2 mb-2 px-1">
                    <FiTrendingUp size={13} style={{ color: 'var(--success-color)' }} />
                    <span className="fs-8 fw-bold" style={{ color: 'var(--text-strong)' }}>Gainers</span>
                  </div>

                  {topGainers.length === 0 ? (
                    <p className="fs-9" style={{ color: 'var(--text-muted)' }}>No data</p>
                  ) : (
                    <div className="d-flex flex-column gap-1">
                      {topGainers.map((s) => (
                        <Link
                          key={s._id || s.id}
                          to={`/stocks/${s._id || s.id}`}
                          className="d-flex justify-content-between align-items-center px-2 py-1 rounded text-decoration-none watchlist-item-hover"
                        >
                          <div>
                            <span className="fw-bold font-mono fs-8 d-block" style={{ color: 'var(--text-strong)' }}>{s.symbol}</span>
                            <span className="fs-9" style={{ color: 'var(--text-muted)' }}>{formatCurrency(s.price)}</span>
                          </div>
                          <span className="font-mono fs-9 fw-semibold" style={{ color: 'var(--success-color)' }}>
                            +{formatPercent(Math.abs(s.changePercent ?? s.percentChange ?? 0))}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Losers */}
              <div className="col-12 col-md-6">
                <div className="p-2 h-100" style={{ background: 'var(--bg-dark)', borderRadius: '4px', border: '1px solid var(--card-border)' }}>
                  <div className="d-flex align-items-center gap-2 mb-2 px-1">
                    <FiTrendingDown size={13} style={{ color: 'var(--danger-color)' }} />
                    <span className="fs-8 fw-bold" style={{ color: 'var(--text-strong)' }}>Losers</span>
                  </div>

                  {topLosers.length === 0 ? (
                    <p className="fs-9" style={{ color: 'var(--text-muted)' }}>No data</p>
                  ) : (
                    <div className="d-flex flex-column gap-1">
                      {topLosers.map((s) => (
                        <Link
                          key={s._id || s.id}
                          to={`/stocks/${s._id || s.id}`}
                          className="d-flex justify-content-between align-items-center px-2 py-1 rounded text-decoration-none watchlist-item-hover"
                        >
                          <div>
                            <span className="fw-bold font-mono fs-8 d-block" style={{ color: 'var(--text-strong)' }}>{s.symbol}</span>
                            <span className="fs-9" style={{ color: 'var(--text-muted)' }}>{formatCurrency(s.price)}</span>
                          </div>
                          <span className="font-mono fs-9 fw-semibold" style={{ color: 'var(--danger-color)' }}>
                            -{formatPercent(Math.abs(s.changePercent ?? s.percentChange ?? 0))}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
