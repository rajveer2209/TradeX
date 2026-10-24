import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiRefreshCw } from 'react-icons/fi';
import PortfolioSummary from '../components/portfolio/PortfolioSummary';
import Holdings from '../components/portfolio/Holdings';
import PortfolioChart from '../components/dashboard/PortfolioChart';
import Loader from '../components/common/Loader';
import { getPortfolioSummary } from '../redux/slices/portfolioSlice';
import { loadUser } from '../redux/slices/authSlice';

const Portfolio = () => {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector((state) => state.portfolio);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getPortfolioSummary());
    dispatch(loadUser());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getPortfolioSummary());
    dispatch(loadUser());
  };

  const holdings = summary?.holdings || [];

  return (
    <div className="d-flex flex-column gap-4 pb-4">
      {/* Page Title */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="text-white fw-bold mb-0">Investment Portfolio</h2>
            <span className="badge-live-pulse">REAL-TIME P&L</span>
          </div>
          <p className="text-secondary fs-7 mb-0 mt-1">
            Monitor real-time unrealized capital performance and stock allocation
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="btn btn-sm btn-dark-outline d-flex align-items-center gap-2"
        >
          <FiRefreshCw size={14} />
          <span>Refresh Portfolio</span>
        </button>
      </div>

      {loading && !summary ? (
        <Loader message="Loading portfolio valuation..." />
      ) : (
        <>
          {/* Summary Cards */}
          <PortfolioSummary summary={summary} user={user} />

          {/* Allocation Breakdown and Analytics */}
          <div className="row g-4">
            <div className="col-12 col-lg-4">
              <PortfolioChart
                holdings={holdings}
                cashBalance={user?.balance || 100000}
              />
            </div>
            <div className="col-12 col-lg-8">
              <div className="tradex-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <h5 className="fs-6 fw-bold text-white mb-2">Portfolio Insights</h5>
                  <p className="text-secondary fs-7 mb-3 leading-relaxed">
                    Your portfolio currently has{' '}
                    <strong className="text-white">{holdings.length}</strong> active equity positions.
                    Simulation calculations include real-time spread analysis and instant execution.
                  </p>
                </div>

                <div className="row g-2 pt-3 border-top border-dark-subtle">
                  <div className="col-6 col-sm-4">
                    <span className="text-secondary fs-8 d-block">Asset Diversification</span>
                    <span className="text-white fw-semibold fs-7 font-mono">
                      {holdings.length > 3 ? 'High' : holdings.length > 0 ? 'Moderate' : 'All Cash'}
                    </span>
                  </div>
                  <div className="col-6 col-sm-4">
                    <span className="text-secondary fs-8 d-block">Cash Ratio</span>
                    <span className="text-white fw-semibold fs-7 font-mono">
                      {summary?.totalValue
                        ? `${(
                            ((user?.balance || 0) /
                              ((user?.balance || 0) + summary.totalValue)) *
                            100
                          ).toFixed(1)}%`
                        : '100%'}
                    </span>
                  </div>
                  <div className="col-12 col-sm-4">
                    <span className="text-secondary fs-8 d-block">Execution Engine</span>
                    <span className="text-success fw-semibold fs-7">Optimal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Holdings Detailed Table */}
          <Holdings holdings={holdings} />
        </>
      )}
    </div>
  );
};

export default Portfolio;
