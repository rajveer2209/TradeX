import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import {
  formatCurrency,
  formatPercent,
  formatNumber,
} from '../../utils/formatters';
import TradeModal from '../stocks/TradeModal';

const Holdings = ({ holdings = [] }) => {
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeType, setTradeType] = useState('SELL');

  const handleOpenTrade = (stock, type) => {
    setSelectedStock(stock);
    setTradeType(type);
  };

  return (
    <div className="tradex-card p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fs-6 fw-bold text-white mb-0">Open Positions</h5>
          <span className="text-secondary fs-8">
            Detailed breakdown of currently held equities
          </span>
        </div>
        <span className="badge bg-dark-surface border border-dark-subtle text-secondary font-mono px-3 py-1">
          {holdings.length} {holdings.length === 1 ? 'Position' : 'Positions'}
        </span>
      </div>

      {holdings.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-secondary fs-6 mb-3">
            You do not own any stocks yet.
          </p>
          <Link to="/stocks" className="btn btn-primary btn-sm px-4">
            Discover & Trade Stocks
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-hover tradex-table align-middle mb-0">
            <thead>
              <tr className="text-secondary fs-8 text-uppercase tracking-wider">
                <th>Asset</th>
                <th className="text-end">Shares</th>
                <th className="text-end">Avg Buy Price</th>
                <th className="text-end">Current Price</th>
                <th className="text-end">Market Value</th>
                <th className="text-end">Total P&L</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((item, idx) => {
                const stock = item.stock || item;
                const stockId = stock._id || stock.id || item.stockId;
                const symbol = stock.symbol || item.symbol || 'N/A';
                const name = stock.name || item.name || '';
                const quantity = item.quantity || item.shares || 0;
                const avgPrice = item.averageBuyPrice || item.avgPrice || item.buyPrice || 0;
                const currentPrice = stock.price || item.currentPrice || avgPrice;
                const marketValue = quantity * currentPrice;
                const costBasis = quantity * avgPrice;
                const pnl = item.pnl !== undefined ? item.pnl : marketValue - costBasis;
                const pnlPercent =
                  item.pnlPercent !== undefined
                    ? item.pnlPercent
                    : costBasis > 0
                    ? (pnl / costBasis) * 100
                    : 0;
                const isProfit = pnl >= 0;

                // Normalized stock object for TradeModal
                const stockObj = {
                  _id: stockId,
                  id: stockId,
                  symbol,
                  name,
                  price: currentPrice,
                };

              return (
                <tr key={stockId || idx}>
                  <td>
                    <Link
                      to={`/stocks/${stockId}`}
                      className="text-decoration-none text-white d-flex align-items-center gap-2 group-hover-primary"
                    >
                      <div className="stock-avatar-badge fs-8">{symbol.slice(0, 2)}</div>
                      <div>
                        <div className="fw-bold font-mono text-white mb-0">{symbol}</div>
                        <div className="text-secondary fs-8 text-truncate" style={{ maxWidth: '140px' }}>
                          {name}
                        </div>
                      </div>
                    </Link>
                  </td>

                  <td className="text-end font-mono text-white fw-semibold">
                    {formatNumber(quantity)}
                  </td>

                  <td className="text-end font-mono text-secondary">
                    {formatCurrency(avgPrice)}
                  </td>

                  <td className="text-end font-mono text-white fw-bold">
                    {formatCurrency(currentPrice)}
                  </td>

                  <td className="text-end font-mono text-white fw-bold">
                    {formatCurrency(marketValue)}
                  </td>

                  <td className="text-end">
                    <div className={`font-mono fw-bold fs-7 ${isProfit ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(pnl)}
                    </div>
                    <div
                      className={`d-inline-flex align-items-center gap-1 font-mono fs-8 ${
                        isProfit ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {isProfit ? <FiTrendingUp size={11} /> : <FiTrendingDown size={11} />}
                      {formatPercent(pnlPercent)}
                    </div>
                  </td>

                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-xs btn-outline-primary fw-semibold"
                        onClick={() => handleOpenTrade(stockObj, 'BUY')}
                      >
                        Buy
                      </button>
                      <button
                        className="btn btn-xs btn-outline-danger fw-semibold"
                        onClick={() => handleOpenTrade(stockObj, 'SELL')}
                      >
                        Sell
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {selectedStock && (
        <TradeModal
          show={!!selectedStock}
          onHide={() => setSelectedStock(null)}
          stock={selectedStock}
          initialType={tradeType}
        />
      )}
    </div>
  );
};

export default Holdings;
